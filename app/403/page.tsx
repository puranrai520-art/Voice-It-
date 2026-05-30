import Link from 'next/link';

export const metadata = { title: '403 — Access Denied | VoiceIt' };

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-error-container flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-[48px] text-error"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            gpp_bad
          </span>
        </div>

        {/* Text */}
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Access Denied</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          You don&apos;t have permission to access the Admin Panel. This area is restricted to administrators only.
        </p>

        {/* Subtle badge */}
        <div className="inline-flex items-center gap-2 bg-error-container text-on-error-container font-label-md text-label-md px-4 py-2 rounded-full mb-8">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          Admin access required
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-lg text-label-lg px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Go to Dashboard
          </Link>
          <Link
            href="/my-complaints"
            className="inline-flex items-center justify-center gap-2 bg-surface-container text-on-surface font-label-lg text-label-lg px-6 py-3 rounded-xl hover:bg-surface-container-high transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            My Complaints
          </Link>
        </div>
      </div>
    </div>
  );
}
