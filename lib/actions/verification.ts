'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

async function geocodeAddress(line1: string, city: string, state: string, zipCode: string) {
  try {
    const query = encodeURIComponent([line1, city, state, zipCode].filter(Boolean).join(', '))
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { 'User-Agent': 'NeighborUp/1.0' },
    })
    const data = await res.json()
    if (data?.[0]) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }
    }
  } catch (err) {
    console.error('Geocoding failed:', err)
  }
  return null
}

export async function updateVerificationStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const update: { status: string; approved_at?: string } = { status }
  if (status === 'approved') update.approved_at = new Date().toISOString()
  await supabaseAdmin.from('verification_requests').update(update).eq('id', id)

  if (status === 'approved') {
    const { data: vr } = await supabaseAdmin
      .from('verification_requests')
      .select('user_id, address_line1, city, state, zip_code')
      .eq('id', id)
      .maybeSingle()

    if (vr?.address_line1) {
      const formattedAddress = `${vr.address_line1}, ${vr.city}, ${vr.state} ${vr.zip_code}`
      const profileUpdate: Record<string, unknown> = {
        address: formattedAddress,
        location: formattedAddress,
        billing_address: {
          line1: vr.address_line1,
          city: vr.city,
          state: vr.state,
          postal_code: vr.zip_code,
        },
      }
      const coords = await geocodeAddress(vr.address_line1, vr.city, vr.state, vr.zip_code)
      if (coords) {
        profileUpdate.latitude = coords.latitude
        profileUpdate.longitude = coords.longitude
      }
      await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', vr.user_id)
    }
  }

  revalidatePath('/verification')
}
