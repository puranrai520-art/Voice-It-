import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

// Admin layout — triple-layer protection:
// 1. Middleware (proxy.ts) blocks unauthenticated users
// 2. This layout checks Supabase DB role
// 3. Each admin page also checks role individually
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (user?.role !== 'admin') {
    // Non-admins see 403 page
    redirect('/403');
  }

  return <>{children}</>;
}
