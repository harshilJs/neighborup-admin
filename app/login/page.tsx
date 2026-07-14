import { login } from '@/lib/actions/auth'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">NeighborUp</p>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>

        <form action={login} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {ERROR_MESSAGES[error] ?? error}
            </p>
          )}
          <div>
            <label className="block text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="w-full bg-gray-950 border border-gray-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full bg-gray-950 border border-gray-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md px-3 py-2 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
