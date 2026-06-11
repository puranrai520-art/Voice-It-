'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createComplaint(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!user) throw new Error('User not found');

  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const complaint_type = (formData.get('complaint_type') as string) || 'student';
  const imageFile = formData.get('image') as File | null;

  if (!title?.trim()) throw new Error('Title is required.');
  if (!category?.trim()) throw new Error('Category is required.');
  if (!description?.trim() || description.trim().length < 10)
    throw new Error('Description must be at least 10 characters.');

  let image_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    // 10 MB limit
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('Image too large. Maximum size is 10 MB.');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Invalid image type. Use JPEG, PNG, WEBP, or GIF.');
    }

    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Auto-create bucket if it doesn't exist ──
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const complaintBucketExists = existingBuckets?.some((b) => b.name === 'complaint-images');
    if (!complaintBucketExists) {
      const { error: createErr } = await supabase.storage.createBucket('complaint-images', {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });
      if (createErr && !createErr.message.includes('already exists')) {
        console.error('Bucket creation error:', createErr.message);
        // Don't block — continue without image
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('complaint-images')
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError.message);
      // Don't block complaint submission — just skip image
    } else {
      const { data: urlData } = supabase.storage
        .from('complaint-images')
        .getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }
  }

  const { error } = await supabase.from('complaints').insert({
    user_id: user.id,
    title: title.trim(),
    category,
    description: description.trim(),
    complaint_type,
    image_url,
    status: 'Pending',
  });

  if (error) throw new Error('Failed to submit complaint: ' + error.message);

  revalidatePath('/my-complaints');
  revalidatePath('/dashboard');
  redirect('/my-complaints');
}

export async function deleteComplaint(complaintId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_id', userId)
    .single();

  if (!user) throw new Error('User not found');

  // Fetch complaint to check ownership
  const { data: complaint } = await supabase
    .from('complaints')
    .select('id, user_id, status, image_url')
    .eq('id', complaintId)
    .single();

  if (!complaint) throw new Error('Complaint not found');

  // Students can only delete their own complaints
  if (user.role !== 'admin' && complaint.user_id !== user.id) {
    throw new Error('Forbidden: Not your complaint');
  }

  // Delete image from storage if present
  if (complaint.image_url) {
    try {
      const url = new URL(complaint.image_url);
      const pathParts = url.pathname.split('/complaint-images/');
      if (pathParts[1]) {
        await supabase.storage.from('complaint-images').remove([pathParts[1].split('?')[0]]);
      }
    } catch { /* ignore storage errors */ }
  }

  // Delete associated comments first
  await supabase.from('complaint_comments').delete().eq('complaint_id', complaintId);

  const { error } = await supabase.from('complaints').delete().eq('id', complaintId);
  if (error) throw new Error('Failed to delete complaint: ' + error.message);

  revalidatePath('/my-complaints');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function updateComplaint(
  complaintId: string,
  data: { title: string; description: string; category: string; complaint_type: string }
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_id', userId)
    .single();

  if (!user) throw new Error('User not found');

  const { data: complaint } = await supabase
    .from('complaints')
    .select('id, user_id, status')
    .eq('id', complaintId)
    .single();

  if (!complaint) throw new Error('Complaint not found');

  // Students can only edit their own complaints (not Resolved ones)
  if (user.role !== 'admin') {
    if (complaint.user_id !== user.id) throw new Error('Forbidden: Not your complaint');
    if (complaint.status === 'Resolved') throw new Error('Cannot edit a resolved complaint');
  }

  if (!data.title?.trim()) throw new Error('Title is required');
  if (!data.description?.trim() || data.description.trim().length < 10)
    throw new Error('Description must be at least 10 characters');
  if (!data.category?.trim()) throw new Error('Category is required');

  const { error } = await supabase
    .from('complaints')
    .update({
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      complaint_type: data.complaint_type,
    })
    .eq('id', complaintId);

  if (error) throw new Error('Failed to update complaint: ' + error.message);

  revalidatePath(`/complaints/${complaintId}`);
  revalidatePath('/my-complaints');
  revalidatePath('/admin');
}


export async function updateComplaintStatus(complaintId: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (user?.role !== 'admin') throw new Error('Forbidden');

  const { error } = await supabase
    .from('complaints')
    .update({ status })
    .eq('id', complaintId);

  if (error) throw new Error('Failed to update status');
  revalidatePath('/admin');
  revalidatePath(`/complaints/${complaintId}`);
}

export async function saveAdminReply(complaintId: string, admin_reply: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (user?.role !== 'admin') throw new Error('Forbidden');

  const { error } = await supabase
    .from('complaints')
    .update({ admin_reply, status, is_read: false })
    .eq('id', complaintId);

  if (error) throw new Error('Failed to save reply');
  revalidatePath(`/complaints/${complaintId}`);
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function markComplaintRead(complaintId: string) {
  const { userId } = await auth();
  if (!userId) return;

  const supabase = createServerSupabase();
  await supabase
    .from('complaints')
    .update({ is_read: true })
    .eq('id', complaintId);

  revalidatePath('/my-complaints');
  revalidatePath('/dashboard');
}

export async function getUnreadCount(clerkId: string): Promise<number> {
  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return 0;

  const { count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('admin_reply', 'is', null)
    .eq('is_read', false);

  return count || 0;
}

export async function bulkUpdateStatus(complaintIds: string[], status: string) {
  'use server';
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (user?.role !== 'admin') throw new Error('Forbidden: Admin only');

  const validStatuses = ['Pending', 'In Review', 'Resolved'];
  if (!validStatuses.includes(status)) throw new Error('Invalid status');

  const { error } = await supabase
    .from('complaints')
    .update({ status })
    .in('id', complaintIds);

  if (error) throw new Error('Failed to bulk update: ' + error.message);

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function submitRating(complaintId: string, rating: number) {
  'use server';
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_id', userId)
    .single();

  if (!user) throw new Error('User not found');
  if (user.role === 'admin') throw new Error('Admins cannot rate complaints');

  // Ensure complaint belongs to this user and is resolved
  const { data: complaint } = await supabase
    .from('complaints')
    .select('id, user_id, status')
    .eq('id', complaintId)
    .eq('user_id', user.id)
    .single();

  if (!complaint) throw new Error('Complaint not found or not yours');
  if (complaint.status !== 'Resolved') throw new Error('Can only rate resolved complaints');

  const { error } = await supabase
    .from('complaints')
    .update({ rating })
    .eq('id', complaintId);

  if (error) throw new Error('Failed to save rating: ' + error.message);

  revalidatePath(`/complaints/${complaintId}`);
  revalidatePath('/my-complaints');
}

export async function addComplaintComment(
  complaintId: string,
  message: string,
  stageLabel?: string
) {
  'use server';
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('clerk_id', userId)
    .single();

  if (!user) throw new Error('User not found');
  if (user.role !== 'admin') throw new Error('Only admins can add stage notes');

  const { error } = await supabase.from('complaint_comments').insert({
    complaint_id: complaintId,
    author_id: user.id,
    stage_label: stageLabel || null,
    message: message.trim(),
    is_admin_note: true,
  });

  if (error) throw new Error('Failed to add comment: ' + error.message);

  revalidatePath(`/complaints/${complaintId}`);
}

export async function getComplaintComments(complaintId: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('complaint_comments')
    .select('*, author:users(name, avatar_url, role)')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

/** Admin: update complaint status with optional reply, resolution steps */
export async function updateComplaintStatusWithDetails(
  complaintId: string,
  data: {
    status: string;
    admin_reply?: string;
    resolution_steps?: string;
    in_review_image_url?: string;
  }
) {
  'use server';
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (user?.role !== 'admin') throw new Error('Forbidden');

  const validStatuses = ['Pending', 'In Review', 'Resolved'];
  if (!validStatuses.includes(data.status)) throw new Error('Invalid status');

  const updatePayload: Record<string, any> = {
    status: data.status,
    is_read: false,
  };

  if (data.admin_reply !== undefined) updatePayload.admin_reply = data.admin_reply;
  if (data.resolution_steps !== undefined) updatePayload.resolution_steps = data.resolution_steps;
  if (data.in_review_image_url !== undefined) updatePayload.in_review_image_url = data.in_review_image_url;

  const { error } = await supabase
    .from('complaints')
    .update(updatePayload)
    .eq('id', complaintId);

  if (error) throw new Error('Failed to update complaint: ' + error.message);

  revalidatePath(`/complaints/${complaintId}`);
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

