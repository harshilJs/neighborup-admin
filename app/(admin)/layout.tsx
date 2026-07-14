import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { signOut } from '@/lib/actions/auth'
import SubmitButton from '@/components/SubmitButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user
    ? (await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle()).data
    : null

  if (!user || !profile?.is_admin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-900">
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-sm">This account doesn&apos;t have admin access.</p>
          <form action={signOut}>
            <SubmitButton
              label="Sign out"
              pendingLabel="Signing out..."
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            />
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
