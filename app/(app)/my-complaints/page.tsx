import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { PriorityStars } from '@/components/complaints/PriorityStars';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { StudentAnalytics } from '@/components/student/StudentAnalytics';
import { GamificationBadges } from '@/components/student/GamificationBadges';

export const metadata = {
  title: 'My Complaints — VoiceIt',
  description: 'Track all your submitted complaints',
};

const STATUS_FILTERS = ['All', 'Pending', 'In Review', 'Resolved'];

const STATUS_CONFIG: Record<string, { dot: string; active: string }> = {
  All:       { dot: '',              active: 'text-white border-primary'  },
  Pending:   { dot: 'bg-amber-500',  active: 'text-amber-700 border-amber-400 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30' },
  'In Review':{ dot: 'bg-blue-500', active: 'text-blue-700 border-blue-400 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30' },
  Resolved:  { dot: 'bg-emerald-500', active: 'text-emerald-700 border-emerald-400 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30' },
};

export default async function MyComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { status, view } = await searchParams;
  const activeFilter = STATUS_FILTERS.includes(status || '') ? status : 'All';
  const activeView = view === 'badges' ? 'badges' : 'list';

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, role, created_at, name, email, avatar_url, student_details')
    .eq('clerk_id', userId)
    .single();

  if (!user) redirect('/sign-in');

  // All complaints for analytics (unfiltered)
  const { data: allComplaints } = await supabase
    .from('complaints')
    .select('id, status, rating, created_at')
    .eq('user_id', user.id);

  // Filtered complaints for list
  let query = supabase
    .from('complaints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (activeFilter && activeFilter !== 'All') {
    query = query.eq('status', activeFilter);
  }

  const { data: complaints } = await query;

  // Compute analytics
  const total    = allComplaints?.length ?? 0;
  const pending  = allComplaints?.filter(c => c.status === 'Pending').length ?? 0;
  const inReview = allComplaints?.filter(c => c.status === 'In Review').length ?? 0;
  const resolved = allComplaints?.filter(c => c.status === 'Resolved').length ?? 0;
  const ratings  = allComplaints?.filter(c => c.rating).map(c => c.rating!) ?? [];
  const avgRating = ratings.length ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : null;
  const hasRated  = ratings.length > 0;

  const displayName = user.name || user.email?.split('@')[0] || 'Student';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="font-headline-lg text-headline-lg text-on-surface leading-tight">My Complaints</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            {total > 0
              ? `${total} complaint${total !== 1 ? 's' : ''} submitted`
              : 'No complaints yet — submit one below'}
          </p>
        </div>
        <Link
          href="/complaints/new"
          id="my-complaints-new-btn"
          className="shrink-0 inline-flex items-center gap-2 text-white font-label-lg text-label-lg px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          <span className="hidden sm:inline">New Complaint</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* ── View Toggle (only shown when there are complaints) ── */}
      {total > 0 && (
        <div className="flex gap-2 mb-5">
          <Link
            href="/my-complaints"
            className={`inline-flex items-center gap-1.5 font-label-lg text-label-lg px-3.5 py-2 rounded-full border text-[13px] transition-all ${
              activeView === 'list'
                ? 'text-white border-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
            }`}
            style={activeView === 'list' ? { background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' } : {}}
          >
            <span className="material-symbols-outlined text-[15px]">list</span>
            Complaints
          </Link>
          <Link
            href="/my-complaints?view=badges"
            className={`inline-flex items-center gap-1.5 font-label-lg text-label-lg px-3.5 py-2 rounded-full border text-[13px] transition-all ${
              activeView === 'badges'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            Achievements
          </Link>
        </div>
      )}

      {/* ── Achievements View ── */}
      {activeView === 'badges' && total > 0 && (
        <>
          <StudentAnalytics data={{ total, pending, inReview, resolved, avgRating }} />
          <GamificationBadges
            total={total}
            resolved={resolved}
            hasRated={hasRated}
            joinedAt={user.created_at}
          />
        </>
      )}

      {/* ── List View ── */}
      {activeView === 'list' && (
        <>
          {/* Analytics strip */}
          {total > 0 && (
            <StudentAnalytics data={{ total, pending, inReview, resolved, avgRating }} />
          )}

          {/* Status filter tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {STATUS_FILTERS.map((f) => {
              const isActive = (activeFilter || 'All') === f;
              const cfg = STATUS_CONFIG[f];
              return (
                <Link
                  key={f}
                  href={f === 'All' ? '/my-complaints' : `/my-complaints?status=${encodeURIComponent(f)}`}
                  className={`inline-flex items-center gap-1.5 font-label-lg text-label-lg px-3.5 py-1.5 rounded-full border text-[12px] transition-all ${
                    isActive
                      ? f === 'All'
                        ? 'text-white border-primary shadow-sm'
                        : `${cfg.active} border shadow-sm`
                      : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
                  }`}
                  style={isActive && f === 'All' ? { background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' } : {}}
                >
                  {f !== 'All' && (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${!isActive ? 'opacity-40' : ''}`} />
                  )}
                  {f}
                </Link>
              );
            })}
          </div>

          {/* Complaints List */}
          {!complaints?.length ? (
            <EmptyState
              icon="assignment"
              title={activeFilter !== 'All' ? `No ${activeFilter} complaints` : 'No complaints yet'}
              description={
                activeFilter !== 'All'
                  ? `You have no complaints with status "${activeFilter}".`
                  : 'Submit your first complaint and track its progress here.'
              }
              actionLabel="Submit a Complaint"
              actionHref="/complaints/new"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {complaints.map((complaint: any) => {
                const hasUnread = complaint.admin_reply && !complaint.is_read;
                return (
                  <Link
                    key={complaint.id}
                    href={`/complaints/${complaint.id}`}
                    className={`relative group rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                      hasUnread
                        ? 'border-primary/30 bg-primary/5'
                        : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/20'
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {hasUnread && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ background: 'linear-gradient(180deg, #3b1fa8, #7c3aed)' }}
                      />
                    )}

                    <div className="flex flex-col sm:flex-row">
                      {/* Image thumbnail */}
                      {complaint.image_url && (
                        <div className="sm:w-28 sm:shrink-0 h-40 sm:h-auto overflow-hidden">
                          <img
                            src={complaint.image_url}
                            alt="Complaint attachment"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className={`flex-1 p-4 sm:p-5 min-w-0 ${hasUnread ? 'pl-5 sm:pl-5' : ''}`}>
                        {/* Title row */}
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h2 className="font-label-lg text-label-lg text-on-surface group-hover:text-primary transition-colors">
                                {complaint.title}
                              </h2>
                              {hasUnread && (
                                <span
                                  className="inline-flex items-center gap-1 text-white font-label-md text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
                                >
                                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                                  New Reply
                                </span>
                              )}
                            </div>
                            {/* Meta row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={complaint.status} size="sm" />
                              <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant text-[11px]">
                                <span className="material-symbols-outlined text-[11px]">category</span>
                                {complaint.category}
                              </span>
                              {complaint.complaint_type && (
                                <span className={`inline-flex items-center gap-1 font-label-md text-[10px] px-2 py-0.5 rounded-full ${
                                  complaint.complaint_type === 'staff'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                                }`}>
                                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {complaint.complaint_type === 'staff' ? 'badge' : 'school'}
                                  </span>
                                  {complaint.complaint_type === 'staff' ? 'Staff' : 'Student'}
                                </span>
                              )}
                              {complaint.image_url && (
                                <span className="inline-flex items-center gap-1 font-label-sm text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/20">
                                  <span className="material-symbols-outlined text-[10px]">image</span>
                                  Photo
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0 mt-0.5">
                            chevron_right
                          </span>
                        </div>

                        {/* Description */}
                        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
                          {complaint.description}
                        </p>

                        {/* Footer row */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-label-md text-label-md text-on-surface-variant text-[11px]">
                            {formatDate(complaint.created_at)}
                          </span>
                          <div className="flex items-center gap-2">
                            {complaint.priority && (
                              <PriorityStars priority={complaint.priority} size="sm" />
                            )}
                            {complaint.rating && (
                              <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map(n => (
                                  <span key={n} className="material-symbols-outlined text-[12px] text-amber-500"
                                    style={{ fontVariationSettings: n <= complaint.rating ? "'FILL' 1" : "'FILL' 0" }}>
                                    star
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
