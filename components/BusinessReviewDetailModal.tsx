'use client'

import { useState } from 'react'
import { Eye, X, ExternalLink } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import SubmitButton from '@/components/SubmitButton'
import DocumentImage from '@/components/DocumentImage'
import { updateReviewStatus } from '@/lib/actions/business'
import { formatDateTime } from '@/lib/format'

const TYPE_COLOR: Record<string, 'blue' | 'purple'> = {
  business: 'blue',
  official: 'purple',
}

export interface PendingReview {
  id: string
  user_id: string
  account_type: string
  org_name: string | null
  official_email: string | null
  org_document_url: string | null
  submitted_at: string | null
  notes: string | null
}

export interface ApplicantProfile {
  business_category: string | null
  business_description: string | null
  business_phone: string | null
  business_website: string | null
  business_address: string | null
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-left text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
    <div className="text-gray-800 text-sm">{children}</div>
  </div>
)

export default function BusinessReviewDetailModal({
  review,
  profile,
  applicantLabel,
}: {
  review: PendingReview
  profile: ApplicantProfile | null
  applicantLabel: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-gray-900 font-semibold">{applicantLabel}</h2>
                <p className="text-gray-400 text-xs mt-0.5">Submitted {formatDateTime(review.submitted_at)}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Row label="Account Type">
                <StatusBadge label={review.account_type} color={TYPE_COLOR[review.account_type] ?? 'gray'} />
              </Row>

              <Row label="Organization Name">{review.org_name ?? '—'}</Row>

              {review.official_email && <Row label="Official Email">{review.official_email}</Row>}
              {profile?.business_phone && <Row label="Phone">{profile.business_phone}</Row>}
              {profile?.business_website && (
                <Row label="Website">
                  <a
                    href={profile.business_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    {profile.business_website} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Row>
              )}
              {profile?.business_category && <Row label="Category">{profile.business_category}</Row>}
              {profile?.business_address && <Row label="Address">{profile.business_address}</Row>}
              {profile?.business_description && <Row label="Description">{profile.business_description}</Row>}

              <Row label="Submitted Document">
                {review.org_document_url ? (
                  <div className="space-y-2">
                    <DocumentImage src={review.org_document_url} alt="Submitted document" />
                    <a
                      href={review.org_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      Open full document <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-gray-400">No document submitted.</span>
                )}
              </Row>

              {review.notes && <Row label="Notes">{review.notes}</Row>}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <form action={updateReviewStatus}>
                <input type="hidden" name="id" value={review.id} />
                <input type="hidden" name="user_id" value={review.user_id} />
                <input type="hidden" name="status" value="rejected" />
                <SubmitButton
                  label="Reject"
                  pendingLabel="Rejecting..."
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2"
                />
              </form>
              <form action={updateReviewStatus}>
                <input type="hidden" name="id" value={review.id} />
                <input type="hidden" name="user_id" value={review.user_id} />
                <input type="hidden" name="status" value="approved" />
                <SubmitButton
                  label="Approve"
                  pendingLabel="Approving..."
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
