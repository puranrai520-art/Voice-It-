'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', icon: 'dashboard', label: 'Home' },
  { href: '/my-complaints', icon: 'assignment', label: 'Complaints' },
  { href: '/complaints/new', icon: 'add_circle', label: 'New', isFab: true },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export function MobileBottomNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const allItems = role === 'admin'
    ? [...items.slice(0, 2), { href: '/admin', icon: 'admin_panel_settings', label: 'Admin' }, items[3]]
    : items;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-outline-variant/20 flex justify-around items-center px-1 z-50"
      style={{
        height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {allItems.map((item) => {
        const isNew = 'isFab' in item && item.isFab;
        const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));

        if (isNew) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 flex-1 py-2 min-w-0 -mt-4"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
              >
                <span
                  className="material-symbols-outlined text-[24px] text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
              </div>
              <span className="font-label-md text-[10px] text-on-surface-variant">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 flex-1 py-2 min-w-0"
          >
            <div className={cn('p-1.5 rounded-full transition-colors', active ? 'bg-primary/10 dark:bg-primary/20' : '')}>
              <span
                className={cn('material-symbols-outlined text-[22px]', active ? 'text-primary' : 'text-on-surface-variant')}
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
            </div>
            <span className={cn('font-label-md text-[10px]', active ? 'text-primary font-semibold' : 'text-on-surface-variant')}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
