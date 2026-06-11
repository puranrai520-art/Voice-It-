import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { UserRoleClient } from './UserRoleClient';
import { CreateStudentButton } from './CreateStudentButton';
import Link from 'next/link';

export const metadata = {
  title: 'User Management — VoiceIt',
  description: 'Manage user roles and permissions',
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

  // Only show: admins + students created by admin (have a student_id).
  // This excludes any Clerk self-signup accounts that were not created by admin.
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, clerk_id, name, email, avatar_url, role, created_at, student_id')
    .order('created_at', { ascending: true });

  const users = allUsers?.filter((u: any) =>
    u.role === 'admin' || (u.role === 'student' && u.student_id)
  ) ?? [];

  const adminCount = users.filter((u: any) => u.role === 'admin').length;
  const studentCount = users.filter((u: any) => u.role === 'student').length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden xs:inline">Back to Admin</span>
            </Link>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">User Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Showing admin + students created by admin only
          </p>
        </div>
        {/* Stats chips + Create Student button */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-label-md text-label-md px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            {adminCount} Admin{adminCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface font-label-md text-label-md px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            {studentCount} Student{studentCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface-variant font-label-md text-label-md px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">group</span>
            {users?.length ?? 0} Total
          </span>
          <CreateStudentButton />
        </div>
      </div>

      {/* ---- User Cards (Mobile) / Table (Desktop) ---- */}

      {/* Mobile Card View (hidden on md+) */}
      <div className="md:hidden flex flex-col gap-3">
        {users?.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-10 text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2 block">group_off</span>
            <p className="font-body-md text-body-md text-on-surface-variant">No users found</p>
          </div>
        ) : (
          users?.map((user: any) => (
            <div
              key={user.id}
              className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 flex flex-col gap-3"
            >
              {/* User Info Row */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-outline-variant/30 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[13px] shrink-0 border-2 border-outline-variant/20">
                    {user.name?.slice(0, 2).toUpperCase() || 'US'}
                  </div>
                )}
                {/* Name & Email */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-label-lg text-label-lg text-on-surface truncate">
                      {user.name || '—'}
                    </span>
                    {user.clerk_id === userId && (
                      <span className="text-[10px] font-semibold bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded-full border border-outline-variant/30">
                        You
                      </span>
                    )}
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant truncate text-[12px] mt-0.5">
                    {user.email}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant text-[11px] mt-0.5">
                    Joined {formatDate(user.created_at)}
                  </p>
                </div>
              </div>

              {/* Role Action Row */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <span className="font-label-md text-label-md text-on-surface-variant text-[12px]">Role</span>
                <UserRoleClient
                  userId={user.id}
                  currentRole={user.role}
                  isSelf={user.clerk_id === userId}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container">
                <th className="text-left px-5 py-3.5 font-label-lg text-label-lg text-on-surface-variant">User</th>
                <th className="text-left px-5 py-3.5 font-label-lg text-label-lg text-on-surface-variant">Email</th>
                <th className="text-left px-5 py-3.5 font-label-lg text-label-lg text-on-surface-variant hidden lg:table-cell">Student ID</th>
                <th className="text-left px-5 py-3.5 font-label-lg text-label-lg text-on-surface-variant hidden lg:table-cell">Joined</th>
                <th className="text-left px-5 py-3.5 font-label-lg text-label-lg text-on-surface-variant">Role</th>
              </tr>
            </thead>
            <tbody>
              {users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2 block">group_off</span>
                    <p className="font-body-md text-body-md text-on-surface-variant">No admin-created students yet. Use "Create Student" to add one.</p>
                  </td>
                </tr>
              ) : (
                users?.map((user: any) => (
                  <tr key={user.id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-outline-variant/20 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[11px] shrink-0">
                            {user.name?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-label-lg text-label-lg text-on-surface">
                              {user.name || '—'}
                            </span>
                            {user.clerk_id === userId && (
                              <span className="text-[10px] font-semibold bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full border border-outline-variant/30">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-body-md text-body-md text-on-surface-variant text-[13px]">{user.email}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {user.student_id ? (
                        <span className="font-mono text-[12px] bg-surface-container px-2 py-1 rounded-lg text-on-surface border border-outline-variant/20">
                          {user.student_id}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant text-[12px] italic">Admin account</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="font-body-md text-body-md text-on-surface-variant text-[13px]">{formatDate(user.created_at)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <UserRoleClient
                        userId={user.id}
                        currentRole={user.role}
                        isSelf={user.clerk_id === userId}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help text */}
      <p className="font-body-md text-body-md text-on-surface-variant text-[12px] mt-4 text-center">
        Only admin-created students are listed here. Clerk sign-up accounts are not shown.
      </p>
    </div>
  );
}
