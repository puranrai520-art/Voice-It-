import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Toaster } from '@/components/ui/toaster';
import { getUnreadCount } from '@/actions/complaints';

import { SidebarProvider } from '@/components/layout/SidebarProvider';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  // Auto-create user if webhook hasn't fired (e.g. CLERK_WEBHOOK_SECRET not configured)
  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email.split('@')[0];
      const avatar_url = clerkUser.imageUrl || null;

      // First ever user gets admin role
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const role = count === 0 ? 'admin' : 'student';

      const { data: newUser } = await supabase
        .from('users')
        .insert({ clerk_id: userId, email, name, avatar_url, role })
        .select()
        .single();

      user = newUser;
    }
  }

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
