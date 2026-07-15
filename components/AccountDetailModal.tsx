'use client'

import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import SubmitButton from '@/components/SubmitButton'
import { updateReviewStatus } from '@/lib/actions/business'
import { formatDate, formatDateTime } from '@/lib/format'

const TYPE_COLOR: Record<string, 'blue' | 'purple'> = {
  business: 'blue',
  official: 'purple',
}

const VERIFICATION_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

export interface AccountProfile {
  id: string
  full_name: string | null
  display_name: string | null
  org_name: string | null
  official_email: string | null
  email: string | null
  business_category: string | null
  business_description: string | null
  business_phone: string | null
  business_website: string | null
  business_address: string | null
  account_type: string
  verification_status: string | null
  created_at: string | null
}

export interface LinkedReview {
  id: string
  user_id: string
  org_document_url: string | null
  status: string
  submitted_at: string | null
  notes: string | null
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
    <div className="text-gray-800 text-sm">{children}</div>
  </div>
)

export default function AccountDetailModal({
  account,
  review,
  applicantLabel,
  onClose,
}: {
  account: AccountProfile
  review: LinkedReview | null
  applicantLabel: string
  onClose: () => void
}) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900 font-semibold">{applicantLabel}</h2>
            <p className="text-gray-400 text-xs mt-0.5">Joined {formatDate(account.created_at)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge label={account.account_type} color={TYPE_COLOR[account.account_type] ?? 'gray'} />
            <StatusBadge
              label={account.verification_status ?? 'pending'}
              color={VERIFICATION_COLOR[account.verification_status ?? 'pending'] ?? 'gray'}
            />
          </div>

          <Row label="Email">{account.official_email ?? account.email ?? '—'}</Row>
          {account.business_phone && <Row label="Phone">{account.business_phone}</Row>}
          {account.business_website && (
            <Row label="Website">
              <a
                href={account.business_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                {account.business_website} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Row>
          )}
          <Row label="Category">{account.business_category ?? '—'}</Row>
          {account.business_description && <Row label="Description">{account.business_description}</Row>}
          {account.business_address && <Row label="Address">{account.business_address}</Row>}

          <div className="border-t border-gray-200 pt-4">
            <Row label="Submitted Document">
              {review?.org_document_url ? (
                <div className="space-y-2">
                  {!imageFailed && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.org_document_url}
                      alt="Submitted document"
                      onError={() => setImageFailed(true)}
                      className="max-h-64 w-auto rounded-md border border-gray-200"
                    />
                  )}
                  <a
                    href={review.org_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    Open full document <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-gray-400 text-xs">
                    Submitted {formatDateTime(review.submitted_at)} · review status: {review.status}
                  </p>
                </div>
              ) : (
                <span className="text-gray-400">No review submission on file.</span>
              )}
            </Row>
          </div>
        </div>

        {review?.status === 'pending' && (
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
        )}
      </div>
    </div>
  )
}
