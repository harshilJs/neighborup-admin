import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client — bypasses RLS. Only use server-side.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BUSINESS_DOCS_BUCKET = 'business-docs'

// Newer submissions store business verification docs as "business-docs/<uid>/<file>"
// (bucket name + object path, not a URL) in a private bucket — unlike the public
// buckets (post-images, marketplace, profile-photos), this can't be rendered
// directly and needs a short-lived signed URL generated with the service role key.
// Older rows already hold a full URL (public or a previously-signed link) — leave
// those untouched, since they're not a valid object key in this bucket.
export async function signBusinessDocUrls(paths: (string | null | undefined)[]) {
  const keys = Array.from(new Set(paths.filter((p): p is string => !!p && !/^https?:\/\//.test(p))))
  const map = new Map<string, string>()
  if (!keys.length) return map

  const objectPaths = keys.map(k =>
    k.startsWith(`${BUSINESS_DOCS_BUCKET}/`) ? k.slice(BUSINESS_DOCS_BUCKET.length + 1) : k
  )

  const { data } = await supabaseAdmin.storage.from(BUSINESS_DOCS_BUCKET).createSignedUrls(objectPaths, 3600)

  data?.forEach((entry, i) => {
    if (entry.signedUrl) map.set(keys[i], entry.signedUrl)
  })
  return map
}
