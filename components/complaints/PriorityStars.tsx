import { cn } from '@/lib/utils';

interface PriorityStarsProps {
  priority: number | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function PriorityStars({ priority, size = 'sm', className }: PriorityStarsProps) {
  if (!priority) return null;
  const iconSize = size === 'sm' ? 'text-[14px]' : 'text-[18px]';
  const color = priority >= 4 ? 'text-error' : priority >= 2 ? 'text-secondary' : 'text-on-surface-variant';

  return (
    <div className={cn('flex', color, className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn('material-symbols-outlined', iconSize)}
          style={{ fontVariationSettings: n <= priority ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}
