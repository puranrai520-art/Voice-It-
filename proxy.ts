import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { verifyStudentSession, COOKIE_NAME } from '@/lib/student-session';

// Routes protected by Clerk (admin flow)
const isClerkProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/my-complaints(.*)',
  '/complaints(.*)',
  '/admin(.*)',
  '/settings(.*)',
]);

// Routes protected by student session cookie
const isStudentRoute = createRouteMatcher(['/student(.*)']);

// Clerk auth pages
const isClerkAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Student login page (public)
const isStudentLoginRoute = createRouteMatcher(['/student-login(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // ── Student routes: check student-session cookie ──
  if (isStudentRoute(req) && !isStudentLoginRoute(req)) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/student-login', req.url));
    }
    const session = await verifyStudentSession(token);
    if (!session) {
      const res = NextResponse.redirect(new URL('/student-login', req.url));
      res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
      return res;
    }
    // Valid student session — allow through
    return NextResponse.next();
  }

  // ── Student login page: redirect to student dashboard if already logged in ──
  if (isStudentLoginRoute(req)) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const session = await verifyStudentSession(token);
      if (session) {
        return NextResponse.redirect(new URL('/student/dashboard', req.url));
      }
    }
    return NextResponse.next();
  }

  // ── Clerk-protected routes ──
  if (userId && isClerkAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (!userId && isClerkProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Admin routes are further protected at the page level via DB role check
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
