import { cn } from '@/lib/utils';

interface VoiceItLogoProps {
  className?: string;
  iconOnly?: boolean;
  white?: boolean;
}

export function VoiceItLogo({ className, iconOnly = false, white = false }: VoiceItLogoProps) {
  const textColor = white ? '#ffffff' : 'url(#logoTextGrad)';
  const iconColor = '#ffffff';

  if (iconOnly) {
    return (
      <svg className={cn('w-6 h-6', className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="13" y="4" width="6" height="13" rx="3" fill={iconColor} />
        <path d="M9 16c0 3.866 3.134 7 7 7s7-3.134 7-7" stroke={iconColor} strokeWidth="2" strokeLinecap="round" fill="none" />
        <line x1="16" y1="23" x2="16" y2="27" stroke={iconColor} strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="27" x2="20" y2="27" stroke={iconColor} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Icon with vibrant gradient background */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
        style={{
          background: white
            ? 'rgba(255,255,255,0.2)'
            : 'linear-gradient(135deg, #3b1fa8 0%, #6d28d9 60%, #7c3aed 100%)',
        }}
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="4" width="8" height="14" rx="4" fill={iconColor} />
          <path d="M8 16c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <line x1="16" y1="24" x2="16" y2="28" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="11" y1="28" x2="21" y2="28" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      {/* Wordmark with gradient */}
      {white ? (
        <span className="font-bold text-[18px] leading-none tracking-tight text-white">
          VoiceIt
        </span>
      ) : (
        <svg viewBox="0 0 80 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-auto">
          <defs>
            <linearGradient id="logoTextGrad" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b1fa8" />
              <stop offset="60%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <text
            x="0"
            y="17"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="700"
            fontSize="18"
            letterSpacing="-0.5"
            fill="url(#logoTextGrad)"
          >
            VoiceIt
          </text>
        </svg>
      )}
    </div>
  );
}
