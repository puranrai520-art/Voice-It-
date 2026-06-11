import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { StudentSession } from '@/types';

const COOKIE_NAME = 'student-session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.STUDENT_SESSION_SECRET || 'voiceit-student-secret-change-in-production'
);
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

/** Sign a student session JWT and return the token string */
export async function signStudentSession(payload: StudentSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

/** Verify and decode the student session JWT */
export async function verifyStudentSession(token: string): Promise<StudentSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as StudentSession;
  } catch {
    return null;
  }
}

/** Read the student session from the current request's cookies (server-only) */
export async function getStudentSession(): Promise<StudentSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyStudentSession(token);
  } catch {
    return null;
  }
}

export { COOKIE_NAME, SESSION_DURATION };
