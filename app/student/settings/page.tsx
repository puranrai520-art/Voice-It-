import { redirect } from 'next/navigation';
import { getStudentSession } from '@/lib/student-session';
import { createServerSupabase } from '@/lib/supabase/server';
import { StudentSettingsClient } from './StudentSettingsClient';

export const metadata = {
  title: 'Settings — VoiceIt Student Portal',
  description: 'Manage your preferences and account settings',
};

export default async function StudentSettingsPage() {
  const session = await getStudentSession();
  if (!session) redirect('/student-login');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, student_id')
    .eq('id', session.userId)
    .single();

  if (!user) redirect('/student-login');

  return (
    <StudentSettingsClient
      studentId={user.student_id || session.studentId}
      email={user.email}
      name={user.name}
    />
  );
}
