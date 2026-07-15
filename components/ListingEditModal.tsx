'use client'

import { X } from 'lucide-react'
import { updateListing } from '@/lib/actions/marketplace'
import SubmitButton from '@/components/SubmitButton'

export interface EditableListing {
  id: string
  title: string | null
  description: string | null
  price: number | null
  category: string | null
  condition: string | null
  is_sold: boolean | null
}

const labelClass = 'block text-left text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5'
const inputClass =
  'w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'

export default function ListingEditModal({
  listing,
  onClose,
}: {
  listing: EditableListing
  onClose: () => void
}) {
  async function handleUpdate(formData: FormData) {
    await updateListing(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-gray-900 font-semibold">Edit Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={handleUpdate} className="p-6 space-y-4">
          <input type="hidden" name="id" value={listing.id} />

          <div>
            <label className={labelClass}>Title</label>
            <input type="text" name="title" defaultValue={listing.title ?? ''} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" rows={4} defaultValue={listing.description ?? ''} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                defaultValue={listing.price ?? ''}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input type="text" name="category" defaultValue={listing.category ?? ''} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Condition</label>
              <input type="text" name="condition" defaultValue={listing.condition ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="is_sold" defaultValue={listing.is_sold ? 'true' : 'false'} className={inputClass}>
                <option value="false">Active</option>
                <option value="true">Sold</option>
              </select>
            </div>
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
