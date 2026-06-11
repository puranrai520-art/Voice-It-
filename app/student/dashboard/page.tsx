import { redirect } from 'next/navigation';
import { getStudentSession } from '@/lib/student-session';
import { createServerSupabase } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard — VoiceIt Student Portal',
  description: 'Your complaint overview and recent activity',
};

export default async function StudentDashboardPage() {
  const session = await getStudentSession();
  if (!session) redirect('/student-login');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, student_id, student_details, branch, semester')
    .eq('id', session.userId)
    .single();

  if (!user) redirect('/student-login');

  // Stats
  const [
    { count: totalCount },
    { count: pendingCount },
    { count: reviewCount },
    { count: resolvedCount },
    { data: recentComplaints },
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Pending'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'In Review'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Resolved'),
    supabase.from('complaints').select('id, title, description, status, category, created_at, is_read, admin_reply').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ]);

  const displayName = user.name || user.student_id || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Pending', value: pendingCount ?? 0, icon: 'pending_actions', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', href: '/student/my-complaints?status=Pending' },
    { label: 'In Review', value: reviewCount ?? 0, icon: 'rate_review', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', href: '/student/my-complaints?status=In+Review' },
    { label: 'Resolved', value: resolvedCount ?? 0, icon: 'check_circle', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', href: '/student/my-complaints?status=Resolved' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#1e0052] via-[#2d0074] to-[#3b1fa8] rounded-3xl p-6 md:p-8 mb-6 overflow-hidden shadow-lg">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative">
          <div
            className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/30 text-white flex items-center justify-center font-bold text-[22px] mb-4 shadow-lg"
          >
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <p className="text-white/60 text-sm mb-1">{greeting},</p>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 flex-wrap">
            {displayName}
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              Student
            </span>
          </h1>
          <p className="text-white/50 text-sm">{totalCount ?? 0} complaint{(totalCount ?? 0) !== 1 ? 's' : ''} submitted</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <Link href="/student/complaints/new" className="inline-flex items-center gap-2 bg-white text-[#1e0052] font-semibold px-4 py-2.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-md text-sm">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              New Complaint
            </Link>
            <Link href="/student/my-complaints" className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/20 px-4 py-2.5 rounded-xl hover:bg-white/25 active:scale-[0.98] transition-all text-sm">
              <span className="material-symbols-outlined text-[18px]">assignment</span>
              My Complaints
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className={`group bg-surface-container-low border ${stat.border} rounded-2xl p-3 sm:p-4 hover:shadow-md transition-all active:scale-[0.98]`}>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
              <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="text-[22px] sm:text-[26px] font-bold text-on-surface leading-none mb-1">{stat.value}</p>
            <p className="text-on-surface-variant text-[10px] sm:text-[12px] font-medium">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Recent Activity</h2>
          <Link href="/student/my-complaints" className="text-sm text-primary hover:underline font-medium">View all →</Link>
        </div>

        {!recentComplaints?.length ? (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-10 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 block mb-3">inbox</span>
            <p className="text-on-surface font-medium mb-1">No complaints yet</p>
            <p className="text-on-surface-variant text-sm mb-5">Submit your first complaint and track its progress here.</p>
            <Link href="/student/complaints/new" className="inline-flex items-center gap-2 bg-[#1e0052] text-white font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm text-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Submit a Complaint
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentComplaints.map((complaint: any) => {
              const hasUnread = complaint.admin_reply && !complaint.is_read;
              return (
                <Link key={complaint.id} href={`/student/complaints/${complaint.id}`} className={`group relative bg-surface-container-low border rounded-2xl p-5 hover:shadow-md transition-all ${hasUnread ? 'border-primary/30 bg-primary/5' : 'border-outline-variant/20 hover:border-primary/20'}`}>
                  {hasUnread && <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full" />}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-on-surface group-hover:text-primary transition-colors text-sm">{complaint.title}</h3>
                        <StatusBadge status={complaint.status} size="sm" />
                        {hasUnread && <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">New Reply</span>}
                      </div>
                      <p className="text-on-surface-variant text-sm line-clamp-1 mb-2">{complaint.description}</p>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-on-surface-variant">
                        <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[11px]">category</span>{complaint.category}</span>
                        <span>·</span>
                        <span>{formatDate(complaint.created_at)}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0 mt-1">chevron_right</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
