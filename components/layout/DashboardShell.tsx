'use client';

import { useSidebar } from './SidebarProvider';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

interface DashboardShellProps {
  sidebar: React.ReactNode;
  mobileTopBar: React.ReactNode;
  mobileBottomNav: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({
  sidebar,
  mobileTopBar,
  mobileBottomNav,
  children,
}: DashboardShellProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {sidebar}

      {/* Mobile/Tablet Top Bar */}
      {mobileTopBar}

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[240px]'
        )}
      >
        {/* 
          Mobile: top padding for 60px fixed header + bottom padding for 72px bottom nav + safe-area
          Tablet: same as mobile (lg:hidden covers both)
          Desktop (lg+): no top/bottom padding, sidebar handles layout
        */}
        <div className="pt-[60px] lg:pt-0 pb-[calc(72px+env(safe-area-inset-bottom,0px))] lg:pb-0 flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </main>

      {/* Mobile/Tablet Bottom Nav */}
      {mobileBottomNav}

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
