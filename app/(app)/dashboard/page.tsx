import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { getGreeting, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import Link from 'next/link';
import type { Complaint } from '@/types';

export const metadata = {
  title: 'Dashboard — VoiceIt',
  description: 'Overview of your complaints and activity',
};

function ProfileCompleteness({ user }: { user: any }) {
  const checks = [
    {
      label: 'Upload profile photo',
      done: !!user.avatar_url,
      icon: 'photo_camera',
    },
    {
      label: 'Set your display name',
      done: !!user.name,
      icon: 'badge',
    },
    {
      label: user.role === 'admin' ? 'Add staff details' : 'Add student details',
      done: user.role === 'admin'
        ? !!user.teacher_details?.department
        : !!user.student_details?.roll_number,
      icon: user.role === 'admin' ? 'work' : 'school',
    },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const pct = Math.round((completedCount / checks.length) * 100);
  if (pct === 100) return null;

  // Circular progress SVG
  const r = 20;
  const circ = 2 * Math.PI * r;
  const strokeOffset = circ - (pct / 100) * circ;

  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border border-violet-200/60 dark:border-violet-800/30 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 dark:from-[#1a0044]/70 dark:via-[#200055]/60 dark:to-[#2d0080]/50 shadow-sm">
      {/* Decorative blobs */}
      <div className="absolute -top-8 -right-8 w-28 h-28 bg-violet-400/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-indigo-400/8 rounded-full pointer-events-none" />

      <div className="relative p-4 sm:p-5">

        {/* ── Header: ring + title + CTA button ── */}
        <div className="flex items-center gap-3 mb-4">

          {/* Circular SVG progress ring */}
          <div className="relative shrink-0 w-[56px] h-[56px]">
            <svg className="w-[56px] h-[56px] -rotate-90" viewBox="0 0 48 48">
              {/* Track */}
              <circle cx="24" cy="24" r={r} fill="none" stroke="#c4b5fd" strokeWidth="4" opacity="0.35" />
              {/* Progress arc */}
              <circle
                cx="24" cy="24" r={r}
                fill="none"
                stroke="url(#profGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)' }}
              />
              <defs>
                <linearGradient id="profGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b1fa8" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            {/* Percentage label inside ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[13px] font-extrabold text-[#3b1fa8] dark:text-violet-300 leading-none">
                {pct}%
              </span>
            </div>
          </div>

          {/* Title & subtitle */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px] sm:text-[15px] text-[#1e0052] dark:text-violet-100 leading-snug">
              Complete your profile
            </p>
            <p className="text-[11px] sm:text-[12px] text-indigo-500/80 dark:text-violet-400/80 mt-0.5">
              {checks.length - completedCount} step{checks.length - completedCount !== 1 ? 's' : ''} remaining
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/settings"
            id="profile-complete-settings-btn"
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#1e0052] hover:bg-[#3b1fa8] text-white text-[11px] sm:text-[12px] font-semibold px-3 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              manage_accounts
            </span>
            <span>Setup</span>
          </Link>
        </div>

        {/* ── Steps list ── */}
        <div className="flex flex-col gap-2">
          {checks.map((c) => (
            <div
              key={c.label}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 border transition-colors ${
                c.done
                  ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200/70 dark:border-emerald-700/30'
                  : 'bg-white/70 dark:bg-white/5 border-violet-200/50 dark:border-violet-700/20'
              }`}
            >
              {/* Step icon bubble */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  c.done
                    ? 'bg-emerald-500'
                    : 'bg-violet-100 dark:bg-violet-900/40'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[14px] ${
                    c.done ? 'text-white' : 'text-[#3b1fa8] dark:text-violet-300'
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {c.done ? 'check' : c.icon}
                </span>
              </div>

              {/* Label */}
              <p
                className={`flex-1 min-w-0 text-[12px] sm:text-[13px] font-medium truncate ${
                  c.done
                    ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-60'
                    : 'text-[#1e0052] dark:text-violet-100'
                }`}
              >
                {c.label}
              </p>

              {/* Status badge */}
              {c.done ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full shrink-0">
                  Done
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-100/80 dark:bg-violet-900/30 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  Pending
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}


export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (!user) redirect('/sign-in');

  const isAdmin = user.role === 'admin';

  // Fetch recent complaints
  let complaintsQuery = supabase
    .from('complaints')
    .select('*, user:users(name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!isAdmin) {
    complaintsQuery = complaintsQuery.eq('user_id', user.id);
  }
  const { data: recentComplaints } = await complaintsQuery;

  // Fetch stats
  const [
    { count: pendingCount },
    { count: reviewCount },
    { count: resolvedCount },
    { count: totalCount },
  ] = await Promise.all([
    isAdmin
      ? supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
      : supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Pending'),
    isAdmin
      ? supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'In Review')
      : supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'In Review'),
    isAdmin
      ? supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Resolved')
      : supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Resolved'),
    isAdmin
      ? supabase.from('complaints').select('*', { count: 'exact', head: true })
      : supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  // Unread count for student
  const { count: unreadCount } = isAdmin
    ? { count: 0 }
    : await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('admin_reply', 'is', null)
        .eq('is_read', false);

  const greeting = getGreeting();
  const displayName = user.name || user.email.split('@')[0];

  const stats = [
    {
      label: 'Pending',
      value: pendingCount ?? 0,
      icon: 'pending_actions',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-200 dark:border-amber-500/20',
      href: isAdmin ? '/admin?status=Pending' : '/my-complaints?status=Pending',
    },
    {
      label: 'In Review',
      value: reviewCount ?? 0,
      icon: 'rate_review',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20',
      href: isAdmin ? '/admin?status=In+Review' : '/my-complaints?status=In+Review',
    },
    {
      label: 'Resolved',
      value: resolvedCount ?? 0,
      icon: 'check_circle',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      href: isAdmin ? '/admin?status=Resolved' : '/my-complaints?status=Resolved',
    },
  ];

  return (
    <div className="p-4 sm:p-5 md:p-8 max-w-4xl mx-auto w-full">

      {/* ── Hero Header ── */}
      <div className="relative bg-gradient-to-br from-[#1e0052] via-[#2d0074] to-[#3b1fa8] rounded-3xl p-6 md:p-8 mb-6 overflow-hidden shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-24 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative flex items-center gap-4">
          {/* Avatar */}
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-4 border-white/20 shadow-lg shrink-0"
            />
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/15 border-2 border-white/30 text-white flex items-center justify-center font-bold text-[22px] shrink-0 shadow-lg backdrop-blur-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-label-lg text-label-lg text-white/60 mb-0.5">{greeting},</p>
            <h1 className="font-headline-lg text-headline-lg text-white font-bold truncate flex items-center gap-2 flex-wrap">
              {displayName}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                  <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                  <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                  Student
                </span>
              )}
            </h1>
            {/* Email display */}
            <p className="text-[11px] text-white/50 mt-0.5 truncate">{user.email}</p>
            <p className="font-body-md text-body-md text-white/60 mt-1">
              {totalCount ?? 0} complaint{(totalCount ?? 0) !== 1 ? 's' : ''} submitted
              {!isAdmin && (unreadCount ?? 0) > 0 && (
                <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  {unreadCount} new reply
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          <Link
            href="/complaints/new"
            id="dashboard-new-complaint"
            className="inline-flex items-center gap-2 bg-white text-[#1e0052] font-label-lg text-label-lg px-4 py-2.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-md font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            New Complaint
          </Link>
          <Link
            href={isAdmin ? '/admin' : '/my-complaints'}
            className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/20 font-label-lg text-label-lg px-4 py-2.5 rounded-xl hover:bg-white/25 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            {isAdmin ? 'All Complaints' : 'My Complaints'}
          </Link>
          {!isAdmin && (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/20 font-label-lg text-label-lg px-4 py-2.5 rounded-xl hover:bg-white/25 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              My Profile
            </Link>
          )}
        </div>
      </div>

      {/* ── Profile Completeness (student only) ── */}
      {!isAdmin && <ProfileCompleteness user={user} />}

      {/* ── Unread replies banner (student only) ── */}
      {!isAdmin && (unreadCount ?? 0) > 0 && (
        <Link
          href="/my-complaints"
          className="flex items-center gap-3 bg-[#1e0052]/8 border border-[#1e0052]/20 rounded-2xl px-5 py-4 mb-6 hover:bg-[#1e0052]/12 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-[#1e0052] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-lg text-label-lg text-on-surface">
              You have <strong>{unreadCount}</strong> new admin {(unreadCount ?? 0) === 1 ? 'reply' : 'replies'}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Click to view your complaints and read the response
            </p>
          </div>
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-[#1e0052] transition-colors">chevron_right</span>
        </Link>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 xs:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group bg-surface-container-low border ${stat.border} rounded-2xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-all active:scale-[0.98]`}
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
              <span
                className={`material-symbols-outlined text-[18px] sm:text-[20px] ${stat.color}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {stat.icon}
              </span>
            </div>
            <p className="text-[22px] sm:text-[26px] md:text-[30px] font-bold text-on-surface leading-none mb-1">
              {stat.value}
            </p>
            <p className="font-label-md text-label-md text-on-surface-variant text-[10px] sm:text-[12px]">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h2>
          <Link
            href={isAdmin ? '/admin' : '/my-complaints'}
            className="font-label-lg text-label-lg text-[#1e0052] hover:underline"
          >
            View all →
          </Link>
        </div>

        {!recentComplaints?.length ? (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#1e0052]/8 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px] text-[#1e0052]/60">inbox</span>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface mb-1">No complaints yet</p>
            <p className="font-body-md text-body-md text-on-surface-variant mb-5">
              Submit your first complaint and track its progress here.
            </p>
            <Link
              href="/complaints/new"
              className="inline-flex items-center gap-2 bg-[#1e0052] text-white font-label-lg text-label-lg px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentComplaints.map((complaint: any) => {
              const hasUnread = complaint.admin_reply && !complaint.is_read;
              return (
                <Link
                  key={complaint.id}
                  href={`/complaints/${complaint.id}`}
                  className={`group relative bg-surface-container-low border rounded-2xl p-5 hover:shadow-md transition-all ${
                    hasUnread
                      ? 'border-[#1e0052]/30 bg-[#1e0052]/5'
                      : 'border-outline-variant/20 hover:border-[#1e0052]/20'
                  }`}
                >
                  {hasUnread && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#1e0052] rounded-full" />
                  )}

                  <div className="flex items-start gap-4">
                    {complaint.image_url && (
                      <img
                        src={complaint.image_url}
                        alt="Attachment"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-outline-variant/20"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-label-lg text-label-lg text-on-surface group-hover:text-[#1e0052] transition-colors">
                          {complaint.title}
                        </h3>
                        <StatusBadge status={complaint.status} size="sm" />
                        {hasUnread && (
                          <span className="font-label-md text-label-md bg-[#1e0052] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            New Reply
                          </span>
                        )}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mb-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
                          <span className="material-symbols-outlined text-[13px]">category</span>
                          {complaint.category}
                        </span>
                        <span className="text-outline-variant">·</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">
                          {formatDate(complaint.created_at)}
                        </span>
                        {isAdmin && complaint.user?.name && (
                          <>
                            <span className="text-outline-variant">·</span>
                            <span className="font-label-md text-label-md text-on-surface-variant">
                              {complaint.user.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-[#1e0052] transition-colors shrink-0 mt-1">
                      chevron_right
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Student info strip (student only, if details filled) ── */}
      {!isAdmin && user.student_details && (
        <div className="mt-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[18px] text-[#1e0052]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <p className="font-label-lg text-label-lg text-on-surface">Your Academic Info</p>
            <Link href="/settings" className="ml-auto font-label-md text-label-md text-[#1e0052] hover:underline text-[11px]">
              Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {user.student_details.roll_number && (
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Roll No.</p>
                <p className="font-label-lg text-label-lg text-on-surface">{user.student_details.roll_number}</p>
              </div>
            )}
            {user.student_details.course && (
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Course</p>
                <p className="font-label-lg text-label-lg text-on-surface">{user.student_details.course}</p>
              </div>
            )}
            {user.student_details.department && (
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Dept.</p>
                <p className="font-label-lg text-label-lg text-on-surface">{user.student_details.department}</p>
              </div>
            )}
            {user.student_details.year && (
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Year</p>
                <p className="font-label-lg text-label-lg text-on-surface">{user.student_details.year}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
