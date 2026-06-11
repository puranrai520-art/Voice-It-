'use client';

import { useState, useTransition, useRef } from 'react';
import { updateComplaintStatusWithDetails } from '@/actions/complaints';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import type { Complaint } from '@/types';

const STATUSES = ['Pending', 'In Review', 'Resolved'];

const STATUS_COLORS: Record<string, string> = {
  'Pending':   'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/30 dark:text-amber-400',
  'In Review': 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700/30 dark:text-blue-400',
  'Resolved':  'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700/30 dark:text-emerald-400',
};

interface Props {
  complaint: Complaint & { user?: any };
  isAdmin: boolean;
}

export function ComplaintDetailClient({ complaint, isAdmin }: Props) {
  const [isPending, startTransition] = useTransition();
  const [replyText, setReplyText] = useState(complaint.admin_reply || '');
  const [resolutionSteps, setResolutionSteps] = useState(complaint.resolution_steps || '');
  const [activeStatus, setActiveStatus] = useState(complaint.status);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(complaint.in_review_image_url || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveReply = () => {
    startTransition(async () => {
      // Build form data for image upload if In Review
      if (activeStatus === 'In Review' && reviewImageFile) {
        const formData = new FormData();
        formData.append('complaintId', complaint.id);
        formData.append('status', activeStatus);
        formData.append('admin_reply', replyText);
        formData.append('resolution_steps', resolutionSteps);
        formData.append('in_review_image', reviewImageFile);
        const res = await fetch('/api/admin/update-complaint-status', { method: 'POST', body: formData });
        if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      } else {
        await updateComplaintStatusWithDetails(complaint.id, {
          status: activeStatus,
          admin_reply: replyText,
          resolution_steps: resolutionSteps,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status as any);
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaintId: complaint.id, title: complaint.title, description: complaint.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI analysis failed');
      if (data.suggested_reply) setReplyText(data.suggested_reply);
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (!isAdmin) {
    // ── Student: Status Timeline ──
    const currentIdx = STATUSES.indexOf(complaint.status);
    return (
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}>
            <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>timeline</span>
          </div>
          <h2 className="font-label-lg text-label-lg text-on-surface font-semibold">Resolution Timeline</h2>
        </div>

        <div className="flex items-start gap-0 w-full">
          {STATUSES.map((s, i) => {
            const isDone = i <= currentIdx;
            const isActive = s === complaint.status;
            return (
              <div key={s} className="flex items-start flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2 min-w-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${isDone ? 'shadow-md' : 'bg-surface-container-high border-2 border-outline-variant/30'} ${isActive ? 'ring-4 ring-primary/20' : ''}`}
                    style={isDone ? { background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' } : {}}
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : (
                      <span className="text-[12px] font-bold text-on-surface-variant">{i + 1}</span>
                    )}
                  </div>
                  <span className={`font-label-md text-label-md text-center leading-tight text-[11px] sm:text-[12px] ${isActive ? 'text-primary font-bold' : isDone ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    {s}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">Current</span>
                  )}
                </div>
                {i < STATUSES.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-4 sm:mt-5 mx-1 sm:mx-2 transition-all duration-500 ${i < currentIdx ? 'bg-primary' : 'bg-outline-variant/20'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className={`mt-5 p-3.5 rounded-xl border ${STATUS_COLORS[complaint.status]}`}>
          <p className="font-label-md text-label-md font-semibold mb-0.5">
            {complaint.status === 'Pending' && '⏳ Your complaint is awaiting review'}
            {complaint.status === 'In Review' && '🔍 Admin is reviewing your complaint'}
            {complaint.status === 'Resolved' && '✅ Your complaint has been resolved'}
          </p>
          <p className="font-body-md text-body-md opacity-80">
            {complaint.status === 'Pending' && "We've received your complaint and it will be reviewed shortly."}
            {complaint.status === 'In Review' && "An admin is looking into this. Check the details above for current steps."}
            {complaint.status === 'Resolved' && "This issue has been addressed. See the resolution summary above."}
          </p>
        </div>
      </div>
    );
  }

  // ── Admin View ──
  return (
    <div className="flex flex-col gap-4">

      {/* Status Selector */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5">
        <h2 className="font-label-lg text-label-lg text-on-surface font-semibold mb-3">Update Status</h2>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              id={`status-btn-${s.toLowerCase().replace(' ', '-')}`}
              onClick={() => handleStatusChange(s)}
              className={`font-label-lg text-label-lg px-4 py-2.5 rounded-xl border transition-all text-[13px] ${
                activeStatus === s
                  ? 'text-white border-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
              }`}
              style={activeStatus === s ? { background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' } : {}}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* IN REVIEW: Image upload + Steps being taken */}
      {activeStatus === 'In Review' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
            <h2 className="font-label-lg text-label-lg text-blue-800 dark:text-blue-300 font-semibold">In Review — Evidence & Steps</h2>
          </div>

          {/* Image upload */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">
              Evidence / Action Photo <span className="font-normal opacity-70">(optional)</span>
            </label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" id="review-image-upload"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setReviewImageFile(f); setReviewImagePreview(URL.createObjectURL(f)); }
              }}
            />
            {reviewImagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-blue-200 dark:border-blue-700/40">
                <img src={reviewImagePreview} alt="Evidence" className="w-full max-h-[200px] object-cover" />
                <button type="button"
                  onClick={() => { setReviewImageFile(null); setReviewImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ) : (
              <label htmlFor="review-image-upload" className="flex items-center gap-2 border-2 border-dashed border-blue-300 dark:border-blue-700/50 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-all">
                <span className="material-symbols-outlined text-[24px] text-blue-500">add_photo_alternate</span>
                <p className="text-sm text-blue-600 dark:text-blue-400">Upload evidence photo</p>
              </label>
            )}
          </div>

          {/* Steps being taken */}
          <label className="block text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">
            Steps Being Taken <span className="text-blue-600">*</span>
          </label>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={4}
            placeholder="Describe the steps being taken to resolve this complaint…"
            className="w-full bg-white dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all resize-none"
          />
        </div>
      )}

      {/* RESOLVED: Final resolution steps */}
      {activeStatus === 'Resolved' && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h2 className="font-label-lg text-label-lg text-emerald-800 dark:text-emerald-300 font-semibold">Resolution Summary</h2>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Final Resolution Steps <span className="text-emerald-600">*</span>
            </label>
            <textarea
              value={resolutionSteps}
              onChange={e => setResolutionSteps(e.target.value)}
              rows={4}
              placeholder="Outline all actions taken and the final resolution…"
              className="w-full bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Admin Summary Message
            </label>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={3}
              placeholder="Brief summary message to show the student…"
              className="w-full bg-white dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all resize-none"
            />
          </div>
        </div>
      )}

      {/* PENDING: Standard reply box */}
      {activeStatus === 'Pending' && (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-label-lg text-label-lg text-on-surface font-semibold">Admin Reply</h2>
            <button
              id="ai-analyze-btn"
              onClick={handleAIAnalyze}
              disabled={aiLoading}
              className="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-primary bg-primary-container/30 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary-container/50 transition-colors disabled:opacity-60 text-[13px]"
            >
              {aiLoading ? (
                <><span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />Analyzing…</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>AI Suggest</>
              )}
            </button>
          </div>

          {aiError && (
            <div className="mb-3 flex items-center gap-2 bg-error-container text-on-error-container rounded-xl px-4 py-2.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <p className="font-body-md text-body-md">{aiError}</p>
            </div>
          )}

          <textarea
            id="admin-reply-textarea"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={5}
            placeholder="Write your reply to the student…"
            className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none mb-3"
          />
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          id="save-reply-btn"
          onClick={handleSaveReply}
          disabled={isPending}
          className="inline-flex items-center gap-2 text-white font-label-lg text-label-lg px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
        >
          {isPending ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
          ) : saved ? (
            <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>Saved!</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">save</span>Save & Notify Student</>
          )}
        </button>
      </div>
    </div>
  );
}
