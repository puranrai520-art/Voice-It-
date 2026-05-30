import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────
//  PENDING   →  Amber / Orange  (attention needed)
//  IN REVIEW →  Blue / Indigo   (being worked on)
//  RESOLVED  →  Emerald / Green (done & complete)
// ─────────────────────────────────────────────────────────

const statusConfig = {
  Pending: {
    // Warm amber — "needs attention"
    pill: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600/40',
    dot: 'bg-amber-500',
    icon: 'pending_actions',
    glow: 'shadow-[0_0_0_3px_rgba(245,158,11,0.15)]',
  },
  'In Review': {
    // Cool blue — "in progress"
    pill: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600/40',
    dot: 'bg-blue-500',
    icon: 'rate_review',
    glow: 'shadow-[0_0_0_3px_rgba(59,130,246,0.15)]',
  },
  Resolved: {
    // Emerald green — "done"
    pill: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600/40',
    dot: 'bg-emerald-500',
    icon: 'check_circle',
    glow: 'shadow-[0_0_0_3px_rgba(16,185,129,0.15)]',
  },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = false,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide',
        config.pill,
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-[11px]',
        size === 'lg' && 'px-3.5 py-1.5 text-[12px]',
        className
      )}
    >
      {/* Pulsing dot */}
      {showDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {status === 'Pending' && (
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', config.dot)} />
          )}
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', config.dot)} />
        </span>
      )}

      {/* Optional icon */}
      {showIcon && (
        <span
          className="material-symbols-outlined leading-none"
          style={{
            fontSize: size === 'sm' ? '11px' : size === 'lg' ? '14px' : '12px',
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {config.icon}
        </span>
      )}

      {status}
    </span>
  );
}
