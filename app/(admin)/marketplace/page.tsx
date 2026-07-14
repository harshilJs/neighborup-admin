import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const { data: listings, error } = await supabaseAdmin
    .from('marketplace_listings')
    .select('id, user_id, title, description, price, category, condition, is_sold, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = Array.from(new Set((listings ?? []).map(l => l.user_id).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div>
      <PageHeader title="Marketplace" description="Listings, sellers, and disputes" />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Listing</th>
              <th className="text-left px-4 py-3 font-medium">Seller</th>
              <th className="text-left px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Listed</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                  Failed to load listings: {error.message}
                </td>
              </tr>
            )}
            {!error && listings?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No listings yet.
                </td>
              </tr>
            )}
            {listings?.map(listing => {
              const meta = [listing.category, listing.condition].filter(Boolean).join(' · ')
              const seller = profileMap.get(listing.user_id)
              return (
                <tr key={listing.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium">{listing.title}</p>
                    {meta && <p className="text-gray-400 text-xs">{meta}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{seller?.full_name ?? seller?.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {listing.price != null ? currencyFormatter.format(listing.price) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {listing.is_sold ? (
                      <StatusBadge label="Sold" color="gray" />
                    ) : (
                      <StatusBadge label="Active" color="green" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(listing.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
