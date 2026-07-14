import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'
import { revalidatePath } from 'next/cache'
import SubmitButton from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

async function updateVerificationStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const update: { status: string; approved_at?: string } = { status }
  if (status === 'approved') update.approved_at = new Date().toISOString()
  await supabaseAdmin
    .from('verification_requests')
    .update(update)
    .eq('id', id)
  revalidatePath('/verification')
}

export default async function Page() {
  const { data: requests, error } = await supabaseAdmin
    .from('verification_requests')
    .select('id, user_id, verification_method, status, full_name, city, state, admin_notes, created_at, approved_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = Array.from(new Set((requests ?? []).map(r => r.user_id).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Verification Management" description="KYC sessions, mailed codes, manual overrides" />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Applicant</th>
              <th className="text-left px-4 py-3 font-medium">Method</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Submitted</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-600">
                  Failed to load verification requests: {error.message}
                </td>
              </tr>
            )}
            {!error && requests?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No verification requests yet.
                </td>
              </tr>
            )}
            {requests?.map(r => {
              const profile = profileMap.get(r.user_id)
              const applicant = r.full_name ?? profile?.full_name ?? profile?.email ?? '—'
              const location = r.city && r.state ? `${r.city}, ${r.state}` : r.city ?? r.state ?? '—'
              return (
                <tr key={r.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{applicant}</td>
                  <td className="px-4 py-3 text-gray-500">{r.verification_method ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{location}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={r.status} color={STATUS_COLOR[r.status] ?? 'gray'} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(r.created_at)}</td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' && (
                      <div className="flex items-center gap-3">
                        <form action={updateVerificationStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="approved" />
                          <SubmitButton
                            label="Approve"
                            pendingLabel="Approving..."
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          />
                        </form>
                        <form action={updateVerificationStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <SubmitButton
                            label="Reject"
                            pendingLabel="Rejecting..."
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                          />
                        </form>
                      </div>
                    )}
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
