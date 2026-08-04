import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import FeedbackActionsMenu from '@/components/FeedbackActionsMenu'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime, firstNonEmpty } from '@/lib/format'

export const dynamic = 'force-dynamic'

const CATEGORY_COLOR: Record<string, 'red' | 'amber' | 'purple' | 'blue'> = {
  bug: 'red',
  suggestion: 'amber',
  compliment: 'purple',
  other: 'blue',
}

const STATUS_COLOR: Record<string, 'amber' | 'blue' | 'green'> = {
  new: 'amber',
  reviewed: 'blue',
  resolved: 'green',
}

export default async function FeedbackPage() {
  const { data: submissions, error } = await supabaseAdmin
    .from('user_feedback')
    .select('id, user_id, category, message, app_version, device_info, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = Array.from(new Set((submissions ?? []).map(s => s.user_id).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="App Feedback" description="Bug reports, suggestions, and comments submitted from inside the app" />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Message</th>
              <th className="text-left px-4 py-3 font-medium">Device</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Submitted</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-red-600">
                  Failed to load feedback: {error.message}
                </td>
              </tr>
            )}
            {!error && submissions?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No feedback submitted yet.
                </td>
              </tr>
            )}
            {submissions?.map(s => {
              const profile = profileMap.get(s.user_id)
              const user = firstNonEmpty(profile?.full_name, profile?.email) ?? '—'
              return (
                <tr key={s.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{user}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={s.category} color={CATEGORY_COLOR[s.category] ?? 'blue'} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-sm">
                    <p className="line-clamp-2" title={s.message}>{s.message}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {s.device_info ?? '—'}{s.app_version ? ` · v${s.app_version}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={s.status} color={STATUS_COLOR[s.status] ?? 'gray'} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(s.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <FeedbackActionsMenu id={s.id} status={s.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
