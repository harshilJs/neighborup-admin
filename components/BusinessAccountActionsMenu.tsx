'use client'

import { useState, useTransition } from 'react'
import { Eye, Pencil, Trash2, MoreHorizontal, RotateCcw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import AccountDetailModal, { type AccountProfile, type LinkedReview } from '@/components/AccountDetailModal'
import UserEditModal, { type EditableUser } from '@/components/UserEditModal'
import DeleteUserModal from '@/components/DeleteUserModal'
import { restoreUser } from '@/lib/actions/users'

export default function BusinessAccountActionsMenu({
  account,
  review,
  applicantLabel,
}: {
  account: AccountProfile & EditableUser
  review: LinkedReview | null
  applicantLabel: string
}) {
  const [viewing, setViewing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  function restore() {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', account.id)
      await restoreUser(formData)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Actions"
          disabled={isPending}
        >
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setViewing(true)}>
            <Eye className="w-4 h-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4" />
            Edit
          </DropdownMenuItem>
          {account.deleted_at ? (
            <DropdownMenuItem onClick={restore}>
              <RotateCcw className="w-4 h-4" />
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {viewing && (
        <AccountDetailModal account={account} review={review} applicantLabel={applicantLabel} onClose={() => setViewing(false)} />
      )}
      {editing && <UserEditModal user={account} onClose={() => setEditing(false)} />}
      {deleting && <DeleteUserModal userId={account.id} userLabel={applicantLabel} onClose={() => setDeleting(false)} />}
    </>
  )
}
