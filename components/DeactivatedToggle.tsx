'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Archive, Users, Loader2 } from 'lucide-react'
import { useNavPending } from '@/lib/nav-pending-context'

export default function DeactivatedToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isPending, navigate } = useNavPending()
  const showingDeactivated = searchParams.get('status') === 'deactivated'

  const params = new URLSearchParams(searchParams.toString())
  if (showingDeactivated) params.delete('status')
  else params.set('status', 'deactivated')
  const query = params.toString()
  const href = query ? `${pathname}?${query}` : pathname

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => navigate(() => router.push(href))}
      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium border border-gray-300 rounded-md px-3 py-1.5 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : showingDeactivated ? (
        <Users className="w-3.5 h-3.5" />
      ) : (
        <Archive className="w-3.5 h-3.5" />
      )}
      {showingDeactivated ? 'Show Active' : 'Show Deactivated'}
    </button>
  )
}
