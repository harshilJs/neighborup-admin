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
    .from('user_entitlements')
    .select('id, user_id, entitlement, product_id, active, store, expires_at, cancel_at_period_end, last_event_type, last_event_at, source')
    .order('last_event_at', { ascending: false, nullsFirst: false })
    .limit(50)

  const entitlementUserIds = Array.from(new Set((entitlements ?? []).map(e => e.user_id).filter(Boolean)))
  const { data: entitlementProfiles } = entitlementUserIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', entitlementUserIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const entitlementProfileMap = new Map((entitlementProfiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Subscriptions" description="Subscriptions and purchase history across RevenueCat and Stripe" />

      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Mobile Purchase History (RevenueCat / IAP)</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Store</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Last Event</th>
              </tr>
            </thead>
            <tbody>
              {entitlementsError && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                    Failed to load mobile purchase history: {entitlementsError.message}
                  </td>
                </tr>
              )}
              {!entitlementsError && entitlements?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    No in-app purchases recorded yet.
                  </td>
                </tr>
              )}
              {entitlements?.map(e => {
                const profile = entitlementProfileMap.get(e.user_id)
                return (
                  <tr key={e.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium leading-tight">{profile?.full_name ?? 'Unnamed'}</p>
                      <p className="text-gray-400 text-xs">{profile?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{e.product_id}</p>
                      <p className="text-gray-400 text-xs">{e.entitlement}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.store ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge label={e.active ? 'Active' : 'Expired'} color={e.active ? 'green' : 'gray'} />
                        {e.cancel_at_period_end && (
                          <StatusBadge label="Cancels at period end" color="amber" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <p>{e.last_event_type ?? '—'}</p>
                      <p className="text-gray-400 text-xs">{formatDate(e.last_event_at)}</p>
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
