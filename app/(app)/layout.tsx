import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { getUnreadCount } from '@/actions/complaints';

import { SidebarProvider } from '@/components/layout/SidebarProvider';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  let user: any = null;

  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();
    user = data;

    // Auto-create user if webhook hasn't fired (e.g. CLERK_WEBHOOK_SECRET not configured)
    if (!user) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email.split('@')[0];
        const avatar_url = clerkUser.imageUrl || null;

        // Admin email always gets admin role; otherwise first-ever user gets admin
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        const isAdminEmail = ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL;
        // Fix: explicitly check count is exactly 0, not null (null means DB error)
        const role = (isAdminEmail || count === 0) ? 'admin' : 'student';

        const { data: newUser } = await supabase
          .from('users')
          .insert({ clerk_id: userId, email, name, avatar_url, role })
          .select()
          .single();

        user = newUser;
      }
    }

    // If user exists but their email matches ADMIN_EMAIL and they are not yet admin, promote them
    if (user && ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL && user.role !== 'admin') {
      await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('clerk_id', userId);
      user = { ...user, role: 'admin' };
    }
  } catch (err) {
    // DB is likely paused (Supabase free-tier). Show a friendly error instead of crashing.
    console.error('[AppLayout] Database error:', err);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-amber-600">cloud_off</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Service Temporarily Unavailable</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            The database is waking up. This usually takes 5–10 seconds. Please refresh the page.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#1e0052] text-white font-label-lg text-label-lg px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Retry
          </a>
        </div>
      </div>
    );
  }

  // If still no user after all attempts, redirect to sign-in
  if (!user) redirect('/sign-in');

  const unreadCount = user?.role === 'student' ? await getUnreadCount(userId) : 0;

  return (
    <SidebarProvider>
      <DashboardShell
        sidebar={
          <Sidebar
            role={user?.role}
            unreadCount={unreadCount}
            userName={user?.name}
            userAvatar={user?.avatar_url}
            userEmail={user?.email}
          />
        }
        mobileTopBar={
          <MobileTopBar
            role={user?.role}
            unreadCount={unreadCount}
            userName={user?.name}
            userAvatar={user?.avatar_url}
            userEmail={user?.email}
          />
        }
        mobileBottomNav={<MobileBottomNav role={user?.role} />}
      >
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}

