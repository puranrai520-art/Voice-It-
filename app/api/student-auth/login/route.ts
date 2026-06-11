import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { signStudentSession, COOKIE_NAME, SESSION_DURATION } from '@/lib/student-session';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { studentId, password } = await req.json();

    if (!studentId?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Student ID and password are required.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Look up student by student_id
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, student_id, password_hash, role')
      .eq('student_id', studentId.trim())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Sorry, we are unable to find your ID or details from our database.' },
        { status: 401 }
      );
    }

    // Must be a student role
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Sorry, we are unable to find your ID or details from our database.' },
        { status: 401 }
      );
    }

    // Must have a password hash (only admin-created students have this)
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Sorry, we are unable to find your ID or details from our database.' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Sorry, we are unable to find your ID or details from our database.' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await signStudentSession({
      userId: user.id,
      studentId: user.student_id!,
      email: user.email,
      name: user.name,
    });

    // Set secure httpOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('[student-auth/login]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
