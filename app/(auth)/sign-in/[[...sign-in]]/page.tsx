import { SignIn } from '@clerk/nextjs';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block mb-6">
          <VoiceItLogo />
        </Link>
        <h1 className="font-headline-md text-headline-md text-on-surface">Welcome back</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Sign in to your VoiceIt account</p>
      </div>
      <SignIn
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-sm border border-outline-variant/30 rounded-xl',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
          },
        }}
      />
      <p className="mt-6 font-body-md text-body-md text-on-surface-variant">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-primary hover:underline font-label-lg">Sign up</Link>
      </p>
    </div>
  );
}
