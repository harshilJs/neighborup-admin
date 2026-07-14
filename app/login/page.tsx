import Image from 'next/image'
import { login } from '@/lib/actions/auth'
import SubmitButton from '@/components/SubmitButton'

const ERROR_MESSAGES: Record<string, string> = {
  not_admin: 'This account does not have admin access.',
  'Invalid login credentials': 'Incorrect email or password.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image src="/logo-full.png" alt="NeighborUp" width={64} height={64} priority className="w-16 h-16 rounded-2xl" />
          <div className="text-center">
            <p className="text-gray-900 font-semibold text-sm leading-tight">NeighborUp</p>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>

        <form action={login} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {ERROR_MESSAGES[error] ?? error}
            </p>
          )}
          <div>
            <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <SubmitButton
            label="Sign In"
            pendingLabel="Signing in..."
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md px-3 py-2 transition-colors"
          />
        </form>
      </div>
    </div>
  )
}
