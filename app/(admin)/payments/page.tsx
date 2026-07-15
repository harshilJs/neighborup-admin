import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime, firstNonEmpty } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function Page() {
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
      <PageHeader title="Payment History" description="Mobile in-app purchase history" />

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
                      <p className="text-gray-900 font-medium leading-tight">{firstNonEmpty(profile?.full_name) ?? 'Unnamed'}</p>
                      <p className="text-gray-400 text-xs">{firstNonEmpty(profile?.email) ?? '—'}</p>
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
