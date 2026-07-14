import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, 'amber' | 'blue' | 'green'> = {
  pending: 'amber',
  reviewed: 'blue',
  resolved: 'green',
}

async function updateReportStatus(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  await supabaseAdmin
    .from('reports')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/reports')
}

export default async function ReportsPage() {
  const { data: reports, error } = await supabaseAdmin
    .from('reports')
    .select('id, reason, details, status, reported_content_type, reporter_id, reported_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = Array.from(new Set((reports ?? []).flatMap(r => [r.reporter_id, r.reported_id]).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="User Reports" description="Harassment, spam, fake profiles, inappropriate content" />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Reporter</th>
              <th className="text-left px-4 py-3 font-medium">Reported</th>
              <th className="text-left px-4 py-3 font-medium">Reason</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Filed</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-600">
                  Failed to load reports: {error.message}
                </td>
              </tr>
            )}
            {!error && reports?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No reports filed yet.
                </td>
              </tr>
            )}
            {reports?.map(r => (
              <tr key={r.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{profileMap.get(r.reporter_id)?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{profileMap.get(r.reported_id)?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={r.details ?? undefined}>{r.reason}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={r.status} color={STATUS_COLOR[r.status] ?? 'gray'} />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(r.created_at)}</td>
                <td className="px-4 py-3">
                  {r.status !== 'resolved' && (
                    <div className="flex items-center gap-3">
                      <form action={updateReportStatus}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="reviewed" />
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark Reviewed</button>
                      </form>
                      <form action={updateReportStatus}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="resolved" />
                        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Resolve</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
