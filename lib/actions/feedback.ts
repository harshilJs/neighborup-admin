'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateFeedbackStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  await supabaseAdmin
    .from('user_feedback')
    .update({ status })
    .eq('id', id)

  revalidatePath('/feedback')
}

export async function deleteFeedback(formData: FormData) {
  const id = formData.get('id') as string

  await supabaseAdmin.from('user_feedback').delete().eq('id', id)

  revalidatePath('/feedback')
}
