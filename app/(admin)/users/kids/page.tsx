import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import RowActionsMenu from '@/components/RowActionsMenu'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

const VERIFICATION_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

export default async function KidAccountsPage() {
  const { data: kids, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, display_name, email, age, date_of_birth, is_minor, parent_user_id, account_type, verification_status, subscription_status, created_at')
    .eq('account_type', 'kid')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  const parentIds = Array.from(new Set((kids ?? []).map(k => k.parent_user_id).filter(Boolean)))
  const { data: parents } = parentIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, display_name').in('id', parentIds)
    : { data: [] as { id: string; full_name: string | null; display_name: string | null }[] }
  const parentMap = new Map((parents ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Kid Accounts" description="Minor accounts with parent linkage" />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Kid</th>
              <th className="text-left px-4 py-3 font-medium">Age</th>
              <th className="text-left px-4 py-3 font-medium">Parent</th>
              <th className="text-left px-4 py-3 font-medium">Verification</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-600">
                  Failed to load kid accounts: {error.message}
                </td>
              </tr>
            )}
            {!error && kids?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No kid accounts yet.
                </td>
              </tr>
            )}
            {kids?.map(kid => {
              const parent = kid.parent_user_id ? parentMap.get(kid.parent_user_id) : undefined
              return (
                <tr key={kid.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{kid.display_name ?? kid.full_name ?? 'Unnamed'}</td>
                  <td className="px-4 py-3 text-gray-700">{kid.age ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{parent?.display_name ?? parent?.full_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={kid.verification_status ?? 'pending'}
                      color={VERIFICATION_COLOR[kid.verification_status ?? 'pending'] ?? 'gray'}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(kid.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <RowActionsMenu user={kid} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
