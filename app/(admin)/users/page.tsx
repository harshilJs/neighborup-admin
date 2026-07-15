import { Suspense } from 'react'
import PageHeader from '@/components/PageHeader'
import UsersFilters from '@/components/UsersFilters'
import UsersTable from '@/components/UsersTable'
import DeactivatedToggle from '@/components/DeactivatedToggle'
import PendingOverlay from '@/components/PendingOverlay'
import { NavPendingProvider } from '@/lib/nav-pending-context'
import { supabaseAdmin } from '@/lib/supabase'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; verification?: string; subscription?: string; status?: string }>
}) {
  const { q, type, verification, subscription, status } = await searchParams
  const showingDeactivated = status === 'deactivated'

  let query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, display_name, email, account_type, verification_status, subscription_status, deleted_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  query = showingDeactivated ? query.not('deleted_at', 'is', null) : query.is('deleted_at', null)

  if (q) {
    const safeQ = q.replace(/[,()%]/g, '')
    query = query.or(`full_name.ilike.%${safeQ}%,email.ilike.%${safeQ}%`)
  }
  if (type) query = query.eq('account_type', type)
  if (verification) query = query.eq('verification_status', verification)
  if (subscription) query = query.eq('subscription_status', subscription)

  const { data: users, error } = await query

  return (
    <NavPendingProvider>
      <div>
        <PageHeader
          title="All Users"
          description="Search, view, and manage every profile on the platform"
          actions={<DeactivatedToggle />}
        />

        <Suspense fallback={<div className="h-10 mb-5" />}>
          <UsersFilters />
        </Suspense>

        <PendingOverlay>
          <UsersTable users={users} error={error?.message ?? null} />
        </PendingOverlay>
      </div>
    </NavPendingProvider>
  )
}
