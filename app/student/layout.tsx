import { redirect } from 'next/navigation';
import { getStudentSession } from '@/lib/student-session';
import { createServerSupabase } from '@/lib/supabase/server';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { StudentMobileBottomNav } from '@/components/layout/StudentMobileBottomNav';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getStudentSession();
  if (!session) redirect('/student-login');

  // Load full user from DB
  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, student_id, role, student_details, branch, semester')
    .eq('id', session.userId)
    .single();

  if (!user || user.role !== 'student') {
    redirect('/student-login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <StudentSidebar
        studentName={user.name}
        studentId={user.student_id || session.studentId}
        email={user.email}
      />

      {/* Main content */}
      <div className="lg:pl-[240px] min-h-screen flex flex-col">
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <StudentMobileBottomNav />
    </div>
  );
}
