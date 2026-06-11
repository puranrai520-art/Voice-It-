import { redirect } from 'next/navigation';
import { getStudentSession } from '@/lib/student-session';
import { createServerSupabase } from '@/lib/supabase/server';

export const metadata = {
  title: 'My Profile — VoiceIt Student Portal',
  description: 'Your registered student profile details',
};

export default async function StudentProfilePage() {
  const session = await getStudentSession();
  if (!session) redirect('/student-login');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, student_id, branch, semester, student_details, created_at')
    .eq('id', session.userId)
    .single();

  if (!user) redirect('/student-login');

  const displayName = user.name || user.student_id || 'Student';
  const rollNumber = user.student_details?.roll_number || '—';
  const course = user.student_details?.course || '—';
  const year = user.student_details?.year || '—';
  const department = user.student_details?.department || user.branch || '—';

  const fields = [
    { label: 'Full Name', value: user.name || '—', icon: 'person' },
    { label: 'Student ID', value: user.student_id || '—', icon: 'badge' },
    { label: 'Gmail Address', value: user.email, icon: 'email' },
    { label: 'Course', value: course, icon: 'school' },
    { label: 'Branch / Department', value: department, icon: 'account_tree' },
    { label: 'Roll Number', value: rollNumber, icon: 'tag' },
    { label: 'Semester', value: user.semester || '—', icon: 'calendar_month' },
    { label: 'Academic Year', value: year, icon: 'event' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">My Profile</h1>
        <p className="text-on-surface-variant text-sm mt-0.5">Your registered academic details</p>
      </div>

      {/* Avatar + name card */}
      <div className="relative bg-gradient-to-br from-[#1e0052] via-[#2d0074] to-[#3b1fa8] rounded-3xl p-6 mb-6 overflow-hidden shadow-lg">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/30 text-white flex items-center justify-center font-bold text-[24px] shrink-0 shadow-lg">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            <p className="text-white/60 text-sm">{user.email}</p>
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 mt-2">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              Student
            </span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20">
          <h3 className="font-semibold text-on-surface text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            Academic Information
          </h3>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-primary/8 dark:bg-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] text-primary">{field.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">{field.label}</p>
                <p className="text-sm text-on-surface font-medium truncate">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-on-surface-variant text-xs mt-5">
        Profile details are managed by your institution's admin.<br />
        Contact admin if any information is incorrect.
      </p>
    </div>
  );
}
