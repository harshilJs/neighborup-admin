import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/format'

const STRIPE_STATUS_COLOR: Record<string, 'green' | 'red' | 'gray'> = {
  active: 'green',
  cancelled: 'red',
  expired: 'gray',
}

export const dynamic = 'force-dynamic'

function capitalize(value: string | null | undefined) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default async function SubscriptionsPage() {
  const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
    .from('subscriptions')
    .select('id, user_id, plan_type, amount, status, current_period_end, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const subscriptionUserIds = Array.from(new Set((subscriptions ?? []).map(s => s.user_id).filter(Boolean)))
  const { data: subscriptionProfiles } = subscriptionUserIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', subscriptionUserIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const subscriptionProfileMap = new Map((subscriptionProfiles ?? []).map(p => [p.id, p]))

  const { data: entitlements, error: entitlementsError } = await supabaseAdmin
    .from('user_active_entitlements')
    .select('user_id, entitlement, product_id, expires_at, cancel_at_period_end, source')
    .order('expires_at', { ascending: false, nullsFirst: false })
    .limit(50)

  const entitlementUserIds = Array.from(new Set((entitlements ?? []).map(e => e.user_id).filter(Boolean)))
  const { data: entitlementProfiles } = entitlementUserIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', entitlementUserIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const entitlementProfileMap = new Map((entitlementProfiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Subscriptions" description="Active entitlements across RevenueCat and Stripe" />

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Stripe Subscriptions</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Subscriber</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">Amount</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Renews</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionsError && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-red-400">
                    Failed to load Stripe subscriptions: {subscriptionsError.message}
                  </td>
                </tr>
              )}
              {!subscriptionsError && subscriptions?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No Stripe subscriptions yet.
                  </td>
                </tr>
              )}
              {subscriptions?.map(s => {
                const profile = subscriptionProfileMap.get(s.user_id)
                return (
                  <tr key={s.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium leading-tight">{profile?.full_name ?? 'Unnamed'}</p>
                      <p className="text-gray-500 text-xs">{profile?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{capitalize(s.plan_type)}</td>
                    <td className="px-4 py-3 text-gray-300">{formatCurrency(s.amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={s.status} color={STRIPE_STATUS_COLOR[s.status] ?? 'gray'} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(s.current_period_end)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Mobile Entitlements (RevenueCat)</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Entitlement</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {entitlementsError && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-red-400">
                    Failed to load mobile entitlements: {entitlementsError.message}
                  </td>
                </tr>
              )}
              {!entitlementsError && entitlements?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No active mobile entitlements.
                  </td>
                </tr>
              )}
              {entitlements?.map(e => {
                const profile = entitlementProfileMap.get(e.user_id)
                return (
                  <tr key={e.user_id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium leading-tight">{profile?.full_name ?? 'Unnamed'}</p>
                      <p className="text-gray-500 text-xs">{profile?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{e.entitlement}</td>
                    <td className="px-4 py-3 text-gray-300">{e.product_id}</td>
                    <td className="px-4 py-3 text-gray-300">{e.source}</td>
                    <td className="px-4 py-3 text-gray-400">
                      <div className="flex items-center gap-2">
                        <span>{formatDate(e.expires_at)}</span>
                        {e.cancel_at_period_end && (
                          <StatusBadge label="Cancels at period end" color="amber" />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
