'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface Props {
  studentId: string;
  email: string;
  name: string | null;
}

export function StudentSettingsClient({ studentId, email, name }: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = resolvedTheme === 'dark';

  async function handleSignOut() {
    setLoggingOut(true);
    try {
      await fetch('/api/student-auth/logout', { method: 'POST' });
      router.push('/student-login');
    } catch {
      router.push('/student-login');
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Manage your preferences</p>
      </div>

      <div className="flex flex-col gap-4">

        {/* Appearance */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-semibold text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
              Appearance
            </h2>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-on-surface text-sm">Theme</p>
                <p className="text-on-surface-variant text-xs mt-0.5">
                  {!mounted ? 'Loading...' : isDark ? 'Dark Mode is active' : 'Light Mode is active'}
                </p>
              </div>
              {/* Theme toggle buttons */}
              <div className="flex items-center gap-2 bg-surface-container rounded-xl p-1 border border-outline-variant/20">
                <button
                  id="settings-light-mode"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !isDark ? 'bg-white dark:bg-surface-container-high text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: !isDark ? "'FILL' 1" : "" }}>light_mode</span>
                  Light
                </button>
                <button
                  id="settings-dark-mode"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isDark ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isDark ? "'FILL' 1" : "" }}>dark_mode</span>
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-semibold text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              Login Credentials
            </h2>
          </div>

          <div className="divide-y divide-outline-variant/10">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] text-primary">badge</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">Student ID (Login)</p>
                <p className="text-sm text-on-surface font-medium font-mono">{studentId}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] text-primary">email</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">Email Address</p>
                <p className="text-sm text-on-surface font-medium">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">Password</p>
                <p className="text-sm text-on-surface font-medium font-mono">
                  {showCredentials ? '(Set by admin — contact admin to change)' : '••••••••'}
                </p>
              </div>
              <button
                onClick={() => setShowCredentials(v => !v)}
                className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Toggle password info"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showCredentials ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-700/30">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              To reset your password, contact your institution's administrator.
            </p>
          </div>
        </div>

        {/* Visit Website */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-semibold text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
              Website
            </h2>
          </div>
          <div className="px-5 py-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/8 transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">language</span>
              Visit VoiceIt Website
              <span className="material-symbols-outlined text-[14px] opacity-60">open_in_new</span>
            </a>
            <p className="text-on-surface-variant text-xs mt-2">Browse the public website and features.</p>
          </div>
        </div>

        {/* Account */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-semibold text-on-surface text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-error">account_circle</span>
              Account
            </h2>
          </div>
          <div className="px-5 py-4">
            <button
              id="settings-sign-out"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-error/30 text-error hover:bg-error/8 transition-all text-sm font-medium disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
            <p className="text-on-surface-variant text-xs mt-2">You'll be redirected to the student login page.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
