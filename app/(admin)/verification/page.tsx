import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import VerificationDetailButton from '@/components/VerificationDetailButton'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

const VERIFICATION_FIELDS =
  'id, user_id, verification_method, status, full_name, city, state, address_line1, zip_code, photo_url, id_document_url, mailed_code, code_verified, location_verification_start, location_verification_complete, admin_notes, created_at, approved_at, document_expires_at, veriff_session_url, veriff_decision, veriff_decision_at'

export default async function Page() {
  // Mailed-code verifications auto-approve once the recipient has confirmed the code —
  // there's no way to run a DB trigger from here, so this check runs whenever the page loads.
  await supabaseAdmin
    .from('verification_requests')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('verification_method', 'mailed_code')
    .eq('code_verified', true)
    .eq('status', 'pending')

  const { data: requests, error } = await supabaseAdmin
    .from('verification_requests')
    .select(VERIFICATION_FIELDS)
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = Array.from(new Set((requests ?? []).map(r => r.user_id).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const locationRequestIds = (requests ?? [])
    .filter(r => r.verification_method === 'location_tracking')
    .map(r => r.id)
  const { data: sessions } = locationRequestIds.length
    ? await supabaseAdmin
        .from('location_tracking_sessions')
        .select('verification_request_id, started_at, ends_at, status, total_checkins, nighttime_checkins, completed_at, consent_granted_at')
        .in('verification_request_id', locationRequestIds)
    : { data: [] as { verification_request_id: string; started_at: string | null; ends_at: string | null; status: string | null; total_checkins: number | null; nighttime_checkins: number | null; completed_at: string | null; consent_granted_at: string | null }[] }
  const sessionMap = new Map((sessions ?? []).map(s => [s.verification_request_id, s]))

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
                    <VerificationDetailButton
                      request={r}
                      session={sessionMap.get(r.id) ?? null}
                      applicantLabel={applicant}
                    />
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
