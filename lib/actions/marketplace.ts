'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateListing(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const category = formData.get('category') as string
  const condition = formData.get('condition') as string
  const is_sold = formData.get('is_sold') === 'true'

  await supabaseAdmin
    .from('marketplace_listings')
    .update({
      title,
      description,
      price: price ? Number(price) : null,
      category: category || null,
      condition: condition || null,
      is_sold,
    })
    .eq('id', id)

  revalidatePath('/marketplace')
}

export async function deleteListing(formData: FormData) {
  const id = formData.get('id') as string

  await supabaseAdmin.from('marketplace_listings').delete().eq('id', id)

  revalidatePath('/marketplace')
}
