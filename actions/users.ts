'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { StudentDetails, TeacherDetails } from '@/types';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  return data;
}

export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'student') {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  
  // Verify current user is admin
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (currentUser?.role !== 'admin') throw new Error('Forbidden');

  // Prevent self-demotion
  const { data: targetUser } = await supabase
    .from('users')
    .select('clerk_id')
    .eq('id', targetUserId)
    .single();

  if (targetUser?.clerk_id === userId) {
    throw new Error('Cannot change your own role');
  }

  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', targetUserId);

  if (error) throw new Error('Failed to update role');
  revalidatePath('/admin/users');
}

export async function updateUserSettings(
  settings: { email_notifications?: boolean; name?: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from('users')
    .update(settings)
    .eq('clerk_id', userId);

  if (error) throw new Error('Failed to update settings: ' + error.message);
  revalidatePath('/settings');
}

export async function updateStudentDetails(details: StudentDetails) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();

  // Sanitise — only allow expected keys
  const sanitised: StudentDetails = {
    roll_number: details.roll_number?.trim() || undefined,
    department: details.department?.trim() || undefined,
    year: details.year?.trim() || undefined,
    phone: details.phone?.trim() || undefined,
    course: details.course?.trim() || undefined,
  };

  const { error } = await supabase
    .from('users')
    .update({ student_details: sanitised })
    .eq('clerk_id', userId);

  if (error) throw new Error('Failed to save student details: ' + error.message);
  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

export async function updateTeacherDetails(details: TeacherDetails) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();

  const sanitised: TeacherDetails = {
    employee_id: details.employee_id?.trim() || undefined,
    department: details.department?.trim() || undefined,
    designation: details.designation?.trim() || undefined,
    phone: details.phone?.trim() || undefined,
  };

  const { error } = await supabase
    .from('users')
    .update({ teacher_details: sanitised })
    .eq('clerk_id', userId);

  if (error) throw new Error('Failed to save staff details: ' + error.message);
  revalidatePath('/settings');
}

export async function uploadProfilePhoto(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();

  // Get user's DB id
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (userError) throw new Error('User lookup failed: ' + userError.message);
  if (!user) throw new Error('User not found in database. Please refresh and try again.');

  const imageFile = formData.get('avatar') as File | null;
  if (!imageFile || imageFile.size === 0) throw new Error('No image file provided');

  if (imageFile.size > 5 * 1024 * 1024) throw new Error('Image too large. Maximum size is 5 MB.');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(imageFile.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.');
  }

  // ── Auto-create bucket if it doesn't exist ──
  const { data: existingBuckets } = await supabase.storage.listBuckets();
  const profileBucketExists = existingBuckets?.some((b) => b.name === 'profile-images');
  if (!profileBucketExists) {
    const { error: createErr } = await supabase.storage.createBucket('profile-images', {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    });
    if (createErr && !createErr.message.includes('already exists')) {
      throw new Error('Failed to create storage bucket: ' + createErr.message);
    }
  }

  const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${user.id}/avatar.${fileExt}`;
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Delete old avatars first (ignore errors)
  await supabase.storage
    .from('profile-images')
    .remove([
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.jpeg`,
      `${user.id}/avatar.png`,
      `${user.id}/avatar.webp`,
      `${user.id}/avatar.gif`,
    ]);

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(fileName, buffer, {
      contentType: imageFile.type,
      upsert: true,
      cacheControl: '0',
    });

  if (uploadError) {
    throw new Error('Failed to upload image: ' + (uploadError.message || 'Unknown storage error'));
  }

  const { data: urlData } = supabase.storage
    .from('profile-images')
    .getPublicUrl(fileName);

  // Append cache-buster so the browser refreshes the image
  const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url })
    .eq('clerk_id', userId);

  if (updateError) throw new Error('Failed to save avatar URL: ' + updateError.message);

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  revalidatePath('/admin');

  return { avatar_url };
}
