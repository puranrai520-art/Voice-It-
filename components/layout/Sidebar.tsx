'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useSidebar } from '@/components/layout/SidebarProvider';

interface SidebarProps {
  role?: string;
  unreadCount?: number;
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
  badge?: number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/my-complaints', icon: 'assignment', label: 'My Complaints' },
  { href: '/complaints/new', icon: 'add_circle', label: 'New Complaint' },
  { href: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel', adminOnly: true },
  { href: '/admin/users', icon: 'group', label: 'User Management', adminOnly: true },
];


export function Sidebar({ role, unreadCount = 0, userName, userAvatar, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isCollapsed, toggleCollapse } = useSidebar();

  const displayName = userName || 'User';
  const displayEmail = userEmail || user?.emailAddresses[0]?.emailAddress || '';
  const avatar = userAvatar || user?.imageUrl;
  const isAdmin = role === 'admin';

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/admin' && pathname === '/admin') return true;
    if (href === '/admin/users' && pathname === '/admin/users') return true;
    return pathname.startsWith(href) && href !== '/dashboard' && href !== '/admin';
  };


  return (
    <nav
      className={cn(
        'hidden lg:flex flex-col bg-surface-container-low h-full fixed left-0 top-0 py-6 z-50 border-r border-outline-variant/30 transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin',
        isCollapsed ? 'w-[76px] px-2 gap-6' : 'w-[240px] px-4 gap-4'
      )}
    >
      {/* Collapse Toggle Button for Desktop */}
      <button
        onClick={toggleCollapse}
        className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full border border-outline-variant/30 bg-surface hover:bg-surface-container-high text-on-surface-variant shadow-sm transition-all duration-300 absolute -right-3 top-8 z-50 cursor-pointer"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <span className="material-symbols-outlined text-[16px] pointer-events-none">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Brand Header */}
      <div className={cn(
        'transition-all duration-300 flex flex-col items-center justify-center text-center w-full mb-3',
        isCollapsed ? 'px-0' : 'px-2'
      )}>
        {isCollapsed ? (
          <Link
            href="/"
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 60%, #7c3aed 100%)' }}
            title="Visit Home Page"
          >
            <VoiceItLogo className="w-5 h-5" iconOnly />
          </Link>
        ) : (
          <Link href="/" className="flex flex-col items-center justify-center gap-1.5 w-full hover:opacity-90 transition-opacity group">
            {/* Row 1: Logo + VoiceIt Name side-by-side (Centered) */}
            <div className="flex items-center gap-2.5 justify-center w-full">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow"
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
            </div>
            {/* Row 2: CMS label */}
            <div
              className="text-[11px] font-bold tracking-[0.28em] uppercase text-center w-full pl-[0.28em] mt-0.5"
              style={{ color: '#6d28d9' }}
            >
              CMS
            </div>
          </Link>
        )}
      </div>

      {/* Primary CTA */}
      <Link
        href="/complaints/new"
        className={cn(
          'flex items-center justify-center rounded-xl shadow-sm hover:opacity-90 hover:shadow-md active:scale-[0.98] transition-all mb-2',
          isCollapsed ? 'w-12 h-12 p-0 mx-auto' : 'w-full gap-2 py-3 px-4'
        )}
        style={{ background: 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 100%)', color: '#fff' }}
        title="New Complaint"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        {!isCollapsed && <span className="font-label-lg text-label-lg font-semibold">New Complaint</span>}
      </Link>

      {/* Main Navigation */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const active = isActive(item.href);
          const showBadge = item.href === '/my-complaints' && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-xl font-label-lg text-label-lg transition-all duration-150 relative',
                active
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high',
                isCollapsed ? 'justify-center py-3 px-0 w-12 mx-auto' : 'gap-3 px-4 py-2.5'
              )}
              title={item.label}
            >
              {active && !isCollapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: 'linear-gradient(180deg, #3b1fa8, #7c3aed)' }} />
              )}
              <span
                className="material-symbols-outlined text-[22px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="flex-1">{item.label}</span>}
              {!isCollapsed && showBadge && (
                <span className="bg-error text-on-error text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {isCollapsed && showBadge && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer: Settings + Logout + User */}
      <div className={cn('flex flex-col pt-4 border-t border-outline-variant/30', isCollapsed ? 'gap-4 items-center' : 'gap-1')}>
        <Link
          href="/settings"
          className={cn(
            'flex items-center rounded-xl font-label-md text-label-md transition-colors duration-150',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary dark:bg-primary/20'
              : 'text-on-surface-variant hover:bg-surface-container-high',
            isCollapsed ? 'justify-center p-3 w-12 mx-auto' : 'gap-3 px-4 py-2.5'
          )}
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          {!isCollapsed && <span>Settings</span>}
        </Link>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex items-center justify-center p-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex items-center gap-2 px-2 py-2 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
            <ThemeToggle />
          </div>
        )}

        {/* User Info Card */}
        <div className={cn(
          'mt-2 rounded-xl transition-all duration-300',
          isCollapsed
            ? 'p-1.5 w-12 flex justify-center'
            : 'px-3 py-3 bg-surface-container border border-outline-variant/20 gap-2 flex flex-col'
        )}>
          {/* Avatar */}
          <div className="flex justify-center items-center w-full">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover border-2 border-primary/20 mx-auto" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] text-white mx-auto"
                style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {/* Name, Email and Role Badge */}
          {!isCollapsed && (
            <div className="flex flex-col items-center justify-center text-center w-full min-w-0">
              <p className="font-semibold text-[12px] text-on-surface truncate w-full text-center px-1">{displayName}</p>
              {displayEmail && (
                <p className="text-[11px] text-on-surface-variant truncate w-full text-center px-1 mt-0.5" title={displayEmail}>
                  {displayEmail}
                </p>
              )}
              {/* Role badge */}
              <div className="mt-1.5">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)', color: '#fff' }}>
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    Student
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
