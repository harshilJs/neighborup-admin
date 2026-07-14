import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  const { data: groups, error } = await supabaseAdmin
    .from('groups')
    .select('id, name, description, category, member_count, is_private, location_name, created_by, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const creatorIds = Array.from(new Set((groups ?? []).map(g => g.created_by).filter(Boolean)))
  const { data: profiles } = creatorIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', creatorIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Groups" description="Community groups management" />

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Group</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Members</th>
              <th className="text-left px-4 py-3 font-medium">Visibility</th>
              <th className="text-left px-4 py-3 font-medium">Creator</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-red-400">
                  Failed to load groups: {error.message}
                </td>
              </tr>
            )}
            {!error && groups?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No groups yet.
                </td>
              </tr>
            )}
            {groups?.map(group => {
              const creator = group.created_by ? profileMap.get(group.created_by) : undefined
              return (
                <tr key={group.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{group.name}</p>
                    {group.description && (
                      <p className="text-gray-500 text-xs truncate max-w-xs">{group.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{group.category ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{group.member_count ?? 0}</td>
                  <td className="px-4 py-3">
                    {group.is_private ? (
                      <StatusBadge label="Private" color="purple" />
                    ) : (
                      <StatusBadge label="Public" color="gray" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{creator?.full_name ?? creator?.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(group.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
