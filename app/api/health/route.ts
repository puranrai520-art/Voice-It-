import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbOk = false;
  let dbError: string | null = null;

  try {
    const supabase = createServerSupabase();
    // Lightweight ping — just count users, no data returned
    const { error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (error) {
      dbError = error.message;
    } else {
      dbOk = true;
    }
  } catch (err: any) {
    dbError = err?.message || 'Unknown error';
  }

  return NextResponse.json(
    {
      ok: dbOk,
      db: dbOk,
      error: dbError,
      timestamp: new Date().toISOString(),
      service: 'VoiceIt CMS',
    },
    {
      status: dbOk ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
