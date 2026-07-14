import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import UsersFilters from '@/components/UsersFilters'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate, initials } from '@/lib/format'

const TYPE_LABELS: Record<string, string> = {
  regular: 'Neighbor',
  business: 'Business',
  official: 'Official',
  kid: 'Kid',
}

const VERIFICATION_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

const SUBSCRIPTION_COLOR: Record<string, 'green' | 'gray' | 'red'> = {
  active: 'green',
  none: 'gray',
  expired: 'red',
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; verification?: string; subscription?: string }>
}) {
  const { q, type, verification, subscription } = await searchParams

  let query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, display_name, email, account_type, verification_status, subscription_status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (q) {
    const safeQ = q.replace(/[,()%]/g, '')
    query = query.or(`full_name.ilike.%${safeQ}%,email.ilike.%${safeQ}%`)
  }
  if (type) query = query.eq('account_type', type)
  if (verification) query = query.eq('verification_status', verification)
  if (subscription) query = query.eq('subscription_status', subscription)

  const { data: users, error } = await query

  return (
    <div>
      <PageHeader title="All Users" description="Search, view, and manage every profile on the platform" />

      <Suspense fallback={<div className="h-10 mb-5" />}>
        <UsersFilters />
      </Suspense>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Verification</th>
              <th className="text-left px-4 py-3 font-medium">Subscription</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                  Failed to load users: {error.message}
                </td>
              </tr>
            )}
            {!error && users?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No users match these filters.
                </td>
              </tr>
            )}
            {users?.map(user => (
              <tr key={user.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-700 font-medium shrink-0">
                      {initials(user.display_name ?? user.full_name)}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium leading-tight">{user.display_name ?? user.full_name ?? 'Unnamed'}</p>
                      <p className="text-gray-400 text-xs">{user.email ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{TYPE_LABELS[user.account_type] ?? user.account_type}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={user.verification_status ?? 'pending'}
                    color={VERIFICATION_COLOR[user.verification_status ?? 'pending'] ?? 'gray'}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={user.subscription_status ?? 'none'}
                    color={SUBSCRIPTION_COLOR[user.subscription_status ?? 'none'] ?? 'gray'}
                  />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
