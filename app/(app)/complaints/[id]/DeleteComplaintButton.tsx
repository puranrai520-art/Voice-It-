'use client';

import { useState, useTransition } from 'react';
import { deleteComplaint } from '@/actions/complaints';
import { useRouter } from 'next/navigation';

interface Props {
  complaintId: string;
  isAdmin: boolean;
  redirectTo: string;
}

export function DeleteComplaintButton({ complaintId, isAdmin, redirectTo }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteComplaint(complaintId);
        router.push(redirectTo);
        router.refresh();
      } catch (err: any) {
        setError(err.message || 'Failed to delete complaint');
        setShowConfirm(false);
      }
    });
  };

  return (
    <>
      {/* Delete trigger button */}
      <button
        id="delete-complaint-btn"
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 font-label-lg text-label-lg px-3 py-2 rounded-xl border border-error/30 text-error hover:bg-error-container/30 transition-all text-[13px]"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
        <span className="hidden sm:inline">Delete</span>
      </button>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-error text-on-error px-4 py-2 rounded-xl shadow-lg font-body-md text-body-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
        >
          <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="w-12 h-12 bg-error-container rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[24px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                delete_forever
              </span>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-2">
              Delete Complaint?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mb-6">
              {isAdmin
                ? 'As admin, you are permanently deleting this complaint and all its data. This cannot be undone.'
                : 'This will permanently delete your complaint, including any admin replies. This cannot be undone.'}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 font-label-lg text-label-lg px-4 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 font-label-lg text-label-lg px-4 py-3 rounded-xl bg-error text-on-error hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
