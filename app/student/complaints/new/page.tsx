'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other'];

export default function StudentNewComplaintPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Image too large. Max 10 MB.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title is required.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters.'); return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('complaint_type', 'student');
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/student-auth/complaint', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit complaint.');
        return;
      }

      router.push('/student/my-complaints');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_add</span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Student Portal</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface">File a Complaint</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Describe your issue and we'll get back to you</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Title */}
        <div>
          <label htmlFor="complaint-title" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Complaint Title <span className="text-error">*</span>
          </label>
          <input
            id="complaint-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Brief summary of your issue"
            required
            maxLength={120}
            className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder-on-surface-variant/50"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="complaint-category" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Category <span className="text-error">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  category === cat
                    ? 'text-white border-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'
                }`}
                style={category === cat ? { background: 'linear-gradient(135deg, #3b1fa8, #6d28d9)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="complaint-description" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Description <span className="text-error">*</span>
          </label>
          <textarea
            id="complaint-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your complaint in detail (minimum 10 characters)..."
            required
            rows={5}
            className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder-on-surface-variant/50 resize-none"
          />
          <p className="text-xs text-on-surface-variant mt-1 text-right">{description.length} characters</p>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Attach Photo <span className="text-on-surface-variant/50 font-normal">(optional, max 10 MB)</span>
          </label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="complaint-image" />

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-outline-variant/30">
              <img src={imagePreview} alt="Preview" className="w-full max-h-[240px] object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ) : (
            <label
              htmlFor="complaint-image"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 cursor-pointer hover:border-primary/40 hover:bg-surface-container transition-all group"
            >
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 group-hover:text-primary/60 transition-colors">add_photo_alternate</span>
              <p className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Click to upload an image</p>
              <p className="text-xs text-on-surface-variant/60">JPEG, PNG, WEBP, GIF — Max 10 MB</p>
            </label>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-error/10 border border-error/20 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[16px] text-error shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* AI notice */}
        <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/30 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-[18px] text-violet-600" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <p className="text-violet-700 dark:text-violet-300 text-xs">
            <strong>AI Assistant</strong> — Once submitted, our AI will automatically generate an acknowledgement response for your complaint.
          </p>
        </div>

        {/* Submit */}
        <button
          id="submit-complaint-btn"
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              Submit Complaint
            </>
          )}
        </button>
      </form>
    </div>
  );
}
