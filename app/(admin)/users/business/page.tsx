import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import BusinessReviewDetailModal from '@/components/BusinessReviewDetailModal'
import BusinessAccountActionsMenu from '@/components/BusinessAccountActionsMenu'
import DeactivatedToggle from '@/components/DeactivatedToggle'
import PendingOverlay from '@/components/PendingOverlay'
import { NavPendingProvider } from '@/lib/nav-pending-context'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate, formatDateTime, firstNonEmpty } from '@/lib/format'

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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const showingDeactivated = status === 'deactivated'

  let accountsQuery = supabaseAdmin
    .from('profiles')
    .select(
      'id, full_name, display_name, org_name, official_email, email, business_category, business_description, business_phone, business_website, business_address, account_type, verification_status, subscription_status, deleted_at, created_at'
    )
    .in('account_type', ['business', 'official'])
    .order('created_at', { ascending: false })
    .limit(100)

  accountsQuery = showingDeactivated
    ? accountsQuery.not('deleted_at', 'is', null)
    : accountsQuery.is('deleted_at', null)

  const { data: accounts, error: accountsError } = await accountsQuery

  interface AccountReview {
    id: string
    user_id: string
    org_document_url: string | null
    status: string
    submitted_at: string | null
    notes: string | null
  }

  const accountIds = (accounts ?? []).map(a => a.id)
  const { data: accountReviews } = accountIds.length
    ? await supabaseAdmin
        .from('pending_reviews')
        .select('id, user_id, org_document_url, status, submitted_at, notes')
        .in('user_id', accountIds)
        .order('submitted_at', { ascending: false })
    : { data: [] as AccountReview[] }
  // Most recent review per user (accountReviews is already ordered newest-first).
  const latestReviewByUser = new Map<string, AccountReview>()
  for (const review of (accountReviews ?? []) as AccountReview[]) {
    if (!latestReviewByUser.has(review.user_id)) latestReviewByUser.set(review.user_id, review)
  }

  // Accounts still awaiting a decision only show in the Pending Reviews list below,
  // not here — this list is for accounts that have already been reviewed.
  const visibleAccounts = (accounts ?? []).filter(a => latestReviewByUser.get(a.id)?.status !== 'pending')

  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from('pending_reviews')
    .select('id, user_id, account_type, org_name, official_email, org_document_url, submitted_at, status, notes')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })
    .limit(50)

  const reviewerIds = Array.from(new Set((reviews ?? []).map(r => r.user_id).filter(Boolean)))
  const { data: reviewProfiles } = reviewerIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', reviewerIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const reviewProfileMap = new Map((reviewProfiles ?? []).map(p => [p.id, p]))

  return (
    <NavPendingProvider>
      <div>
      <PageHeader
        title="Business & Official Accounts"
        description="Manage elevated account types"
        actions={<DeactivatedToggle />}
      />

      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Accounts</h2>
      <PendingOverlay>
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
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accountsError && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-red-600">
                  Failed to load accounts: {accountsError.message}
                </td>
              </tr>
            )}
            {!accountsError && visibleAccounts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No reviewed business or official accounts yet.
                </td>
              </tr>
            )}
            {visibleAccounts.map(a => (
              <tr key={a.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{firstNonEmpty(a.org_name, a.display_name, a.full_name) ?? 'Unnamed'}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={a.account_type} color={TYPE_COLOR[a.account_type] ?? 'gray'} />
                </td>
                <td className="px-4 py-3 text-gray-500">{firstNonEmpty(a.official_email, a.email) ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{a.business_category ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={a.verification_status ?? 'pending'}
                    color={VERIFICATION_COLOR[a.verification_status ?? 'pending'] ?? 'gray'}
                  />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(a.created_at)}</td>
                <td className="px-4 py-3">
                  <BusinessAccountActionsMenu
                    account={a}
                    review={latestReviewByUser.get(a.id) ?? null}
                    applicantLabel={firstNonEmpty(a.org_name, a.display_name, a.full_name) ?? 'Unnamed'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </PendingOverlay>

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
                      <p className="text-gray-800">{firstNonEmpty(profile?.full_name, r.org_name) ?? 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">{firstNonEmpty(profile?.email, r.official_email) ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={r.account_type} color={TYPE_COLOR[r.account_type] ?? 'gray'} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.org_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(r.submitted_at)}</td>
                    <td className="px-4 py-3">
                      <BusinessReviewDetailModal
                        review={r}
                        applicantLabel={firstNonEmpty(profile?.full_name, r.org_name) ?? 'Unknown'}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </NavPendingProvider>
  )
}
