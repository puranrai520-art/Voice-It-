import Link from 'next/link';
import { VoiceItLogo } from '@/components/shared/VoiceItLogo';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function LandingPage() {
  // Check if user is logged in and get their info
  let loggedInUser: { name: string | null; email: string; role: string } | null = null;
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = createServerSupabase();
      const { data: user } = await supabase
        .from('users')
        .select('name, email, role')
        .eq('clerk_id', userId)
        .single();
      if (user) loggedInUser = user;
    }
  } catch {
    // Not logged in or error — show default navbar
  }

  const isAdmin = loggedInUser?.role === 'admin';
  const displayName = loggedInUser?.name || loggedInUser?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background text-on-background font-sans">
      {/* === NAVBAR === */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[64px] flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-6 sm:gap-10 min-w-0">
            <Link href="/" className="shrink-0">
              <VoiceItLogo />
            </Link>
            <nav className="hidden md:flex items-center gap-7">
              <a href="#features" className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors">How It Works</a>
            </nav>
          </div>

          {/* Right side: logged-in user chip OR sign-in buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {loggedInUser ? (
              /* ── Logged-in user pill ── */
              <div className="flex items-center gap-2 sm:gap-3">
                {/* User info chip */}
                <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 rounded-full pl-1.5 pr-3 py-1">
                  {/* Gradient avatar initials */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
                  >
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col leading-none min-w-0">
                    <span className="text-[12px] font-semibold text-on-surface truncate max-w-[120px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-on-surface-variant truncate max-w-[120px]">
                      {loggedInUser.email}
                    </span>
                  </div>
                  {/* Role badge */}
                  {isAdmin ? (
                    <span
                      className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ml-1"
                      style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
                    >
                      <span className="material-symbols-outlined text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                      <span className="hidden xs:inline">Admin</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ml-1">
                      <span className="material-symbols-outlined text-[9px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                      <span className="hidden xs:inline">Student</span>
                    </span>
                  )}
                </div>
                {/* Go to Dashboard button */}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 font-label-lg text-label-lg px-3 sm:px-4 py-2 text-white rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm text-[13px]"
                  style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </div>
            ) : (
              /* ── Guest: Sign In + Get Started ── */
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:block font-label-lg text-label-lg px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary-container/20 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="font-label-lg text-label-lg px-4 py-2 text-white rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* === HERO SECTION === */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-grid-pattern">
          {/* Gradient blobs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left: Text */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-primary-container/20 text-primary border border-primary/20 rounded-full px-4 py-1.5 font-label-md text-label-md mb-6">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  AI-Powered Complaint Management
                </div>
                <h1 className="font-bold text-[38px] sm:text-[42px] lg:text-[56px] leading-[1.1] tracking-tight text-on-surface mb-6">
                  Your complaints,{' '}
                  <span className="text-primary relative">
                    resolved faster
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 340 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 6C60 2 160 1 338 4" stroke="#534AB7" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
                    </svg>
                  </span>
                  {' '}than ever.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 text-[16px] sm:text-[17px] leading-relaxed">
                  VoiceIt gives every student and staff member a direct line to college administration — transparent, trackable, and AI-powered. No more chasing emails or standing in queues.
                </p>
                <div className="flex flex-wrap gap-4">
                  {loggedInUser ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 font-label-lg text-label-lg px-7 py-3.5 text-white rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
                      style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
                    >
                      Go to Dashboard
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 font-label-lg text-label-lg px-7 py-3.5 text-white rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
                        style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
                      >
                        Get Started Free
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                      <Link
                        href="/sign-in"
                        className="inline-flex items-center gap-2 font-label-lg text-label-lg px-7 py-3.5 text-primary border-[1.5px] border-primary rounded-lg hover:bg-surface-container-high transition-colors"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
                {/* Trust indicators */}
                <div className="mt-10 flex flex-wrap items-center gap-6 text-on-surface-variant font-body-md text-body-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Free for students & staff
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    Secure &amp; private
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    AI-assisted
                  </div>
                </div>
              </div>

              {/* Right: Mock complaint card */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/20 to-transparent rounded-full blur-3xl" />
                {/* Main card */}
                <div className="relative z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-highest p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-container-highest">
                      <div>
                        <h3 className="font-label-lg text-label-lg text-on-surface">Library Wi-Fi Issue</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">ID: #CMP-2024-8924</p>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-[#e6f4ea] text-[#1e8e3e] font-label-md text-[11px] px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Resolved
                      </span>
                    </div>
                    <div className="space-y-2.5 mb-5">
                      <div className="h-2 bg-surface-container-high rounded-full w-3/4" />
                      <div className="h-2 bg-surface-container-high rounded-full w-full" />
                      <div className="h-2 bg-surface-container-high rounded-full w-5/6" />
                    </div>
                    {/* Status timeline mini */}
                    <div className="flex items-center gap-2 mb-5">
                      {['Pending', 'In Review', 'Resolved'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i < 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            {i < 3 ? <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : (i + 1)}
                          </div>
                          {i < 2 && <div className="flex-1 h-0.5 w-8 bg-primary" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-surface-container-highest">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-[11px] font-bold">AD</div>
                      <div className="font-body-md text-body-md text-on-surface-variant">Admin responded 2 hours ago</div>
                    </div>
                  </div>
                </div>
                {/* Floating secondary card */}
                <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-highest p-4 w-52 transform -rotate-2 hover:rotate-0 transition-transform duration-500 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
                    </div>
                    <span className="font-label-lg text-label-lg text-on-surface text-[12px]">3 pending</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === FEATURES SECTION === */}
        <section id="features" className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="font-bold text-[28px] sm:text-[32px] md:text-[36px] leading-tight tracking-tight text-on-surface mb-4">
                Everything you need to be heard.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                Built for college students and staff — VoiceIt streamlines the entire complaint lifecycle.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: 'campaign',
                  iconBg: 'bg-primary-container/20',
                  iconColor: 'text-primary',
                  title: 'Submit in seconds',
                  desc: 'Fill a simple form, select student or staff, attach a photo if needed, and submit. Takes under a minute.',
                },
                {
                  icon: 'visibility',
                  iconBg: 'bg-secondary-container',
                  iconColor: 'text-on-secondary-container',
                  title: 'Track in real time',
                  desc: 'Watch your complaint move from Pending to Resolved with a live status timeline. Never wonder where you stand.',
                },
                {
                  icon: 'smart_toy',
                  iconBg: 'bg-surface-variant',
                  iconColor: 'text-on-surface-variant',
                  title: 'AI-powered responses',
                  desc: 'Our AI assistant helps admins respond faster with smart, context-aware categorization and professional reply suggestions.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container-highest hover:-translate-y-1 hover:shadow-md transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-6 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-[24px]">{feature.icon}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">{feature.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Extra feature row */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container-highest hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex gap-6">
                <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined">bar_chart</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Admin Analytics</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Visualize complaint trends by category, track resolution rates, and identify systemic issues at your institution.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container-highest hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex gap-6">
                <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center shrink-0 text-on-secondary-container">
                  <span className="material-symbols-outlined">notifications</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Smart Notifications</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Students and staff get notified when admins respond. Admins get alerted on high-priority complaints.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section id="how-it-works" className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="font-bold text-[28px] sm:text-[32px] md:text-[36px] leading-tight tracking-tight text-on-surface mb-4">
                Three steps to resolution.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Simple, transparent, and fast.</p>
            </div>
            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-[2px] border-t-2 border-dashed border-outline-variant z-0" />
              <div className="grid md:grid-cols-3 gap-12 relative z-10">
                {[
                  { icon: 'person_add', step: '01', title: 'Create Account', desc: 'Sign up with your college email in seconds. No lengthy forms, no waiting for approval.' },
                  { icon: 'description', step: '02', title: 'Submit Complaint', desc: 'Select if you are a student or staff, describe the issue, pick a category, attach evidence photos, and submit.' },
                  { icon: 'check_circle', step: '03', title: 'Get a Resolution', desc: 'Admin reviews your complaint, AI assists with a reply, and you get notified when resolved.' },
                ].map((step, i) => (
                  <div key={step.step} className="text-center bg-surface p-6">
                    <div className="relative inline-block mb-6">
                      <div className="w-16 h-16 bg-surface-container-lowest border-2 border-primary rounded-full flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-primary text-[28px]">{step.icon}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-on-primary rounded-full flex items-center justify-center font-label-md text-[10px] font-bold">
                        {i + 1}
                      </div>
                    </div>
                    <h4 className="font-label-lg text-label-lg text-on-surface mb-2 text-[15px]">{step.title}</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* === CTA BANNER === */}
        <section
          className="py-20 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e0052 0%, #3b1fa8 50%, #7c3aed 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16" />
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center relative z-10">
            <h2 className="font-bold text-[26px] sm:text-[30px] md:text-[36px] leading-tight text-white mb-4">
              Join students and staff already using VoiceIt
            </h2>
            <p className="text-white/80 font-body-lg text-body-lg mb-8">
              Start resolving complaints faster, with full transparency and AI assistance.
            </p>
            {loggedInUser ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 font-label-lg text-label-lg px-8 py-4 bg-white text-primary rounded-lg shadow-sm hover:bg-surface-container-low active:scale-[0.98] transition-all"
              >
                Go to Dashboard
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 font-label-lg text-label-lg px-8 py-4 bg-surface-container-lowest text-primary rounded-lg shadow-sm hover:bg-surface-container-low active:scale-[0.98] transition-all"
              >
                Get Started Free
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* === FOOTER === */}
      <footer className="bg-surface-container-lowest py-10 border-t border-surface-container-high">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <VoiceItLogo />
            <p className="font-body-md text-body-md text-on-surface-variant text-center">
              © 2024 VoiceIt. Built for colleges. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors hover:underline">Privacy Policy</a>
              <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors hover:underline">Terms of Service</a>
              <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
