'use client'

import { deletePost } from '@/lib/actions/posts'
import SubmitButton from '@/components/SubmitButton'

export default function DeletePostModal({
  postId,
  onClose,
}: {
  postId: string
  onClose: () => void
}) {
  async function handleDelete(formData: FormData) {
    await deletePost(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-gray-900 font-semibold mb-2">Delete Post</h2>
        <p className="text-gray-500 text-sm mb-6">
          This will <span className="font-medium text-red-600">permanently delete</span> this post along with its
          comments, likes, and views. This cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2"
          >
            Cancel
          </button>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={postId} />
            <SubmitButton
              label="Delete Permanently"
              pendingLabel="Deleting..."
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            />
          </form>
        </div>
      </div>
    </div>
  )
}
