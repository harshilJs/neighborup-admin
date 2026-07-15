'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateGroup(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const is_private = formData.get('is_private') === 'true'

  await supabaseAdmin
    .from('groups')
    .update({
      name,
      description,
      category: category || null,
      is_private,
    })
    .eq('id', id)

  revalidatePath('/groups')
}

export async function deleteGroup(formData: FormData) {
  const id = formData.get('id') as string

  // No soft-delete column on groups — this is permanent. Clean up dependent rows
  // first so nothing is left orphaned regardless of DB-level cascade rules.
  await supabaseAdmin.from('group_members').delete().eq('group_id', id)
  await supabaseAdmin.from('group_invites').delete().eq('group_id', id)
  await supabaseAdmin.from('group_posts').delete().eq('group_id', id)
  await supabaseAdmin.from('groups').delete().eq('id', id)

  revalidatePath('/groups')
}
