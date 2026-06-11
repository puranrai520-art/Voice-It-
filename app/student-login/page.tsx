'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';

export default function StudentLoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/student-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      router.push('/student/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0026] via-[#1a0050] to-[#2d007a] relative overflow-hidden p-4">

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #3b1fa8, #6d28d9)' }} />

          <div className="p-8 sm:p-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-violet-900/40"
                style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 60%, #7c3aed 100%)' }}
              >
                <VoiceItLogo className="w-7 h-7" iconOnly />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Student Portal</h1>
              <p className="text-white/50 text-sm mt-1">Sign in with your Student ID</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Student ID */}
              <div>
                <label htmlFor="student-id" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-white/40">
                    badge
                  </span>
                  <input
                    id="student-id"
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="e.g. STU2024001"
                    required
                    autoComplete="username"
                    className="w-full bg-white/8 border border-white/15 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-white/40">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-white/8 border border-white/15 text-white placeholder-white/30 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    error
                  </span>
                  <p className="text-red-300 text-sm leading-snug">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                id="student-login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 100%)' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      login
                    </span>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="text-center text-white/35 text-xs mt-6 leading-relaxed">
              Your account is created by your institution's admin.<br />
              Contact admin if you cannot access your account.
            </p>
          </div>
        </div>

        {/* Admin link */}
        <p className="text-center mt-5 text-white/40 text-xs">
          Are you an admin?{' '}
          <a href="/sign-in" className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
            Admin Login →
          </a>
        </p>
      </div>
    </div>
  );
}
