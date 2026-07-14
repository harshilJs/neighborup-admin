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

  return (
    <div>
      <PageHeader title="Payment History" description="Stripe transactions, refunds, and revenue" />

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Payment Status</th>
              <th className="text-left px-4 py-3 font-medium">Order Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-400">
                  Failed to load payments: {error.message}
                </td>
              </tr>
            )}
            {!error && orders?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No payments recorded yet.
                </td>
              </tr>
            )}
            {orders?.map(order => {
              const userId = order.customer_id ? customerToUserMap.get(order.customer_id) : undefined
              const profile = userId ? profileMap.get(userId) : undefined
              const customerLabel = profile?.full_name ?? profile?.email ?? order.customer_id ?? '—'
              return (
                <tr key={order.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-300">{customerLabel}</td>
                  <td className="px-4 py-3 text-gray-300">{formatCurrency(order.amount_total, order.currency)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{order.payment_status}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={order.status} color={ORDER_STATUS_COLOR[order.status] ?? 'gray'} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDateTime(order.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
