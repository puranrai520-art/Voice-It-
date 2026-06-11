import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditComplaintClient } from './EditComplaintClient';

export default async function EditComplaintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_id', userId)
    .single();

  if (!user) redirect('/sign-in');

  const { data: complaint } = await supabase
    .from('complaints')
    .select('*')
    .eq('id', id)
    .single();

  if (!complaint) redirect('/my-complaints');

  // Students can only edit their own non-resolved complaints
  if (user.role !== 'admin') {
    if (complaint.user_id !== user.id) redirect('/403');
    if (complaint.status === 'Resolved') redirect(`/complaints/${id}`);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
      <EditComplaintClient complaint={complaint} isAdmin={user.role === 'admin'} />
    </div>
  );
}
