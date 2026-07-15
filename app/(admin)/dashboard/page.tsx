import { Users, CreditCard, Clock, Flag, CheckCircle } from 'lucide-react'
import StatCard from '@/components/StatCard'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

const REPORT_STATUS_COLOR: Record<string, 'amber' | 'blue' | 'green'> = {
  pending: 'amber',
  reviewed: 'blue',
  resolved: 'green',
}

export default async function DashboardPage() {
  const [
    totalUsers,
    activeSubscriptions,
    pendingVerifications,
    userReports,
    verifiedUsers,
    recentReports,
    recentSignups,
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'approved'),
    supabaseAdmin.from('reports').select('id, reason, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('profiles').select('id, full_name, display_name, email, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div>
      <PageHeader title="Dashboard" description="Platform overview and key metrics" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={totalUsers.count ?? '—'} icon={Users} color="blue" href="/users" />
        <StatCard
          label="Active Subscriptions"
          value={activeSubscriptions.count ?? '—'}
          icon={CreditCard}
          color="green"
          href="/users?subscription=active"
        />
        <StatCard
          label="Pending Verifications"
          value={pendingVerifications.count ?? '—'}
          icon={Clock}
          color="amber"
          href="/users?verification=pending"
        />
        <StatCard label="User Reports" value={userReports.count ?? '—'} icon={Flag} color="purple" href="/reports" />
        <StatCard
          label="Verified Users"
          value={verifiedUsers.count ?? '—'}
          icon={CheckCircle}
          color="green"
          href="/users?verification=approved"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Recent Reports</h2>
          {recentReports.data?.length ? (
            <div className="space-y-3">
              {recentReports.data.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">{r.reason}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(r.created_at)}</p>
                  </div>
                  <StatusBadge label={r.status} color={REPORT_STATUS_COLOR[r.status] ?? 'gray'} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No reports yet.</p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Recent Sign-ups</h2>
          {recentSignups.data?.length ? (
            <div className="space-y-3">
              {recentSignups.data.map(u => (
                <div key={u.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">{u.display_name ?? u.full_name ?? 'Unnamed'}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{formatDateTime(u.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No sign-ups yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
