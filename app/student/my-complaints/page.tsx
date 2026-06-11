import { redirect } from 'next/navigation';
import { getStudentSession } from '@/lib/student-session';
import { createServerSupabase } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'My Complaints — VoiceIt Student Portal',
  description: 'Track all your submitted complaints and their status',
};

const STATUS_FILTERS = ['All', 'Pending', 'In Review', 'Resolved'];

export default async function StudentMyComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getStudentSession();
  if (!session) redirect('/student-login');

  const { status } = await searchParams;
  const activeFilter = STATUS_FILTERS.includes(status || '') ? status : 'All';

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users').select('id').eq('id', session.userId).single();
  if (!user) redirect('/student-login');

  let query = supabase
    .from('complaints')
    .select('id, title, description, status, category, created_at, is_read, admin_reply, ai_reply, image_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (activeFilter && activeFilter !== 'All') {
    query = query.eq('status', activeFilter);
  }

  const { data: complaints } = await query;
  const { count: total } = await supabase
    .from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

  const STATUS_DOT: Record<string, string> = {
    Pending: 'bg-amber-500',
    'In Review': 'bg-blue-500',
    Resolved: 'bg-emerald-500',
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">My Complaints</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            {(total ?? 0) > 0 ? `${total} complaint${(total ?? 0) !== 1 ? 's' : ''} submitted` : 'No complaints yet'}
          </p>
        </div>
        <Link
          href="/student/complaints/new"
          id="student-my-complaints-new"
          className="shrink-0 inline-flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm text-sm"
          style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          <span className="hidden sm:inline">New Complaint</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map(f => {
          const isActive = (activeFilter || 'All') === f;
          return (
            <Link
              key={f}
              href={f === 'All' ? '/student/my-complaints' : `/student/my-complaints?status=${encodeURIComponent(f)}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isActive
                  ? f === 'All' ? 'text-white border-primary shadow-sm' : 'border shadow-sm'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
              }`}
              style={isActive && f === 'All' ? { background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' } : {}}
            >
              {f !== 'All' && (
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[f]} ${!isActive ? 'opacity-40' : ''}`} />
              )}
              {f}
            </Link>
          );
        })}
      </div>

      {/* Complaints list */}
      {!complaints?.length ? (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 block mb-3">inbox</span>
          <p className="text-on-surface font-medium mb-1">
            {activeFilter !== 'All' ? `No ${activeFilter} complaints` : 'No complaints yet'}
          </p>
          <p className="text-on-surface-variant text-sm mb-5">
            {activeFilter !== 'All'
              ? `You don't have any complaints with status "${activeFilter}".`
              : 'Submit your first complaint to get started.'}
          </p>
          <Link href="/student/complaints/new" className="inline-flex items-center gap-2 bg-[#1e0052] text-white font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Submit a Complaint
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map((c: any) => {
            const hasUnread = c.admin_reply && !c.is_read;
            return (
              <Link
                key={c.id}
                href={`/student/complaints/${c.id}`}
                className={`group relative rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${hasUnread ? 'border-primary/30 bg-primary/5' : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/20'}`}
              >
                {hasUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: 'linear-gradient(180deg, #3b1fa8, #7c3aed)' }} />
                )}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="font-medium text-on-surface group-hover:text-primary transition-colors text-sm">{c.title}</h2>
                        {hasUnread && (
                          <span className="inline-flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}>
                            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                            New Reply
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <StatusBadge status={c.status} size="sm" />
                        <span className="text-on-surface-variant text-[11px]">{c.category}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0">chevron_right</span>
                  </div>
                  <p className="text-on-surface-variant text-sm line-clamp-2 mb-3 leading-relaxed">{c.description}</p>
                  <p className="text-on-surface-variant text-xs">{formatDate(c.created_at)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
