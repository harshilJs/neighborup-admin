'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, Pencil, Trash2, RotateCcw } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import UserEditModal, { type EditableUser } from '@/components/UserEditModal'
import DeleteUserModal from '@/components/DeleteUserModal'
import { restoreUser } from '@/lib/actions/users'
import { firstNonEmpty } from '@/lib/format'

export default function RowActionsMenu({ user }: { user: EditableUser }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  function restore() {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', user.id)
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
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4" />
            Edit
          </DropdownMenuItem>
          {user.deleted_at ? (
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

      {editing && <UserEditModal user={user} onClose={() => setEditing(false)} />}
      {deleting && (
        <DeleteUserModal
          userId={user.id}
          userLabel={firstNonEmpty(user.display_name, user.full_name, user.email) ?? 'this user'}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  )
}
