'use client'

import { X } from 'lucide-react'
import { updatePost } from '@/lib/actions/posts'
import SubmitButton from '@/components/SubmitButton'

export interface EditablePost {
  id: string
  content: string | null
  is_business_post: boolean | null
}

export default function PostEditModal({ post, onClose }: { post: EditablePost; onClose: () => void }) {
  async function handleUpdate(formData: FormData) {
    await updatePost(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-gray-900 font-semibold">Edit Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleUpdate} className="p-6 space-y-4">
          <input type="hidden" name="id" value={post.id} />

          <div>
            <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">Content</label>
            <textarea
              name="content"
              rows={5}
              defaultValue={post.content ?? ''}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">Post Type</label>
            <select
              name="is_business_post"
              defaultValue={post.is_business_post ? 'true' : 'false'}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="false">Personal</option>
              <option value="true">Business</option>
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
