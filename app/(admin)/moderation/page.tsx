import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function reviewModerationItem(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const flagged = formData.get('flagged') as string
  await supabaseAdmin
    .from('moderation_results')
    .update({ flagged: flagged === 'true', reviewed_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/moderation')
}

export default async function Page() {
  const { data: items, error } = await supabaseAdmin
    .from('moderation_results')
    .select('id, content_type, content_id, owner_id, image_url, flagged, labels, reviewed_by, reviewed_at, created_at')
    .eq('flagged', true)
    .order('reviewed_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false })
    .limit(100)

  const ownerIds = Array.from(new Set((items ?? []).map(i => i.owner_id).filter(Boolean)))
  const { data: profiles } = ownerIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', ownerIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Moderation Queue" description="Flagged posts, comments, images, and listings" />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Content</th>
              <th className="text-left px-4 py-3 font-medium">Owner</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Flagged</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                  Failed to load moderation queue: {error.message}
                </td>
              </tr>
            )}
            {!error && items?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No flagged content.
                </td>
              </tr>
            )}
            {items?.map(item => (
              <tr key={item.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-gray-700">{item.content_type}</p>
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt="" className="w-10 h-10 rounded object-cover mt-1" />
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {profileMap.get(item.owner_id)?.full_name ?? profileMap.get(item.owner_id)?.email ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {item.reviewed_at ? (
                    <StatusBadge label="Reviewed" color="blue" />
                  ) : (
                    <StatusBadge label="Pending" color="amber" />
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.labels ? (
                    <span
                      className="text-xs text-gray-400 max-w-[200px] truncate block"
                      title={JSON.stringify(item.labels)}
                    >
                      {JSON.stringify(item.labels)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  {!item.reviewed_at && (
                    <div className="flex items-center gap-3">
                      <form action={reviewModerationItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="flagged" value="false" />
                        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Dismiss</button>
                      </form>
                      <form action={reviewModerationItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="flagged" value="true" />
                        <button className="text-xs text-red-600 hover:text-red-700 font-medium">Confirm Flag</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
