import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerSupabase();

    // Verify admin
    const { data: adminUser } = await supabase
      .from('users').select('role').eq('clerk_id', userId).single();
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { email, password, student_id, course, branch, roll_number, semester, year, name } = await req.json();

    // Validate required fields
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    if (!password?.trim() || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    if (!student_id?.trim()) return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    if (!course?.trim()) return NextResponse.json({ error: 'Course is required.' }, { status: 400 });
    if (!branch?.trim()) return NextResponse.json({ error: 'Branch is required.' }, { status: 400 });
    if (!roll_number?.trim()) return NextResponse.json({ error: 'Roll Number is required.' }, { status: 400 });
    if (!semester?.trim()) return NextResponse.json({ error: 'Semester is required.' }, { status: 400 });
    if (!year?.trim()) return NextResponse.json({ error: 'Academic Year is required.' }, { status: 400 });

    // Check uniqueness
    const { data: existingById } = await supabase
      .from('users').select('id').eq('student_id', student_id.trim()).single();
    if (existingById) return NextResponse.json({ error: 'A student with this Student ID already exists.' }, { status: 409 });

    const { data: existingByEmail } = await supabase
      .from('users').select('id').eq('email', email.trim().toLowerCase()).single();
    if (existingByEmail) return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert student (no Clerk account — DB only)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        clerk_id: null,
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        role: 'student',
        user_type: 'student',
        student_id: student_id.trim(),
        branch: branch.trim(),
        semester: semester.trim(),
        password_hash,
        student_details: {
          course: course.trim(),
          roll_number: roll_number.trim(),
          year: year.trim(),
          department: branch.trim(),
        },
      })
      .select('id, email, student_id')
      .single();

    if (insertError) {
      console.error('[create-student]', insertError);
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Student ID or email already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create student: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, student: newUser });
  } catch (err: any) {
    console.error('[create-student]', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
