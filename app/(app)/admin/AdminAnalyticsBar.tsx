'use client';

interface CategoryItem {
  name: string;
  count: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Infrastructure: '#534ab7',
  Academic: '#78536b',
  Administration: '#5c5d72',
  Hostel: '#3f6b52',
  Other: '#7c6a00',
};

const CATEGORY_BG: Record<string, string> = {
  Infrastructure: 'bg-primary',
  Academic: 'bg-tertiary',
  Administration: 'bg-secondary',
  Hostel: '#3f6b52',
  Other: '#7c6a00',
};

export function AdminAnalyticsBar({
  categoryBreakdown,
  total,
  resolutionRate,
}: {
  categoryBreakdown: CategoryItem[];
  total: number;
  resolutionRate: number;
}) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            bar_chart
          </span>
          Category Breakdown
        </h2>
        <span className="font-label-md text-label-md text-on-surface-variant">{total} total complaints</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-px mb-4">
        {categoryBreakdown.map((cat) => {
          const pct = total ? (cat.count / total) * 100 : 0;
          return (
            <div
              key={cat.name}
              title={`${cat.name}: ${cat.count} (${Math.round(pct)}%)`}
              style={{
                width: `${pct}%`,
                backgroundColor: CATEGORY_COLORS[cat.name] || '#79747e',
                minWidth: pct > 0 ? '4px' : '0',
              }}
              className="transition-all duration-500"
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {categoryBreakdown.map((cat) => {
          const pct = total ? Math.round((cat.count / total) * 100) : 0;
          return (
            <div key={cat.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[cat.name] || '#79747e' }}
              />
              <span className="font-label-md text-label-md text-on-surface-variant">
                {cat.name}
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {cat.count}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                ({pct}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* Resolution rate */}
      <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-label-md text-label-md text-on-surface-variant">Resolution Rate</span>
            <span className="font-label-lg text-label-lg font-bold text-primary">{resolutionRate}%</span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
        <div className="text-right shrink-0">
          <span
            className="material-symbols-outlined text-[28px] text-primary"
            style={{ fontVariationSettings: `'FILL' ${resolutionRate > 50 ? 1 : 0}` }}
          >
            {resolutionRate >= 80 ? 'sentiment_very_satisfied' : resolutionRate >= 50 ? 'sentiment_satisfied' : 'sentiment_neutral'}
          </span>
        </div>
      </div>
    </div>
  );
}
