import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime, firstNonEmpty } from '@/lib/format'

export const dynamic = 'force-dynamic'

const METHOD_LABEL: Record<string, string> = {
  native_share: 'Share sheet',
  clipboard_copy: 'Copied link',
}

export default async function InvitesPage() {
  const [{ data: shareEvents, error: shareError }, { data: referrals, error: referralError }] = await Promise.all([
    supabaseAdmin
      .from('share_events')
      .select('id, user_id, method, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseAdmin
      .from('referrals')
      .select('id, referrer_id, referred_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const userIds = Array.from(new Set([
    ...(shareEvents ?? []).map(s => s.user_id),
    ...(referrals ?? []).flatMap(r => [r.referrer_id, r.referred_id]),
  ].filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
  const nameFor = (id: string | null) => firstNonEmpty(profileMap.get(id ?? '')?.full_name, profileMap.get(id ?? '')?.email) ?? '—'

  return (
    <div className="space-y-8">
      <PageHeader title="Invites & Sharing" description="Who's sharing their invite link, and who it converted" />

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Share Activity</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Method</th>
                <th className="text-left px-4 py-3 font-medium">Shared At</th>
              </tr>
            </thead>
            <tbody>
              {shareError && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-red-600">
                    Failed to load share activity: {shareError.message}
                  </td>
                </tr>
              )}
              {!shareError && shareEvents?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                    No share activity yet.
                  </td>
                </tr>
              )}
              {shareEvents?.map(s => (
                <tr key={s.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{nameFor(s.user_id)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={METHOD_LABEL[s.method] ?? s.method} color={s.method === 'native_share' ? 'blue' : 'gray'} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Successful Referrals</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Referrer</th>
                <th className="text-left px-4 py-3 font-medium">New Member</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {referralError && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-red-600">
                    Failed to load referrals: {referralError.message}
                  </td>
                </tr>
              )}
              {!referralError && referrals?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                    No referral signups yet.
                  </td>
                </tr>
              )}
              {referrals?.map(r => (
                <tr key={r.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{nameFor(r.referrer_id)}</td>
                  <td className="px-4 py-3 text-gray-700">{nameFor(r.referred_id)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
