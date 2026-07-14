import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate, formatDateTime } from '@/lib/format'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

const TYPE_COLOR: Record<string, 'blue' | 'purple'> = {
  business: 'blue',
  official: 'purple',
}

const VERIFICATION_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

async function updateReviewStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await supabaseAdmin
    .from('pending_reviews')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/users/business')
}

export default async function Page() {
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, display_name, org_name, official_email, email, business_category, account_type, verification_status, created_at')
    .in('account_type', ['business', 'official'])
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from('pending_reviews')
    .select('id, user_id, account_type, org_name, official_email, submitted_at, status, notes')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })
    .limit(50)

  const reviewerIds = Array.from(new Set((reviews ?? []).map(r => r.user_id).filter(Boolean)))
  const { data: reviewProfiles } = reviewerIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', reviewerIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const reviewProfileMap = new Map((reviewProfiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Business & Official Accounts" description="Manage elevated account types" />

      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Accounts</h2>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Verification</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {accountsError && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-600">
                  Failed to load accounts: {accountsError.message}
                </td>
              </tr>
            )}
            {!accountsError && accounts?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No business or official accounts yet.
                </td>
              </tr>
            )}
            {accounts?.map(a => (
              <tr key={a.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{a.org_name ?? a.display_name ?? a.full_name ?? 'Unnamed'}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={a.account_type} color={TYPE_COLOR[a.account_type] ?? 'gray'} />
                </td>
                <td className="px-4 py-3 text-gray-500">{a.official_email ?? a.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{a.business_category ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={a.verification_status ?? 'pending'}
                    color={VERIFICATION_COLOR[a.verification_status ?? 'pending'] ?? 'gray'}
                  />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(a.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Pending Reviews</h2>
      {reviewsError ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
          <p className="text-red-600 text-sm">Failed to load pending reviews: {reviewsError.message}</p>
        </div>
      ) : reviews?.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">No pending reviews.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Applicant</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Org Name</th>
                <th className="text-left px-4 py-3 font-medium">Submitted</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews?.map(r => {
                const profile = reviewProfileMap.get(r.user_id)
                return (
                  <tr key={r.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{profile?.full_name ?? r.org_name ?? 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">{profile?.email ?? r.official_email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={r.account_type} color={TYPE_COLOR[r.account_type] ?? 'gray'} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.org_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(r.submitted_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <form action={updateReviewStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Approve</button>
                        </form>
                        <form action={updateReviewStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button className="text-xs text-red-600 hover:text-red-700 font-medium">Reject</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
