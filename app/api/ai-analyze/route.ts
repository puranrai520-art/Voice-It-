import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const supabase = createServerSupabase();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { complaintId, title, description } = await req.json();

    if (!complaintId || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an administrative assistant for a college complaint management system. Analyze the given complaint and respond ONLY with a valid JSON object (no markdown, no extra text) in this exact format: {"category": "Infrastructure|Academic|Administration|Hostel|Other", "priority": 1-5, "suggested_reply": "A professional, empathetic, 2-3 sentence response the admin can send to the student."}. Priority 5 = most urgent.`,
        },
        {
          role: 'user',
          content: `Title: ${title}\n\nDescription: ${description}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    let parsed: { category: string; priority: number; suggested_reply: string };
    try {
      // Remove any markdown code blocks if present
      const cleaned = content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }

    // Validate and sanitize
    const validCategories = ['Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other'];
    const category = validCategories.includes(parsed.category) ? parsed.category : 'Other';
    const priority = Math.min(5, Math.max(1, Math.round(parsed.priority)));
    const ai_reply = parsed.suggested_reply || '';

    // Save to Supabase
    const { error: updateError } = await supabase
      .from('complaints')
      .update({ priority, ai_reply, category })
      .eq('id', complaintId);

    if (updateError) {
      console.error('Failed to save AI result:', updateError);
    }

    return NextResponse.json({ category, priority, suggested_reply: ai_reply });
  } catch (err: any) {
    console.error('AI analyze error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze complaint' },
      { status: 500 }
    );
  }
}
