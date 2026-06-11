'use client';

import { useState } from 'react';
import { updateComplaint } from '@/actions/complaints';
import { useRouter } from 'next/navigation';
import type { Complaint } from '@/types';

const CATEGORIES = ['Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other'];
const CATEGORY_ICONS: Record<string, string> = {
  Infrastructure: 'construction',
  Academic: 'school',
  Administration: 'admin_panel_settings',
  Hostel: 'home',
  Other: 'more_horiz',
};

interface Props {
  complaint: Complaint;
  isAdmin: boolean;
}

export function EditComplaintClient({ complaint, isAdmin }: Props) {
  const router = useRouter();
  const [complaintType, setComplaintType] = useState<'student' | 'staff'>(
    (complaint.complaint_type as any) || 'student'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(complaint.category || '');
  const [title, setTitle] = useState(complaint.title || '');
  const [description, setDescription] = useState(complaint.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedCategory) { setError('Please select a category.'); return; }
    setIsSubmitting(true);
    try {
      await updateComplaint(complaint.id, {
        title,
        description,
        category: selectedCategory,
        complaint_type: complaintType,
      });
      router.push(`/complaints/${complaint.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
          >
            <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              edit
            </span>
          </div>
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Edit Complaint</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {isAdmin ? 'Admin: editing any complaint' : 'Changes saved instantly'}
            </p>
          </div>
        </div>
        {/* Status badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Current status:</span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            complaint.status === 'Resolved'
              ? 'bg-emerald-100 text-emerald-700'
              : complaint.status === 'In Review'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {complaint.status}
          </span>
          {!isAdmin && complaint.status !== 'Resolved' && (
            <span className="text-[11px] text-on-surface-variant">• You can edit until resolved</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Who are you */}
        <div className="flex flex-col gap-2">
          <label className="font-label-lg text-label-lg text-on-surface">
            Complaint type <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['student', 'staff'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setComplaintType(type)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-label-lg text-label-lg ${
                  complaintType === type
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={complaintType === type ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {type === 'student' ? 'school' : 'badge'}
                </span>
                <span className="capitalize font-semibold">{type}</span>
                {complaintType === type && (
                  <span className="material-symbols-outlined text-[18px] ml-auto" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <label htmlFor="edit-title" className="font-label-lg text-label-lg text-on-surface">
            Title <span className="text-error">*</span>
          </label>
          <input
            id="edit-title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="font-label-lg text-label-lg text-on-surface">
            Category <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all font-label-md text-label-md ${
                  selectedCategory === cat
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px] shrink-0"
                  style={selectedCategory === cat ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {CATEGORY_ICONS[cat]}
                </span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label htmlFor="edit-description" className="font-label-lg text-label-lg text-on-surface">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            id="edit-description"
            required
            minLength={10}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
          <p className="text-[11px] text-on-surface-variant/60">Minimum 10 characters</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-error-container text-on-error-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <p className="font-body-md text-body-md">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 font-label-lg text-label-lg px-5 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-edit-btn"
            type="submit"
            disabled={isSubmitting || !selectedCategory || !title.trim() || !description.trim()}
            className="flex-1 flex items-center justify-center gap-2 text-white font-label-lg text-label-lg px-5 py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
