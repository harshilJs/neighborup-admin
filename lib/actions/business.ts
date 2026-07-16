'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateReviewStatus(formData: FormData) {
  const id = formData.get('id') as string
  const userId = formData.get('user_id') as string
  const status = formData.get('status') as string

  await supabaseAdmin
    .from('pending_reviews')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  // Sync the profile: is_verified drives app access; verification_status drives admin display
  if (userId && (status === 'approved' || status === 'rejected')) {
    await supabaseAdmin.from('profiles').update({
      verification_status: status,
      is_verified: status === 'approved',
      review_status: status,
    }).eq('id', userId)
  }

  revalidatePath('/users/business')
}
