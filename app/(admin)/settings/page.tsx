import PageHeader from '@/components/PageHeader'
import { supabaseAdmin } from '@/lib/supabase'
import { firstNonEmpty } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { data: admins, error: adminsError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, account_type')
    .eq('is_admin', true)
    .order('full_name', { ascending: true })

  return (
    <div>
      <PageHeader title="Settings" description="Admin roles" />

      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Admins</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Account Type</th>
              </tr>
            </thead>
            <tbody>
              {adminsError && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-red-600">
                    Failed to load admins: {adminsError.message}
                  </td>
                </tr>
              )}
              {!adminsError && admins?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-gray-400">
                    No admin users found.
                  </td>
                </tr>
              )}
              {admins?.map(admin => (
                <tr key={admin.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{firstNonEmpty(admin.full_name) ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{firstNonEmpty(admin.email) ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{admin.account_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
