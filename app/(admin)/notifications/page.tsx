import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { data: notifications, error } = await supabaseAdmin
    .from('notifications')
    .select('id, user_id, type, title, content, read, related_user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = Array.from(new Set((notifications ?? []).map(n => n.user_id).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Push Campaigns" description="Send targeted push notifications to users" />

      <p className="text-gray-400 text-sm mb-4">Showing the notification log. Composing and sending new campaigns isn&apos;t wired up yet — no push provider integration exists in this codebase.</p>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Recipient</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Sent</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                  Failed to load notifications: {error.message}
                </td>
              </tr>
            )}
            {!error && notifications?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No notifications yet.
                </td>
              </tr>
            )}
            {notifications?.map(n => (
              <tr key={n.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">
                  {profileMap.get(n.user_id)?.full_name ?? profileMap.get(n.user_id)?.email ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-700">{n.type}</td>
                <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={n.content ?? undefined}>
                  {n.title ?? (n.content ? `${n.content.slice(0, 60)}${n.content.length > 60 ? '…' : ''}` : '—')}
                </td>
                <td className="px-4 py-3">
                  {n.read ? <StatusBadge label="Read" color="gray" /> : <StatusBadge label="Unread" color="blue" />}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(n.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
