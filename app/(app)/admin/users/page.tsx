import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { UserRoleClient } from './UserRoleClient';

export const metadata = {
  title: 'User Management — VoiceIt',
  description: 'Manage user roles',
};

export default async function AdminUsersPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (currentUser?.role !== 'admin') redirect('/dashboard');

  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, role, created_at')
    .order('created_at', { ascending: true });

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">User Management</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {users?.length ?? 0} registered users
        </p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left px-5 py-4 font-label-lg text-label-lg text-on-surface-variant">User</th>
                <th className="text-left px-5 py-4 font-label-lg text-label-lg text-on-surface-variant">Email</th>
                <th className="text-left px-5 py-4 font-label-lg text-label-lg text-on-surface-variant">Joined</th>
                <th className="text-left px-5 py-4 font-label-lg text-label-lg text-on-surface-variant">Role</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[11px]">
                          {user.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                      )}
                      <span className="font-label-lg text-label-lg text-on-surface">{user.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-body-md text-body-md text-on-surface-variant">{user.email}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-body-md text-body-md text-on-surface-variant">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <UserRoleClient
                      userId={user.id}
                      currentRole={user.role}
                      isSelf={user.clerk_id === userId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
