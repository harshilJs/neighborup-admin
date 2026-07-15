'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateReportStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  await supabaseAdmin
    .from('reports')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/reports')
}
