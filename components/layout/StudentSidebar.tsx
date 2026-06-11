'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

interface StudentSidebarProps {
  studentName: string | null;
  studentId: string;
  email: string;
}

const NAV_ITEMS = [
  { href: '/student/dashboard',        icon: 'dashboard',       label: 'Dashboard' },
  { href: '/student/my-complaints',    icon: 'assignment',      label: 'My Complaints' },
  { href: '/student/complaints/new',   icon: 'add_circle',      label: 'File a Complaint' },
  { href: '/student/profile',          icon: 'person',          label: 'My Profile' },
  { href: '/student/settings',         icon: 'settings',        label: 'Settings' },
];

export function StudentSidebar({ studentName, studentId, email }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = studentName || studentId;

  async function handleSignOut() {
    setLoggingOut(true);
    try {
      await fetch('/api/student-auth/logout', { method: 'POST' });
      router.push('/student-login');
    } catch {
      router.push('/student-login');
    }
  }

  const isActive = (href: string) => {
    if (href === '/student/dashboard') return pathname === '/student/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden lg:flex flex-col w-[240px] bg-surface-container-low h-full fixed left-0 top-0 py-6 px-4 gap-4 z-50 border-r border-outline-variant/30 overflow-y-auto">

      {/* Brand */}
      <Link href="/student/dashboard" className="flex items-center gap-2.5 justify-center mb-3 hover:opacity-90 transition-opacity">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 60%, #7c3aed 100%)' }}
        >
          <VoiceItLogo className="w-4.5 h-4.5" iconOnly />
        </div>
        <span
          className="font-bold text-[20px] tracking-tight leading-none"
          style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          VoiceIt
        </span>
      </Link>

      {/* Primary CTA */}
      <Link
        href="/student/complaints/new"
        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl shadow-sm hover:opacity-90 hover:shadow-md active:scale-[0.98] transition-all mb-2"
        style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 100%)', color: '#fff' }}
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        <span className="font-semibold text-sm">File a Complaint</span>
      </Link>

      {/* Nav */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
                active
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: 'linear-gradient(180deg, #3b1fa8, #7c3aed)' }} />
              )}
              <span
                className="material-symbols-outlined text-[22px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex flex-col pt-4 border-t border-outline-variant/30 gap-1">
        {/* Visit Website link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-all duration-150 group"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:text-primary transition-colors">language</span>
          <span className="flex-1">Visit Website</span>
          <span className="material-symbols-outlined text-[14px] opacity-40">open_in_new</span>
        </a>

        <div className="flex items-center justify-between px-2 py-1">
          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
          <ThemeToggle />
        </div>

        {/* User info */}
        <div className="mt-2 px-3 py-3 bg-surface-container border border-outline-variant/20 rounded-xl flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[12px] text-on-surface truncate">{displayName}</p>
              <p className="text-[11px] text-on-surface-variant truncate">{studentId}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 w-fit mt-1">
            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            Student
          </span>
        </div>
      </div>
    </nav>
  );
}
