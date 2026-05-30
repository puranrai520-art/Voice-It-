'use client';

import { useState, useRef } from 'react';
import { createComplaint } from '@/actions/complaints';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other'];

const CATEGORY_ICONS: Record<string, string> = {
  Infrastructure: 'construction',
  Academic: 'school',
  Administration: 'admin_panel_settings',
  Hostel: 'home',
  Other: 'more_horiz',
};

export default function NewComplaintPage() {
  const [complaintType, setComplaintType] = useState<'student' | 'staff'>('student');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleImage = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image too large. Maximum size is 10 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImage(file);
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileRef.current) fileRef.current.files = dt.files;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createComplaint(formData);
    } catch (err: any) {
      if (!err?.message?.includes('NEXT_REDIRECT')) {
        setError(err.message || 'Failed to submit complaint. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">New Complaint</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Submit your complaint clearly. Your details and image will be saved securely.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Who are you? ── */}
        <div className="flex flex-col gap-2">
          <label className="font-label-lg text-label-lg text-on-surface">
            I am a <span className="text-error">*</span>
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
                  <span
                    className="material-symbols-outlined text-[18px] ml-auto"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Hidden field so form includes complaint_type */}
          <input type="hidden" name="complaint_type" value={complaintType} />
        </div>

        {/* ── Title ── */}
        <div className="flex flex-col gap-2">
          <label htmlFor="complaint-title" className="font-label-lg text-label-lg text-on-surface">
            Complaint Title <span className="text-error">*</span>
          </label>
          <input
            id="complaint-title"
            name="title"
            type="text"
            required
            maxLength={120}
            placeholder={
              complaintType === 'staff'
                ? 'e.g. Staff room AC not working in Block C'
                : 'e.g. Library Wi-Fi is not working in Block B'
            }
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* ── Category ── */}
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
          {/* Hidden field for category */}
          <input type="hidden" name="category" value={selectedCategory} required />
          {!selectedCategory && (
            <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Please select a category above</p>
          )}
        </div>

        {/* ── Description ── */}
        <div className="flex flex-col gap-2">
          <label htmlFor="complaint-description" className="font-label-lg text-label-lg text-on-surface">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            id="complaint-description"
            name="description"
            required
            minLength={10}
            rows={5}
            placeholder={
              complaintType === 'staff'
                ? 'Describe the issue in detail — when it started, department affected, and any steps already taken…'
                : 'Describe the issue in detail — when it started, how it affects you, and any steps already taken…'
            }
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
          <p className="text-[11px] text-on-surface-variant/60">Minimum 10 characters</p>
        </div>

        {/* ── Image Upload ── */}
        <div className="flex flex-col gap-2">
          <label className="font-label-lg text-label-lg text-on-surface">
            Attach Image <span className="font-body-md text-on-surface-variant">(optional)</span>
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/5'
                : imagePreview
                  ? 'border-primary/30 bg-surface-container-low'
                  : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container'
            }`}
          >
            <input
              ref={fileRef}
              id="complaint-image"
              name="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 w-full object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-error text-on-error rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  aria-label="Remove image"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
                <p className="text-center text-[11px] text-on-surface-variant mt-2">Click to change image</p>
              </div>
            ) : (
              <>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b1fa8/10, #7c3aed/10)' }}
                >
                  <span className="material-symbols-outlined text-[24px] text-primary/60">add_photo_alternate</span>
                </div>
                <div className="text-center">
                  <p className="font-label-lg text-label-lg text-on-surface">
                    {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    PNG, JPG, WEBP up to 10 MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 bg-error-container text-on-error-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <p className="font-body-md text-body-md">{error}</p>
          </div>
        )}

        {/* ── Submit ── */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 font-label-lg text-label-lg px-5 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            id="submit-complaint-btn"
            type="submit"
            disabled={isSubmitting || !selectedCategory}
            className="flex-1 flex items-center justify-center gap-2 text-white font-label-lg text-label-lg px-5 py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
