'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import UserEditModal, { type EditableUser } from '@/components/UserEditModal'
import DeleteUserModal from '@/components/DeleteUserModal'

export default function RowActionsMenu({ user }: { user: EditableUser }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleting(true)}>
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editing && <UserEditModal user={user} onClose={() => setEditing(false)} />}
      {deleting && (
        <DeleteUserModal
          userId={user.id}
          userLabel={user.display_name ?? user.full_name ?? user.email ?? 'this user'}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  )
}
