'use client';

import { useState, useTransition } from 'react';
import { addComplaintComment } from '@/actions/complaints';
import type { ComplaintComment } from '@/types';

const STAGE_LABELS = [
  'Under Review',
  'Investigation',
  'Escalated',
  'Action Taken',
  'Resolved',
  'Closed',
];

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  complaintId: string;
  comments: ComplaintComment[];
  isAdmin: boolean;
}

export function ComplaintComments({ complaintId, comments, isAdmin }: Props) {
  const [message, setMessage] = useState('');
  const [stageLabel, setStageLabel] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAdd = () => {
    if (!message.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await addComplaintComment(complaintId, message.trim(), stageLabel || undefined);
        setMessage('');
        setStageLabel('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (err: any) {
        setError(err.message || 'Failed to add note');
      }
    });
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined text-[18px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          timeline
        </span>
        <h2 className="font-label-lg text-label-lg text-on-surface">
          Resolution Timeline
        </h2>
        {comments.length > 0 && (
          <span className="ml-auto font-label-md text-label-md text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {comments.length} note{comments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Timeline list */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 mb-2">
            history
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            No resolution notes yet.
          </p>
          {!isAdmin && (
            <p className="font-body-sm text-body-sm text-on-surface-variant/70 mt-1">
              The admin will post updates here as your complaint progresses.
            </p>
          )}
        </div>
      ) : (
        <div className="relative pl-6 flex flex-col gap-4 mb-5">
          {/* Vertical line */}
          <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-outline-variant/30 rounded-full" />

          {comments.map((c, i) => (
            <div key={c.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-low" />

              <div className="bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/20">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {c.stage_label && (
                    <span className="font-label-md text-label-md bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-semibold">
                      {c.stage_label}
                    </span>
                  )}
                  <span className="font-label-md text-label-md text-on-surface-variant text-[11px] ml-auto">
                    {formatTime(c.created_at)}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                  {c.message}
                </p>
                {c.author?.name && (
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1.5">
                    — {c.author.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin add note form */}
      {isAdmin && (
        <div className="border-t border-outline-variant/20 pt-4 mt-2 flex flex-col gap-3">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide text-[11px]">
            Add Stage Note
          </p>

          <div className="flex gap-2 flex-wrap">
            {STAGE_LABELS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setStageLabel(stageLabel === label ? '' : label)}
                className={`font-label-md text-label-md text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  stageLabel === label
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Describe the action taken or current stage…"
            className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />

          {error && (
            <div className="flex items-center gap-2 text-error font-body-md text-body-md">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                error
              </span>
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !message.trim()}
              className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-lg text-label-lg px-4 py-2 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Adding…
                </>
              ) : success ? (
                <>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  Added!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Note
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
