'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { PriorityStars } from '@/components/complaints/PriorityStars';
import { formatDate } from '@/lib/utils';
import { bulkUpdateStatus } from '@/actions/complaints';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export function AdminBulkActions({ complaints }: { complaints: any[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<ToastState>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const allSelected = selected.size === complaints.length && complaints.length > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(complaints.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = (status: string) => {
    if (selected.size === 0) return;
    startTransition(async () => {
      try {
        await bulkUpdateStatus(Array.from(selected), status);
        showToast(`${selected.size} complaint${selected.size > 1 ? 's' : ''} set to "${status}"`, 'success');
        setSelected(new Set());
      } catch {
        showToast('Failed to update complaints. Please try again.', 'error');
      }
    });
  };

  return (
    <div>
      {/* Inline toast notification */}
      {notification && (
        <div
          className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg font-label-lg text-label-lg transition-all animate-fade-in ${
            notification.type === 'success'
              ? 'bg-primary text-on-primary'
              : 'bg-error text-on-error'
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {notification.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {notification.message}
        </div>
      )}
      {/* Bulk action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="font-label-md text-label-md text-on-surface-variant">
              {selected.size > 0 ? `${selected.size} selected` : `${complaints.length} complaints`}
            </span>
          </label>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Bulk set status:</span>
            {['Pending', 'In Review', 'Resolved'].map((s) => (
              <button
                key={s}
                onClick={() => handleBulkStatus(s)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all border
                  ${s === 'Resolved' ? 'bg-primary-container text-on-primary-container border-primary/20 hover:bg-primary/20' :
                    s === 'In Review' ? 'bg-secondary-container text-on-secondary-container border-secondary/20 hover:bg-secondary/20' :
                    'bg-error-container text-on-error-container border-error/20 hover:bg-error/20'}
                  disabled:opacity-50`}
              >
                {isPending ? '...' : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Complaints list */}
      <div className="flex flex-col gap-2">
        {complaints.map((complaint: any) => {
          const isSelected = selected.has(complaint.id);
          return (
            <div
              key={complaint.id}
              className={`bg-surface-container-low border rounded-2xl overflow-hidden transition-all ${
                isSelected
                  ? 'border-primary/40 bg-primary-container/10'
                  : 'border-outline-variant/20 hover:border-primary/20 hover:shadow-card'
              }`}
            >
              <div className="flex">
                {/* Image strip */}
                {complaint.image_url && (
                  <a
                    href={complaint.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 w-24 sm:w-32 overflow-hidden group"
                    title="View full image"
                  >
                    <img
                      src={complaint.image_url}
                      alt="Attachment"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </a>
                )}

                {/* Main content */}
                <div className="flex-1 p-4 sm:p-5 min-w-0">
                  <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleOne(complaint.id)}
                  className="w-4 h-4 accent-primary rounded mt-1 shrink-0"
                />

                {/* Avatar */}
                <div className="shrink-0 hidden sm:block">
                  {complaint.user?.avatar_url ? (
                    <img
                      src={complaint.user.avatar_url}
                      alt={complaint.user.name}
                      className="w-9 h-9 rounded-full object-cover border border-outline-variant/20"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[11px]">
                      {complaint.user?.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <h2 className="font-label-lg text-label-lg text-on-surface truncate max-w-[220px] sm:max-w-none">
                        {complaint.title}
                      </h2>
                      <StatusBadge status={complaint.status} size="sm" showIcon />
                      {complaint.ai_reply && (
                        <span className="inline-flex items-center gap-1 bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            smart_toy
                          </span>
                          AI
                        </span>
                      )}
                    </div>
                    {complaint.priority && <PriorityStars priority={complaint.priority} size="sm" />}
                  </div>

                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mb-2">
                    {complaint.description}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {complaint.user?.name || 'Unknown'}
                      </span>
                      <span className="text-outline-variant">·</span>
                      <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
                        <span className="material-symbols-outlined text-[13px]">category</span>
                        {complaint.category || 'Uncategorised'}
                      </span>
                      <span className="text-outline-variant">·</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        {formatDate(complaint.created_at)}
                      </span>
                    </div>

                    <Link
                      href={`/complaints/${complaint.id}`}
                      className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:underline shrink-0"
                    >
                      View & Reply
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </Link>
                  </div>
                </div>
                  </div>
                </div>{/* end main content */}
              </div>{/* end flex row */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
