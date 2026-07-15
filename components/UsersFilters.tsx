'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useNavPending } from '@/lib/nav-pending-context'

export default function UsersFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const { isPending, navigate } = useNavPending()

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    navigate(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') update('q', q)
          }}
          onBlur={() => update('q', q)}
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
      <select
        defaultValue={searchParams.get('type') ?? ''}
        onChange={e => update('type', e.target.value)}
        disabled={isPending}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 disabled:opacity-50"
      >
        <option value="">All Account Types</option>
        <option value="regular">Neighbor</option>
        <option value="business">Business</option>
        <option value="official">Official</option>
        <option value="kid">Kid</option>
      </select>
      <select
        defaultValue={searchParams.get('verification') ?? ''}
        onChange={e => update('verification', e.target.value)}
        disabled={isPending}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 disabled:opacity-50"
      >
        <option value="">All Verification</option>
        <option value="approved">Verified</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
      </select>
      <select
        defaultValue={searchParams.get('subscription') ?? ''}
        onChange={e => update('subscription', e.target.value)}
        disabled={isPending}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 disabled:opacity-50"
      >
        <option value="">All Subscriptions</option>
        <option value="active">Active</option>
        <option value="none">None</option>
        <option value="expired">Expired</option>
      </select>
    </div>
  )
}
