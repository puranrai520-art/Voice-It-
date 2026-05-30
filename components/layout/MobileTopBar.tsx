'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { MobileDrawer } from './MobileDrawer';

interface MobileTopBarProps {
  role?: string;
  unreadCount?: number;
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
}

export function MobileTopBar({ role, unreadCount, userName, userAvatar, userEmail }: MobileTopBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAdmin = role === 'admin';
  const displayName = userName || 'User';
  const avatar = userAvatar;

  return (
    <>
      <header className="lg:hidden flex justify-between items-center w-full px-4 h-[60px] bg-surface/95 backdrop-blur-sm border-b border-outline-variant/20 z-50 fixed top-0 left-0 right-0 gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" title="Visit Home Page">
          <VoiceItLogo className="h-7 w-auto" />
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Unread badge */}
          {(unreadCount ?? 0) > 0 && (
            <div className="relative">
              <Link href="/my-complaints" className="p-2 flex items-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1 right-1 bg-error text-on-error text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
                </span>
              </Link>
            </div>
          )}

          <ThemeToggle />

          {/* User avatar chip - shows role badge */}
          <button
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-outline-variant/30 bg-surface-container hover:bg-surface-container-high transition-colors ml-1"
          >
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Role badge */}
            {isAdmin ? (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white hidden xs:inline-flex items-center gap-0.5"
                style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
              >
                <span className="material-symbols-outlined text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                Admin
              </span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hidden xs:inline-flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                Student
              </span>
            )}
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">menu</span>
          </button>
        </div>
      </header>

      {drawerOpen && (
        <MobileDrawer
          role={role}
          unreadCount={unreadCount}
          userName={userName}
          userAvatar={userAvatar}
          userEmail={userEmail}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}
