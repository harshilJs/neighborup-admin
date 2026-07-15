'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updatePost(formData: FormData) {
  const id = formData.get('id') as string
  const content = formData.get('content') as string
  const is_business_post = formData.get('is_business_post') === 'true'
  const image_urls = JSON.parse((formData.get('image_urls') as string) || '[]') as string[]

  await supabaseAdmin
    .from('posts')
    .update({
      content,
      is_business_post,
      image_urls,
      image_url: image_urls[0] ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/posts')
}

export async function deletePost(formData: FormData) {
  const id = formData.get('id') as string

  // No soft-delete column on posts — this is permanent. Clean up dependent rows
  // first so nothing is left orphaned regardless of DB-level cascade rules.
  await supabaseAdmin.from('post_comments').delete().eq('post_id', id)
  await supabaseAdmin.from('post_likes').delete().eq('post_id', id)
  await supabaseAdmin.from('post_views').delete().eq('post_id', id)
  await supabaseAdmin.from('posts').delete().eq('id', id)

  revalidatePath('/posts')
}
