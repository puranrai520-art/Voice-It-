'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/student/dashboard',       icon: 'dashboard',    label: 'Home' },
  { href: '/student/my-complaints',   icon: 'assignment',   label: 'Complaints' },
  { href: '/student/complaints/new',  icon: 'add_circle',   label: 'New' },
  { href: '/student/profile',         icon: 'person',       label: 'Profile' },
  { href: '/student/settings',        icon: 'settings',     label: 'Settings' },
];

export function StudentMobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/student/dashboard') return pathname === '/student/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low border-t border-outline-variant/20 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all',
                active ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={cn('text-[10px] font-medium', active ? 'font-semibold' : '')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
