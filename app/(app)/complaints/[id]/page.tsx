import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { formatFullDate } from '@/lib/utils';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { PriorityStars } from '@/components/complaints/PriorityStars';
import { ComplaintDetailClient } from './ComplaintDetailClient';
import { ComplaintComments } from '@/components/complaints/ComplaintComments';
import Link from 'next/link';
import { markComplaintRead, getComplaintComments } from '@/actions/complaints';
import { StarRating } from '@/components/complaints/StarRating';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase.from('complaints').select('title').eq('id', id).single();
  return { title: data ? `${data.title} — VoiceIt` : 'Complaint — VoiceIt' };
}

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { id } = await params;

  const supabase = createServerSupabase();
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_id', userId)
    .single();

  if (!currentUser) redirect('/sign-in');

  const { data: complaint } = await supabase
    .from('complaints')
    .select('*, user:users(name, avatar_url, email)')
    .eq('id', id)
    .single();

  if (!complaint) notFound();

  // Students can only view their own complaints
  if (currentUser.role !== 'admin' && complaint.user_id !== currentUser.id) {
    redirect('/my-complaints');
  }

  // Mark as read if student opens a complaint with admin reply
  if (currentUser.role !== 'admin' && complaint.admin_reply && !complaint.is_read) {
    await markComplaintRead(id);
  }

  // Fetch resolution timeline comments
  const comments = await getComplaintComments(id);

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full">
      {/* Back */}
      <Link
        href={isAdmin ? '/admin' : '/my-complaints'}
        className="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors mb-5"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        {isAdmin ? 'All Complaints' : 'My Complaints'}
      </Link>

      {/* Header */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{complaint.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={complaint.status} size="md" showIcon />
              <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">category</span>
                {complaint.category}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {formatFullDate(complaint.created_at)}
              </span>
            </div>
          </div>
          {complaint.priority && (
            <div className="shrink-0">
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Priority</p>
              <PriorityStars priority={complaint.priority} size="md" />
            </div>
          )}
        </div>

        {/* Student info (admin only) */}
        {isAdmin && complaint.user && (
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant/20">
            {complaint.user.avatar_url ? (
              <img src={complaint.user.avatar_url} alt={complaint.user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[11px]">
                {complaint.user.name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
            <div>
              <p className="font-label-lg text-label-lg text-on-surface">{complaint.user.name}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{complaint.user.email}</p>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap">
          {complaint.description}
        </p>

        {/* Image attachment */}
        {complaint.image_url && (
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">image</span>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Attached Photo</p>
            </div>
            <a
              href={complaint.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high cursor-zoom-in"
            >
              <img
                src={complaint.image_url}
                alt="Complaint attachment"
                className="w-full max-h-[420px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">open_in_full</span>
                  View full image
                </div>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* AI Reply Box */}
      {complaint.ai_reply && (
        <div className="bg-primary-container/20 border border-primary/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            <p className="font-label-lg text-label-lg text-primary">AI Suggested Reply</p>
          </div>
          <p className="font-body-md text-body-md text-on-surface leading-relaxed">{complaint.ai_reply}</p>
        </div>
      )}

      {/* Admin Reply (student view) */}
      {!isAdmin && complaint.admin_reply && (
        <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#1e0052] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <p className="font-label-lg text-label-lg text-on-surface">Admin Response</p>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap">
            {complaint.admin_reply}
          </p>
        </div>
      )}

      {/* Resolution Timeline (visible to both, admin can add notes) */}
      <div className="mb-4">
        <ComplaintComments
          complaintId={complaint.id}
          comments={comments}
          isAdmin={isAdmin}
        />
      </div>

      {/* Star Rating — only for students on resolved complaints */}
      {!isAdmin && complaint.status === 'Resolved' && (
        <StarRating
          complaintId={complaint.id}
          currentRating={complaint.rating ?? null}
          isResolved={true}
        />
      )}

      {/* Interactive section (admin controls / status timeline) */}
      <ComplaintDetailClient
        complaint={complaint}
        isAdmin={isAdmin}
      />
    </div>
  );
}
