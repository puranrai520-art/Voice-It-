'use client';

import { useState, FormEvent } from 'react';

const COURSES = ['B.Tech', 'M.Tech', 'MBA', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'B.Com', 'Other'];
const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];
const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateStudentModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    email: '', password: '', student_id: '', course: '',
    branch: '', roll_number: '', semester: '', year: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!form.password.trim() || form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!form.student_id.trim()) { setError('Student ID is required.'); return; }
    if (!form.course) { setError('Course is required.'); return; }
    if (!form.branch) { setError('Branch is required.'); return; }
    if (!form.roll_number.trim()) { setError('Roll Number is required.'); return; }
    if (!form.semester) { setError('Semester is required.'); return; }
    if (!form.year.trim()) { setError('Academic Year is required.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create student.'); return; }
      onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-outline-variant/20 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20 shrink-0">
          <div>
            <h2 className="font-bold text-lg text-on-surface">Create New Student</h2>
            <p className="text-on-surface-variant text-sm mt-0.5">All fields are required</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Full Name <span className="text-on-surface-variant/50 font-normal">(optional)</span></label>
              <input type="text" value={form.name} onChange={handleChange('name')} placeholder="Student's full name" className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Gmail Address <span className="text-error">*</span></label>
              <input type="email" value={form.email} onChange={handleChange('email')} placeholder="student@gmail.com" required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Password <span className="text-error">*</span></label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} placeholder="Min. 6 characters" required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Student ID <span className="text-error">*</span></label>
              <input type="text" value={form.student_id} onChange={handleChange('student_id')} placeholder="e.g. STU2024001" required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono" />
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Course <span className="text-error">*</span></label>
              <select value={form.course} onChange={handleChange('course')} required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                <option value="">Select course</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Branch <span className="text-error">*</span></label>
              <select value={form.branch} onChange={handleChange('branch')} required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                <option value="">Select branch</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Roll Number <span className="text-error">*</span></label>
              <input type="text" value={form.roll_number} onChange={handleChange('roll_number')} placeholder="e.g. 21CS001" required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono" />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Semester <span className="text-error">*</span></label>
              <select value={form.semester} onChange={handleChange('semester')} required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                <option value="">Select semester</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Academic Year <span className="text-error">*</span></label>
              <input type="text" value={form.year} onChange={handleChange('year')} placeholder="e.g. 2024-25" required className="w-full bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 flex items-start gap-2.5 bg-error/10 border border-error/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-[16px] text-error shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container transition-all text-sm font-medium">
              Cancel
            </button>
            <button
              id="create-student-submit"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold transition-all shadow-md hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>Create Student</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
