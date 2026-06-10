import { SignUp } from '@clerk/nextjs';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #0f0030 0%, #1e0052 35%, #2d0074 60%, #3b1fa8 100%)',
        }}
      />
      {/* Soft glow orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '7s' }} />
      {/* Grid overlay */}
      <div className="absolute inset-0 -z-10 opacity-10"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
        }}
      />

      <div className="mb-8 text-center">
        <Link href="/" className="inline-block mb-6">
          <VoiceItLogo />
        </Link>
        <h1 className="font-headline-md text-headline-md text-white">Create your account</h1>
        <p className="font-body-md text-body-md text-white/60 mt-1">Join VoiceIt and make your voice heard</p>
      </div>
      <SignUp
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-2xl border border-white/10 rounded-2xl bg-white/95 backdrop-blur-sm',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            organizationSwitcher: 'hidden',
            createOrganizationButton: 'hidden',
          },
        }}
      />
      <p className="mt-6 font-body-md text-body-md text-white/60">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-white hover:text-purple-300 underline font-label-lg transition-colors">Sign in</Link>
      </p>
    </div>
  );
}

