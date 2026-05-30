'use client';

interface BadgeConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  earnedBg: string;
  earned: boolean;
}

function computeBadges(total: number, resolved: number, hasRated: boolean, daysActive: number): BadgeConfig[] {
  return [
    {
      id: 'first_voice',
      label: 'First Voice',
      description: 'Submitted your first complaint',
      icon: 'record_voice_over',
      color: 'text-purple-700 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      earnedBg: 'from-purple-500 to-indigo-500',
      earned: total >= 1,
    },
    {
      id: 'active_student',
      label: 'Active Member',
      description: 'Submitted 3+ complaints',
      icon: 'how_to_reg',
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      earnedBg: 'from-blue-500 to-cyan-500',
      earned: total >= 3,
    },
    {
      id: 'resolved_first',
      label: 'Issue Resolved',
      description: 'Got first complaint resolved',
      icon: 'verified',
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      earnedBg: 'from-emerald-500 to-teal-500',
      earned: resolved >= 1,
    },
    {
      id: 'satisfied',
      label: 'Feedback Hero',
      description: 'Rated a resolved complaint',
      icon: 'sentiment_very_satisfied',
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      earnedBg: 'from-amber-500 to-orange-500',
      earned: hasRated,
    },
    {
      id: 'veteran',
      label: 'Veteran',
      description: 'Active on VoiceIt for 7+ days',
      icon: 'military_tech',
      color: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      earnedBg: 'from-rose-500 to-pink-500',
      earned: daysActive >= 7,
    },
    {
      id: 'problem_solver',
      label: 'Problem Solver',
      description: '5+ complaints resolved',
      icon: 'emoji_events',
      color: 'text-yellow-700 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      earnedBg: 'from-yellow-400 to-amber-500',
      earned: resolved >= 5,
    },
  ];
}

interface GamificationProps {
  total: number;
  resolved: number;
  hasRated: boolean;
  joinedAt: string;
}

export function GamificationBadges({ total, resolved, hasRated, joinedAt }: GamificationProps) {
  const daysActive = Math.floor((Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24));
  const badges = computeBadges(total, resolved, hasRated, daysActive);
  const earnedCount = badges.filter((b) => b.earned).length;
  const pct = Math.round((earnedCount / badges.length) * 100);

  if (total === 0) return null;

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[18px] text-amber-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Achievements</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-lg text-label-lg text-on-surface font-bold">{earnedCount}</span>
          <span className="font-label-md text-label-md text-on-surface-variant">/ {badges.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-body-md text-body-md text-on-surface-variant text-[12px]">
            {pct === 100 ? '🎉 All badges earned!' : `${pct}% complete`}
          </p>
          <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px]">{earnedCount}/{badges.length} earned</span>
        </div>
        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #3b1fa8, #7c3aed, #f59e0b)',
            }}
          />
        </div>
      </div>

      {/* Badge Grid — 2 cols mobile, 3 cols sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border text-center transition-all ${
              badge.earned
                ? 'border-outline-variant/20 bg-surface-container hover:shadow-md hover:-translate-y-0.5'
                : 'border-outline-variant/10 bg-surface-container/30 opacity-40 grayscale'
            }`}
          >
            {/* Lock / Check icon */}
            <div className="absolute top-2.5 right-2.5">
              {badge.earned ? (
                <span
                  className="material-symbols-outlined text-[14px] text-emerald-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-[13px] text-on-surface-variant/60"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lock
                </span>
              )}
            </div>

            {/* Badge icon */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                badge.earned ? '' : badge.bg
              }`}
              style={badge.earned ? { background: `linear-gradient(135deg, var(--from), var(--to))` } : {}}
            >
              {badge.earned ? (
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${badge.earnedBg.replace('from-', '').replace(' to-', ', ')})` }}
                >
                  <span
                    className="material-symbols-outlined text-[22px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {badge.icon}
                  </span>
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badge.bg}`}>
                  <span
                    className={`material-symbols-outlined text-[22px] ${badge.color}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {badge.icon}
                  </span>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="font-label-lg text-label-lg text-on-surface leading-tight text-[13px] font-semibold">{badge.label}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 leading-tight text-[11px]">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational footer */}
      {earnedCount < badges.length && (
        <div className="mt-5 p-3.5 rounded-xl bg-primary/5 border border-primary/10">
          <p className="font-body-md text-body-md text-on-surface-variant text-center text-[12px]">
            🚀 Keep going! You have <strong className="text-primary">{badges.length - earnedCount}</strong> more badge{badges.length - earnedCount !== 1 ? 's' : ''} to unlock.
          </p>
        </div>
      )}
    </div>
  );
}
