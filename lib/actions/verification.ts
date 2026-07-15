'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateVerificationStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const update: { status: string; approved_at?: string } = { status }
  if (status === 'approved') update.approved_at = new Date().toISOString()
  await supabaseAdmin.from('verification_requests').update(update).eq('id', id)
  revalidatePath('/verification')
}
