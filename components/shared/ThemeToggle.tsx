'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9 rounded-full" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-all duration-200 border border-outline-variant/30 ${className}`}
    >
      <span
        className="material-symbols-outlined text-[18px] text-on-surface-variant"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
