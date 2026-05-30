import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const { type, data } = evt;

  if (type === 'user.created') {
    const supabase = createServerSupabase();
    
    // Check if this is the first user (make them admin)
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const isFirstUser = count === 0;

    const email = data.email_addresses?.[0]?.email_address || '';
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || email.split('@')[0];
    const avatar_url = data.image_url || null;

    const { error } = await supabase.from('users').insert({
      clerk_id: data.id,
      email,
      name,
      avatar_url,
      role: isFirstUser ? 'admin' : 'student',
    });

    if (error) {
      console.error('Failed to create user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  }

  if (type === 'user.updated') {
    const supabase = createServerSupabase();
    const email = data.email_addresses?.[0]?.email_address || '';
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || email.split('@')[0];
    const avatar_url = data.image_url || null;

    await supabase
      .from('users')
      .update({ email, name, avatar_url })
      .eq('clerk_id', data.id);
  }

  if (type === 'user.deleted') {
    const supabase = createServerSupabase();
    await supabase.from('users').delete().eq('clerk_id', data.id);
  }

  return NextResponse.json({ success: true });
}
