import PageHeader from '@/components/PageHeader'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import SubmitButton from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

async function updateSetting(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const value = formData.get('value') as string

  let parsed
  try {
    parsed = JSON.parse(value)
  } catch {
    parsed = value
  }

  await supabaseAdmin
    .from('app_settings')
    .update({ value: parsed, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/settings')
}

export default async function Page() {
  const { data: settings, error: settingsError } = await supabaseAdmin
    .from('app_settings')
    .select('id, key, value, updated_at')
    .order('key', { ascending: true })

  const { data: admins, error: adminsError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, account_type')
    .eq('is_admin', true)
    .order('full_name', { ascending: true })

  return (
    <div>
      <PageHeader title="Settings" description="App config, feature flags, and admin roles" />

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">App Settings</h2>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Key</th>
                <th className="text-left px-4 py-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {settingsError && (
                <tr>
                  <td colSpan={2} className="px-4 py-10 text-center text-red-600">
                    Failed to load settings: {settingsError.message}
                  </td>
                </tr>
              )}
              {!settingsError && settings?.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-10 text-center text-gray-400">
                    No settings configured.
                  </td>
                </tr>
              )}
              {settings?.map(row => (
                <tr key={row.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm text-gray-700">{row.key}</td>
                  <td className="px-4 py-3">
                    <form action={updateSetting} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={row.id} />
                      <input
                        type="text"
                        name="value"
                        defaultValue={JSON.stringify(row.value)}
                        className="bg-white border-gray-300 text-gray-900 text-sm rounded-md px-3 py-1.5 flex-1"
                      />
                      <SubmitButton
                        label="Save"
                        pendingLabel="Saving..."
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0"
                      />
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                  <td className="px-4 py-3 text-gray-700">{admin.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{admin.email ?? '—'}</td>
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
