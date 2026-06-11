import { NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/student-session';
import { createServerSupabase } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabase();

    // Verify student exists
    const { data: user } = await supabase
      .from('users').select('id').eq('id', session.userId).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const complaint_type = (formData.get('complaint_type') as string) || 'student';
    const imageFile = formData.get('image') as File | null;

    if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (!category?.trim()) return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    if (!description?.trim() || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters.' }, { status: 400 });
    }

    // Upload image if provided
    let image_url: string | null = null;
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image too large. Maximum size is 10 MB.' }, { status: 400 });
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Invalid image type.' }, { status: 400 });
      }
      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('complaint-images').upload(fileName, buffer, {
          contentType: imageFile.type, upsert: false, cacheControl: '3600',
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('complaint-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    // Insert complaint
    const { data: complaint, error: insertError } = await supabase
      .from('complaints')
      .insert({
        user_id: user.id,
        title: title.trim(),
        category,
        description: description.trim(),
        complaint_type,
        image_url,
        status: 'Pending',
      })
      .select()
      .single();

    if (insertError || !complaint) {
      return NextResponse.json({ error: 'Failed to submit complaint.' }, { status: 500 });
    }

    // ── Auto-generate AI reply (non-blocking) ──
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a helpful college complaint management assistant. A student has just submitted a complaint. Generate a warm, professional, and empathetic acknowledgment response (2-3 sentences) that:
1. Confirms receipt of their complaint
2. Briefly acknowledges the specific issue they raised
3. Assures them it will be reviewed by administration
Keep the tone supportive and reassuring. Do NOT mention resolution timelines. Respond ONLY with the message text, no labels or prefixes.`,
          },
          {
            role: 'user',
            content: `Complaint Title: ${title}\n\nComplaint Category: ${category}\n\nComplaint Description: ${description}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      const ai_reply = completion.choices[0]?.message?.content?.trim() || null;

      // Also determine priority + category with a second quick call
      const analysisCompletion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an administrative assistant. Analyze the complaint and respond ONLY with valid JSON (no markdown): {"priority": 1-5}. Priority 5 = most urgent.`,
          },
          {
            role: 'user',
            content: `Title: ${title}\nDescription: ${description}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 50,
      });

      let priority = 2;
      try {
        const cleaned = (analysisCompletion.choices[0]?.message?.content || '')
          .replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        priority = Math.min(5, Math.max(1, Math.round(parsed.priority)));
      } catch { /* keep default */ }

      if (ai_reply) {
        await supabase
          .from('complaints')
          .update({ ai_reply, priority })
          .eq('id', complaint.id);
      }
    } catch (aiErr) {
      console.error('[AI auto-reply error]', aiErr);
      // Non-fatal — complaint is still submitted
    }

    return NextResponse.json({ success: true, complaintId: complaint.id });
  } catch (err: any) {
    console.error('[student complaint API]', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
