import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon = 'inbox', title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{title}</h3>
      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-8">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="bg-primary text-on-primary font-label-lg text-label-lg px-6 py-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
