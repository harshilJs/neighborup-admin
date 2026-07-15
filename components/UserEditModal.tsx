'use client'

import { X } from 'lucide-react'
import { updateUser } from '@/lib/actions/users'
import SubmitButton from '@/components/SubmitButton'

export interface EditableUser {
  id: string
  full_name: string | null
  display_name: string | null
  email: string | null
  account_type: string
  verification_status: string | null
  subscription_status: string | null
}

const inputClass =
  'w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'block text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5'

export default function UserEditModal({
  user,
  onClose,
}: {
  user: EditableUser
  onClose: () => void
}) {
  async function handleUpdate(formData: FormData) {
    await updateUser(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-gray-900 font-semibold">
            Edit {user.display_name ?? user.full_name ?? 'User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleUpdate} className="p-6 space-y-4">
          <input type="hidden" name="id" value={user.id} />

          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" name="full_name" defaultValue={user.full_name ?? ''} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Display Name</label>
            <input type="text" name="display_name" defaultValue={user.display_name ?? ''} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" name="email" defaultValue={user.email ?? ''} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Account Type</label>
            <select name="account_type" defaultValue={user.account_type} className={inputClass}>
              <option value="regular">Neighbor</option>
              <option value="business">Business</option>
              <option value="official">Official</option>
              <option value="kid">Kid</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Verification Status</label>
            <select name="verification_status" defaultValue={user.verification_status ?? 'pending'} className={inputClass}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Subscription Status</label>
            <select name="subscription_status" defaultValue={user.subscription_status ?? 'none'} className={inputClass}>
              <option value="none">None</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2"
            >
              Cancel
            </button>
            <SubmitButton
              label="Save Changes"
              pendingLabel="Saving..."
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
