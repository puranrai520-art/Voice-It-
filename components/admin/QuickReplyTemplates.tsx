'use client';

const TEMPLATES = [
  {
    label: 'Acknowledged',
    icon: 'mark_email_read',
    text: 'Thank you for bringing this to our attention. We have received your complaint and our team is looking into it. We will update you shortly.',
  },
  {
    label: 'In Progress',
    icon: 'engineering',
    text: 'We are actively working on resolving your issue. Our team has been assigned to this matter and you can expect a resolution within the next 2–3 working days.',
  },
  {
    label: 'Resolved',
    icon: 'check_circle',
    text: 'We are pleased to inform you that your complaint has been resolved. The necessary action has been taken. Please let us know if the issue persists.',
  },
  {
    label: 'Need More Info',
    icon: 'help',
    text: 'Thank you for your complaint. To help us resolve this faster, could you please provide more details? Specifically, the date/time this occurred and any relevant supporting information.',
  },
  {
    label: 'Escalated',
    icon: 'move_up',
    text: 'Your complaint has been escalated to the concerned department for immediate action. A senior team member will be in touch with you within 24 hours.',
  },
];

export function QuickReplyTemplates({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="mb-3">
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
        Quick Templates
      </p>
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => onSelect(t.text)}
            title={t.text}
            className="inline-flex items-center gap-1.5 bg-surface-container text-on-surface-variant border border-outline-variant/30 font-label-md text-label-md text-[11px] px-2.5 py-1.5 rounded-lg hover:bg-primary-container/30 hover:text-primary hover:border-primary/30 transition-all"
          >
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
