'use client'

import StatusBadge from '@/components/StatusBadge'
import RowActionsMenu from '@/components/RowActionsMenu'
import type { EditableUser } from '@/components/UserEditModal'
import { formatDate, initials, firstNonEmpty } from '@/lib/format'

const TYPE_LABELS: Record<string, string> = {
  regular: 'Neighbor',
  business: 'Business',
  official: 'Official',
  kid: 'Kid',
}

const VERIFICATION_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

const SUBSCRIPTION_COLOR: Record<string, 'green' | 'gray' | 'red'> = {
  active: 'green',
  none: 'gray',
  expired: 'red',
}

interface User extends EditableUser {
  created_at: string | null
}

export default function UsersTable({ users, error }: { users: User[] | null; error: string | null }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3 font-medium">User</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-left px-4 py-3 font-medium">Verification</th>
            <th className="text-left px-4 py-3 font-medium">Subscription</th>
            <th className="text-left px-4 py-3 font-medium">Joined</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-red-600">
                Failed to load users: {error}
              </td>
            </tr>
          )}
          {!error && users?.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                No users match these filters.
              </td>
            </tr>
          )}
          {users?.map(user => (
            <tr key={user.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-700 font-medium shrink-0">
                    {initials(firstNonEmpty(user.display_name, user.full_name))}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium leading-tight">{firstNonEmpty(user.display_name, user.full_name) ?? 'Unnamed'}</p>
                    <p className="text-gray-400 text-xs">{firstNonEmpty(user.email) ?? '—'}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">{TYPE_LABELS[user.account_type] ?? user.account_type}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={user.verification_status ?? 'pending'}
                  color={VERIFICATION_COLOR[user.verification_status ?? 'pending'] ?? 'gray'}
                />
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  label={user.subscription_status ?? 'none'}
                  color={SUBSCRIPTION_COLOR[user.subscription_status ?? 'none'] ?? 'gray'}
                />
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
              <td className="px-4 py-3 text-right">
                <RowActionsMenu user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
