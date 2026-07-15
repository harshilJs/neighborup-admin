import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime, formatCurrency } from '@/lib/format'

export const dynamic = 'force-dynamic'

const ORDER_STATUS_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  completed: 'green',
  pending: 'amber',
  canceled: 'red',
}

export default async function Page() {
  const { data: orders, error } = await supabaseAdmin
    .from('stripe_orders')
    .select('id, checkout_session_id, customer_id, amount_total, amount_subtotal, currency, payment_status, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const customerIds = Array.from(new Set((orders ?? []).map(o => o.customer_id).filter(Boolean)))
  const { data: stripeCustomers } = customerIds.length
    ? await supabaseAdmin.from('stripe_customers').select('user_id, customer_id').in('customer_id', customerIds)
    : { data: [] as { user_id: string; customer_id: string }[] }
  const customerToUserMap = new Map((stripeCustomers ?? []).map(c => [c.customer_id, c.user_id]))

  const userIds = Array.from(new Set((stripeCustomers ?? []).map(c => c.user_id).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const { data: iapPurchases, error: iapError } = await supabaseAdmin
    .from('user_entitlements')
    .select('id, user_id, product_id, entitlement, active, store, last_event_type, last_event_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const iapUserIds = Array.from(new Set((iapPurchases ?? []).map(p => p.user_id).filter(Boolean)))
  const { data: iapProfiles } = iapUserIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', iapUserIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const iapProfileMap = new Map((iapProfiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Payment History" description="Stripe transactions and mobile in-app purchases" />

      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">In-App Purchases (Mobile)</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Store</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {iapError && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                    Failed to load in-app purchases: {iapError.message}
                  </td>
                </tr>
              )}
              {!iapError && iapPurchases?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    No in-app purchases recorded yet.
                  </td>
                </tr>
              )}
              {iapPurchases?.map(p => {
                const profile = iapProfileMap.get(p.user_id)
                return (
                  <tr key={p.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-gray-900 font-medium leading-tight">{profile?.full_name ?? 'Unnamed'}</p>
                      <p className="text-gray-400 text-xs">{profile?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{p.product_id}</p>
                      <p className="text-gray-400 text-xs">{p.entitlement}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.store ?? '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={p.active ? 'Active' : 'Expired'} color={p.active ? 'green' : 'gray'} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(p.created_at)}</td>
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
