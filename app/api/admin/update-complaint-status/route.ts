import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerSupabase();
    const { data: adminUser } = await supabase
      .from('users').select('role').eq('clerk_id', userId).single();
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const complaintId = formData.get('complaintId') as string;
    const status = formData.get('status') as string;
    const admin_reply = formData.get('admin_reply') as string || '';
    const resolution_steps = formData.get('resolution_steps') as string || '';
    const imageFile = formData.get('in_review_image') as File | null;

    if (!complaintId) return NextResponse.json({ error: 'complaintId is required' }, { status: 400 });
    const validStatuses = ['Pending', 'In Review', 'Resolved'];
    if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

    let in_review_image_url: string | undefined;

    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image too large. Max 10 MB.' }, { status: 400 });
      }
      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `review/${complaintId}/${Date.now()}.${fileExt}`;
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
          cacheControl: '3600',
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('complaint-images')
          .getPublicUrl(fileName);
        in_review_image_url = urlData.publicUrl;
      }
    }

    const updatePayload: Record<string, any> = {
      status,
      is_read: false,
      admin_reply: admin_reply || null,
      resolution_steps: resolution_steps || null,
    };
    if (in_review_image_url) updatePayload.in_review_image_url = in_review_image_url;

    const { error: updateError } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', complaintId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath('/admin');

    return NextResponse.json({ success: true, in_review_image_url });
  } catch (err: any) {
    console.error('[update-complaint-status]', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
