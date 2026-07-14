import { Users, User, Building2, ShieldCheck, Baby, FileText, Users2, ShoppingBag, Flag } from 'lucide-react'
import StatCard from '@/components/StatCard'
import PageHeader from '@/components/PageHeader'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [
    totalUsers,
    neighbors,
    businessAccounts,
    officialAccounts,
    kidAccounts,
    totalPosts,
    totalGroups,
    activeListings,
    openReports,
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'regular'),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'business'),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'official'),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'kid'),
    supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('groups').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('marketplace_listings').select('id', { count: 'exact', head: true }).eq('is_sold', false),
    supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <div>
      <PageHeader title="Analytics" description="Growth, engagement, and retention metrics" />

      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Platform Growth</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={totalUsers.count ?? '—'} icon={Users} color="blue" />
        <StatCard label="Neighbors" value={neighbors.count ?? '—'} icon={User} color="blue" />
        <StatCard label="Business Accounts" value={businessAccounts.count ?? '—'} icon={Building2} color="purple" />
        <StatCard label="Official Accounts" value={officialAccounts.count ?? '—'} icon={ShieldCheck} color="purple" />
        <StatCard label="Kid Accounts" value={kidAccounts.count ?? '—'} icon={Baby} color="amber" />
      </div>

      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Content</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Posts" value={totalPosts.count ?? '—'} icon={FileText} color="blue" />
        <StatCard label="Total Groups" value={totalGroups.count ?? '—'} icon={Users2} color="blue" />
        <StatCard label="Active Listings" value={activeListings.count ?? '—'} icon={ShoppingBag} color="green" />
        <StatCard label="Open Reports" value={openReports.count ?? '—'} icon={Flag} color="red" />
      </div>
    </div>
  )
}
