'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, Eye, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { updateFeedbackStatus } from '@/lib/actions/feedback'
import DeleteFeedbackModal from '@/components/DeleteFeedbackModal'

export default function FeedbackActionsMenu({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function setStatus(status: string) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', id)
      formData.set('status', status)
      await updateFeedbackStatus(formData)
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
          {status === 'new' && (
            <DropdownMenuItem onClick={() => setStatus('reviewed')}>
              <Eye className="w-4 h-4" />
              Mark Reviewed
            </DropdownMenuItem>
          )}
          {status !== 'resolved' && (
            <DropdownMenuItem onClick={() => setStatus('resolved')}>
              <CheckCircle2 className="w-4 h-4" />
              Resolve
            </DropdownMenuItem>
          )}
          {status === 'resolved' && (
            <DropdownMenuItem onClick={() => setStatus('new')}>
              <RotateCcw className="w-4 h-4" />
              Reopen
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {confirmingDelete && (
        <DeleteFeedbackModal feedbackId={id} onClose={() => setConfirmingDelete(false)} />
      )}
    </>
  )
}
