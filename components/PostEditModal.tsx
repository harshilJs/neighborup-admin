'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { updatePost } from '@/lib/actions/posts'
import SubmitButton from '@/components/SubmitButton'

export interface EditablePost {
  id: string
  content: string | null
  is_business_post: boolean | null
  image_url: string | null
  image_urls: string[] | null
}

export default function PostEditModal({ post, onClose }: { post: EditablePost; onClose: () => void }) {
  const initialImages = post.image_urls?.length ? post.image_urls : post.image_url ? [post.image_url] : []
  const [images, setImages] = useState(initialImages)

  async function handleUpdate(formData: FormData) {
    formData.set('image_urls', JSON.stringify(images))
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

          {images.length > 0 && (
            <div>
              <label className="block text-left text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">
                Images
              </label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <div key={url} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="w-full h-20 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-left text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">Content</label>
            <textarea
              name="content"
              rows={5}
              defaultValue={post.content ?? ''}
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-left text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">Post Type</label>
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
