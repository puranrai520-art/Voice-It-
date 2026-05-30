'use client';

import { useState, useTransition } from 'react';
import { saveAdminReply, updateComplaintStatus } from '@/actions/complaints';
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
  const [activeStatus, setActiveStatus] = useState(complaint.status);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSaveReply = () => {
    startTransition(async () => {
      await saveAdminReply(complaint.id, replyText, activeStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
        body: JSON.stringify({
          complaintId: complaint.id,
          title: complaint.title,
          description: complaint.description,
        }),
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
    // ── Student: Premium Status Timeline ──
    const currentIdx = STATUSES.indexOf(complaint.status);
    return (
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
          >
            <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              timeline
            </span>
          </div>
          <h2 className="font-label-lg text-label-lg text-on-surface font-semibold">Resolution Timeline</h2>
        </div>

        {/* Timeline */}
        <div className="flex items-start gap-0 w-full">
          {STATUSES.map((s, i) => {
            const isDone = i <= currentIdx;
            const isActive = s === complaint.status;
            return (
              <div key={s} className="flex items-start flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2 min-w-0">
                  {/* Circle */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? 'shadow-md'
                        : 'bg-surface-container-high border-2 border-outline-variant/30'
                    } ${isActive ? 'ring-4 ring-primary/20' : ''}`}
                    style={isDone ? { background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' } : {}}
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    ) : (
                      <span className="text-[12px] font-bold text-on-surface-variant">{i + 1}</span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`font-label-md text-label-md text-center leading-tight text-[11px] sm:text-[12px] ${
                      isActive ? 'text-primary font-bold' : isDone ? 'text-on-surface' : 'text-on-surface-variant'
                    }`}
                  >
                    {s}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Current
                    </span>
                  )}
                </div>
                {/* Connector line */}
                {i < STATUSES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mt-4 sm:mt-5 mx-1 sm:mx-2 transition-all duration-500 ${
                      i < currentIdx ? 'bg-primary' : 'bg-outline-variant/20'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current status description */}
        <div className={`mt-5 p-3.5 rounded-xl border ${STATUS_COLORS[complaint.status]}`}>
          <p className="font-label-md text-label-md font-semibold mb-0.5">
            {complaint.status === 'Pending' && '⏳ Your complaint is awaiting review'}
            {complaint.status === 'In Review' && '🔍 Admin is reviewing your complaint'}
            {complaint.status === 'Resolved' && '✅ Your complaint has been resolved'}
          </p>
          <p className="font-body-md text-body-md opacity-80">
            {complaint.status === 'Pending' && 'We\'ve received your complaint and it will be reviewed shortly.'}
            {complaint.status === 'In Review' && 'An admin is looking into this. You\'ll be notified when there\'s a response.'}
            {complaint.status === 'Resolved' && 'This issue has been addressed. Please rate your experience below.'}
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

      {/* Admin Reply Box */}
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
              <>
                <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                AI Suggest
              </>
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
          onChange={(e) => setReplyText(e.target.value)}
          rows={5}
          placeholder="Write your reply to the student…"
          className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none mb-3"
        />

        <div className="flex gap-3 justify-end">
          <button
            id="save-reply-btn"
            onClick={handleSaveReply}
            disabled={isPending || !replyText.trim()}
            className="inline-flex items-center gap-2 text-white font-label-lg text-label-lg px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Saved!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Send Reply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
