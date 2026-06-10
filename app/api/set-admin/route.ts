import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// A simple setup endpoint protected by a secret token.
// Use: GET /api/set-admin?email=you@example.com&secret=voiceit-setup-2024
// This sets the user with that email to 'admin' role in Supabase.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const secret = searchParams.get('secret');

  // Simple secret to prevent abuse — change this if needed
  const SETUP_SECRET = process.env.SETUP_SECRET || 'voiceit-setup-2024';

  if (secret !== SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Find the user by email
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('email', email)
    .single();

  if (findError || !user) {
    // List all users to help debug
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email, name, role')
      .order('created_at', { ascending: true });

    return NextResponse.json({
      error: `User not found with email: ${email}`,
      allUsers: allUsers || [],
      hint: 'Make sure you have signed in at least once so the user record is created.',
    }, { status: 404 });
  }

  // Update to admin
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', email);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update role: ' + updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `✅ ${user.name || user.email} is now an admin!`,
    user: { ...user, role: 'admin' },
  });
}
