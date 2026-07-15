'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateUser(formData: FormData) {
  const id = formData.get('id') as string
  const full_name = (formData.get('full_name') as string) || null
  const display_name = (formData.get('display_name') as string) || null
  const email = (formData.get('email') as string) || null
  const account_type = formData.get('account_type') as string
  const verification_status = formData.get('verification_status') as string
  const subscription_status = formData.get('subscription_status') as string

  await supabaseAdmin
    .from('profiles')
    .update({
      full_name,
      display_name,
      email,
      account_type,
      verification_status,
      subscription_status,
    })
    .eq('id', id)

  revalidatePath('/users')
}

export async function softDeleteUser(formData: FormData) {
  const id = formData.get('id') as string

  await supabaseAdmin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/users')
  revalidatePath('/users/kids')
  revalidatePath('/users/business')
}

export async function restoreUser(formData: FormData) {
  const id = formData.get('id') as string

  await supabaseAdmin
    .from('profiles')
    .update({ deleted_at: null })
    .eq('id', id)

  revalidatePath('/users')
  revalidatePath('/users/kids')
  revalidatePath('/users/business')
}
