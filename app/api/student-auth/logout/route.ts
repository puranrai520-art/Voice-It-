import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/student-session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(
    new URL('/student-login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  );
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
