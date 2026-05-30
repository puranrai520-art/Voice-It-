'use client';

interface AnalyticsData {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  avgRating: number | null;
}

export function StudentAnalytics({ data }: { data: AnalyticsData }) {
  const { total, pending, inReview, resolved, avgRating } = data;

  if (total === 0) return null;

  const resolvedPct = total ? Math.round((resolved / total) * 100) : 0;
  const inReviewPct = total ? Math.round((inReview / total) * 100) : 0;
  const pendingPct  = total ? Math.round((pending  / total) * 100) : 0;

  const stats = [
    {
      label: 'Total',
      value: total,
      icon: 'assignment',
      color: 'text-white',
      bg: 'from-[#3b1fa8] to-[#7c3aed]',
      isGradient: true,
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: 'check_circle',
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      isGradient: false,
    },
    {
      label: 'In Review',
      value: inReview,
      icon: 'rate_review',
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      isGradient: false,
    },
    {
      label: 'Pending',
      value: pending,
      icon: 'pending_actions',
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      isGradient: false,
    },
  ];

  const bars = [
    { label: 'Resolved', count: resolved, pct: resolvedPct, color: 'bg-emerald-500', track: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'In Review', count: inReview, pct: inReviewPct, color: 'bg-blue-500',    track: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Pending',   count: pending,  pct: pendingPct,  color: 'bg-amber-500',   track: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-400' },
  ];

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6 mb-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
        >
          <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            insights
          </span>
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Your Activity</h2>
      </div>

      {/* Stats Grid — 4 columns on sm+, 2x2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative rounded-xl p-3 flex flex-col items-center gap-1.5 overflow-hidden ${
              s.isGradient ? 'shadow-md' : s.bg
            }`}
            style={s.isGradient ? { background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' } : {}}
          >
            {s.isGradient && (
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
            )}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.isGradient ? 'bg-white/20' : 'bg-surface-container'}`}>
              <span
                className={`material-symbols-outlined text-[18px] ${s.color}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {s.icon}
              </span>
            </div>
            <p className={`text-[26px] sm:text-[28px] font-bold leading-none ${s.isGradient ? 'text-white' : 'text-on-surface'}`}>
              {s.value}
            </p>
            <p className={`font-label-sm text-[11px] ${s.isGradient ? 'text-white/70' : 'text-on-surface-variant'}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${b.color} shrink-0`} />
                <span className={`font-label-md text-label-md text-[12px] ${b.text}`}>{b.label}</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px]">
                {b.count} ({b.pct}%)
              </span>
            </div>
            <div className={`h-2 ${b.track} rounded-full overflow-hidden`}>
              <div
                className={`h-full ${b.color} rounded-full transition-all duration-700`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Rating */}
      {avgRating !== null && (
        <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-label-md text-label-md text-on-surface-variant text-[12px]">Avg. Satisfaction</span>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((n) => (
              <span
                key={n}
                className="material-symbols-outlined text-[16px] text-amber-500"
                style={{ fontVariationSettings: n <= Math.round(avgRating) ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            ))}
            <span className="ml-1.5 font-label-lg text-label-lg text-on-surface font-semibold">{avgRating.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
