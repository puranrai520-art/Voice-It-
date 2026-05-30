import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { SettingsClient } from './SettingsClient';

export const metadata = {
  title: 'Settings — VoiceIt',
  description: 'Manage your account preferences',
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (!user) redirect('/sign-in');

  const displayName = user.name || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Manage your account, profile details, and preferences
        </p>
      </div>

      {/* Profile summary card */}
      <div className="bg-gradient-to-br from-[#1e0052] to-[#3b1fa8] rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-lg relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-grid-pattern" />

        <div className="relative shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-4 border-white/20 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[22px] shadow-md backdrop-blur-sm border border-white/30">
              {initials}
            </div>
          )}
          {/* Online indicator */}
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
        </div>

        <div className="relative flex-1 min-w-0">
          <p className="font-headline-md text-headline-md text-white font-bold truncate">
            {displayName}
          </p>
          <p className="font-body-md text-body-md text-white/70 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 font-label-md text-label-md px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                user.role === 'admin'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/10 text-white/80 border border-white/20'
              }`}
            >
              {user.role === 'admin' && (
                <span
                  className="material-symbols-outlined text-[11px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield
                </span>
              )}
              {user.role === 'student' && (
                <span className="material-symbols-outlined text-[11px]">school</span>
              )}
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <SettingsClient
        initialName={user.name || ''}
        initialEmailNotifications={user.email_notifications ?? true}
        initialAvatarUrl={user.avatar_url ?? null}
        userInitials={initials}
        userRole={user.role as 'student' | 'admin'}
        initialStudentDetails={user.student_details ?? null}
        initialTeacherDetails={user.teacher_details ?? null}
      />
    </div>
  );
}
