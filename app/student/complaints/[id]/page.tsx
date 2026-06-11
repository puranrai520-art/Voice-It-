import { redirect, notFound } from 'next/navigation';
import { getStudentSession } from '@/lib/student-session';
import { createServerSupabase } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { formatFullDate } from '@/lib/utils';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase.from('complaints').select('title').eq('id', id).single();
  return { title: data ? `${data.title} — VoiceIt` : 'Complaint — VoiceIt' };
}

export default async function StudentComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getStudentSession();
  if (!session) redirect('/student-login');

  const { id } = await params;
  const supabase = createServerSupabase();

  // Verify user
  const { data: user } = await supabase
    .from('users').select('id').eq('id', session.userId).single();
  if (!user) redirect('/student-login');

  // Fetch complaint (only own)
  const { data: complaint } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!complaint) notFound();

  // Mark as read
  if (complaint.admin_reply && !complaint.is_read) {
    await supabase.from('complaints').update({ is_read: true }).eq('id', id);
  }

  const status = complaint.status as string;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full">

      {/* Back */}
      <Link
        href="/student/my-complaints"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-5"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        My Complaints
      </Link>

      {/* Header card */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-on-surface mb-2">{complaint.title}</h1>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <StatusBadge status={complaint.status} size="md" showIcon />
              <span className="inline-flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">category</span>
                {complaint.category}
              </span>
              <span className="text-on-surface-variant">{formatFullDate(complaint.created_at)}</span>
            </div>
          </div>
        </div>

        <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{complaint.description}</p>

        {/* Student's own image (if any) */}
        {complaint.image_url && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">image</span>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Attached Photo</p>
            </div>
            <a href={complaint.image_url} target="_blank" rel="noopener noreferrer"
              className="block overflow-hidden rounded-2xl border border-outline-variant/20 cursor-zoom-in group"
            >
              <img src={complaint.image_url} alt="Complaint attachment" className="w-full max-h-[340px] object-cover group-hover:scale-[1.02] transition-transform duration-300" />
            </a>
          </div>
        )}
      </div>

      {/* ── STATUS-SPECIFIC CONTENT ── */}

      {/* PENDING: AI auto-reply */}
      {status === 'Pending' && complaint.ai_reply && (
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/40 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <p className="font-semibold text-sm text-violet-800 dark:text-violet-300">AI Assistant Response</p>
            <span className="text-[10px] font-bold bg-violet-100 dark:bg-violet-800/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-700/30">Auto-generated</span>
          </div>
          <p className="text-on-surface text-sm leading-relaxed">{complaint.ai_reply}</p>
          <p className="text-on-surface-variant text-xs mt-3 italic">Your complaint is being reviewed by the administration. We'll update you soon.</p>
        </div>
      )}

      {status === 'Pending' && !complaint.ai_reply && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            <div>
              <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">Complaint Received</p>
              <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">Your complaint has been submitted and is awaiting review by the administration.</p>
            </div>
          </div>
        </div>
      )}

      {/* IN REVIEW: Admin image + steps */}
      {status === 'In Review' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
            </div>
            <p className="font-semibold text-sm text-blue-800 dark:text-blue-300">Under Review — Steps Being Taken</p>
          </div>

          {/* Admin-uploaded image for In Review */}
          {complaint.in_review_image_url && (
            <div className="mb-4">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-2">Evidence / Action Photo</p>
              <a href={complaint.in_review_image_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-blue-200 dark:border-blue-700/40 cursor-zoom-in group">
                <img src={complaint.in_review_image_url} alt="In review evidence" className="w-full max-h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              </a>
            </div>
          )}

          {/* Steps being taken */}
          {complaint.admin_reply && (
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-2">Steps Being Taken</p>
              <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{complaint.admin_reply}</p>
            </div>
          )}

          {!complaint.admin_reply && !complaint.in_review_image_url && (
            <p className="text-blue-700 dark:text-blue-400 text-sm">The administration is actively working on your complaint. Details will appear here once available.</p>
          )}
        </div>
      )}

      {/* RESOLVED: Final resolution */}
      {status === 'Resolved' && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <p className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Complaint Resolved</p>
          </div>

          {complaint.resolution_steps && (
            <div className="mb-4">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">Final Resolution Steps</p>
              <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{complaint.resolution_steps}</p>
            </div>
          )}

          {complaint.admin_reply && (
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-2">Admin Summary</p>
              <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{complaint.admin_reply}</p>
            </div>
          )}

          {!complaint.resolution_steps && !complaint.admin_reply && (
            <p className="text-emerald-700 dark:text-emerald-400 text-sm">Your complaint has been successfully resolved.</p>
          )}
        </div>
      )}
    </div>
  );
}
