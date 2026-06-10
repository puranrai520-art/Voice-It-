'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/my-complaints', icon: 'assignment', label: 'My Complaints' },
  { href: '/complaints/new', icon: 'add_circle', label: 'New Complaint' },
  { href: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel', adminOnly: true },
  { href: '/admin/users', icon: 'group', label: 'User Management', adminOnly: true },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];


export function MobileDrawer({
  role,
  unreadCount = 0,
  userName,
  userAvatar,
  userEmail,
  onClose,
}: {
  role?: string;
  unreadCount?: number;
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const isAdmin = role === 'admin';
  const displayName = userName || 'User';
  const displayEmail = userEmail || '';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      {/* Drawer */}
      <div className="absolute top-0 left-0 h-full w-[300px] max-w-[85vw] bg-surface-container-low flex flex-col shadow-2xl">

        {/* Header with Logo + Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
          <Link href="/" onClick={onClose} className="flex items-center hover:opacity-90 transition-opacity">
            <VoiceItLogo className="h-7 w-auto" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* User Info Card */}
        <div className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden">
          <div
            className="p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 60%, #7c3aed 100%)' }}
          >
            {/* Avatar */}
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 text-white flex items-center justify-center font-bold text-[16px] shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-white truncate">{displayName}</p>
              {displayEmail && (
                <p className="text-[11px] text-white/70 truncate mt-0.5">{displayEmail}</p>
              )}
              {/* Role badge */}
              <div className="mt-1.5">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    Student
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {navItems.map((item) => {
            if ((item as any).adminOnly && !isAdmin) return null;
            const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));

            const showBadge = item.href === '/my-complaints' && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg text-label-lg transition-all relative',
                  active
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #3b1fa8, #7c3aed)' }}
                  />
                )}
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="bg-error text-on-error text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-3 pb-6 pt-3 border-t border-outline-variant/20">
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-label-lg text-on-surface-variant hover:bg-surface-container-high transition-colors text-error"
          >
            <span className="material-symbols-outlined text-[22px] text-error">logout</span>
            <span className="text-on-surface-variant">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
