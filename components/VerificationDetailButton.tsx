'use client'

import { useState, useTransition } from 'react'
import { Eye, X, ExternalLink, MoreHorizontal, Check, Ban, RotateCcw } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import SubmitButton from '@/components/SubmitButton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { updateVerificationStatus } from '@/lib/actions/verification'
import { formatDateTime } from '@/lib/format'

const STATUS_COLOR: Record<string, 'green' | 'amber' | 'red'> = {
  approved: 'green',
  pending: 'amber',
  rejected: 'red',
}

export interface VerificationRequestDetail {
  id: string
  verification_method: string | null
  status: string
  full_name: string | null
  address_line1: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  photo_url: string | null
  id_document_url: string | null
  mailed_code: string | null
  code_verified: boolean | null
  location_verification_start: string | null
  location_verification_complete: boolean | null
  admin_notes: string | null
  created_at: string | null
  approved_at: string | null
  document_expires_at: string | null
  veriff_session_url: string | null
  veriff_decision: string | null
  veriff_decision_at: string | null
}

export interface LocationSessionDetail {
  started_at: string | null
  ends_at: string | null
  status: string | null
  total_checkins: number | null
  nighttime_checkins: number | null
  completed_at: string | null
  consent_granted_at: string | null
}

function daysElapsed(startedAt: string | null) {
  if (!startedAt) return null
  const days = Math.floor((Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.min(14, days))
}

interface NoteSection {
  label: string
  rows: { label: string; value: string }[]
}

function humanizeKey(key: string) {
  const spaced = key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function objectToRows(obj: Record<string, unknown>): { label: string; value: string }[] {
  return Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }))
}

// Admin notes come from the ID-verification provider's webhook payload, formatted as
// "decision:{...} | person:{...} | attempts:{...}" — parse that into readable sections
// instead of dumping the raw text.
function parseAdminNotes(notes: string | null): NoteSection[] | string | null {
  if (!notes) return null

  try {
    return [{ label: 'Details', rows: objectToRows(JSON.parse(notes)) }]
  } catch {
    // not a single JSON object — try the pipe-separated "key:{json}" format below
  }

  const segments = notes
    .split('|')
    .map(s => s.trim())
    .filter(Boolean)

  const sections: NoteSection[] = []
  for (const segment of segments) {
    const colonIndex = segment.indexOf(':')
    if (colonIndex === -1) continue
    const key = segment.slice(0, colonIndex).trim()
    const jsonPart = segment.slice(colonIndex + 1).trim()

    try {
      const parsed = JSON.parse(jsonPart)
      if (key === 'person' && parsed.person) {
        const p = parsed.person
        sections.push({
          label: 'Identity',
          rows: [
            { label: 'Status', value: parsed.status ?? '—' },
            ...objectToRows({
              name: [p.firstName, p.lastName].filter(Boolean).join(' ') || undefined,
              date_of_birth: p.dateOfBirth,
              nationality: p.nationality,
              gender: p.gender,
            }),
          ],
        })
      } else if (key === 'attempts' && Array.isArray(parsed.verifications)) {
        const latest = parsed.verifications[0]
        sections.push({
          label: 'Verification Attempts',
          rows: [
            { label: 'Status', value: parsed.status ?? '—' },
            { label: 'Attempt count', value: String(parsed.verifications.length) },
            ...(latest
              ? [
                  { label: 'Latest attempt status', value: latest.status ?? '—' },
                  { label: 'Latest attempt at', value: latest.createdTime ? formatDateTime(latest.createdTime) : '—' },
                ]
              : []),
          ],
        })
      } else {
        sections.push({ label: humanizeKey(key), rows: objectToRows(parsed) })
      }
    } catch {
      sections.push({ label: humanizeKey(key), rows: [{ label: 'Value', value: jsonPart }] })
    }
  }

  return sections.length ? sections : notes
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-left text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
    <div className="text-gray-800 text-sm">{children}</div>
  </div>
)

export default function VerificationDetailButton({
  request,
  session,
  applicantLabel,
}: {
  request: VerificationRequestDetail
  session: LocationSessionDetail | null
  applicantLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function decide(status: 'approved' | 'rejected' | 'pending') {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', request.id)
      formData.set('status', status)
      await updateVerificationStatus(formData)
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
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Eye className="w-4 h-4" />
            View
          </DropdownMenuItem>
          {request.status === 'pending' && (
            <>
              <DropdownMenuItem onClick={() => decide('approved')}>
                <Check className="w-4 h-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => decide('rejected')}>
                <Ban className="w-4 h-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}
          {request.status !== 'pending' && (
            <DropdownMenuItem onClick={() => decide('pending')}>
              <RotateCcw className="w-4 h-4" />
              Reopen
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-gray-900 font-semibold">{applicantLabel}</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {request.verification_method ?? 'Unknown method'} · Submitted {formatDateTime(request.created_at)}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Row label="Status">
                <StatusBadge label={request.status} color={STATUS_COLOR[request.status] ?? 'gray'} />
              </Row>

              {request.verification_method === 'mailed_code' && (
                <>
                  <Row label="Mailing Address">
                    {[request.address_line1, request.city, request.state, request.zip_code].filter(Boolean).join(', ') || '—'}
                  </Row>
                  <Row label="Mailed Code">
                    <span className="font-mono">{request.mailed_code ?? '—'}</span>
                  </Row>
                  <Row label="Code Received">
                    <StatusBadge label={request.code_verified ? 'Yes' : 'Not yet'} color={request.code_verified ? 'green' : 'amber'} />
                  </Row>
                  {request.code_verified && request.status === 'approved' && (
                    <p className="text-emerald-600 text-xs">
                      Auto-approved once the code was confirmed received.
                    </p>
                  )}
                </>
              )}

              {request.verification_method === 'location_tracking' && (
                <>
                  <Row label="14-Day Process Progress">
                    {session ? (
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Day {daysElapsed(session.started_at) ?? 0} of 14</span>
                          <span>{session.status ?? 'unknown'}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${((daysElapsed(session.started_at) ?? 0) / 14) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No tracking session found.</span>
                    )}
                  </Row>
                  <Row label="Started">{formatDateTime(session?.started_at ?? request.location_verification_start)}</Row>
                  <Row label="Ends">{formatDateTime(session?.ends_at ?? null)}</Row>
                  <Row label="Check-ins">
                    {session ? `${session.total_checkins ?? 0} total (${session.nighttime_checkins ?? 0} at night)` : '—'}
                  </Row>
                  <Row label="Complete">
                    <StatusBadge
                      label={request.location_verification_complete ? 'Yes' : 'In progress'}
                      color={request.location_verification_complete ? 'green' : 'amber'}
                    />
                  </Row>
                </>
              )}

              {request.verification_method === 'id_upload' && (
                <>
                  <Row label="Veriff Decision">
                    {request.veriff_decision ? (
                      <StatusBadge
                        label={request.veriff_decision}
                        color={request.veriff_decision === 'approved' ? 'green' : request.veriff_decision === 'expired' ? 'gray' : 'red'}
                      />
                    ) : (
                      '—'
                    )}
                  </Row>
                  <Row label="Decision At">{formatDateTime(request.veriff_decision_at)}</Row>
                  {request.document_expires_at && <Row label="Document Expires">{formatDateTime(request.document_expires_at)}</Row>}
                  {request.veriff_session_url && (
                    <Row label="Veriff Session">
                      <a
                        href={request.veriff_session_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        Open session <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Row>
                  )}
                  {request.photo_url && (
                    <Row label="Photo">
                      <a href={request.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        View photo
                      </a>
                    </Row>
                  )}
                  {request.id_document_url && (
                    <Row label="ID Document">
                      <a href={request.id_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        View document
                      </a>
                    </Row>
                  )}
                </>
              )}

              {(() => {
                const parsedNotes = parseAdminNotes(request.admin_notes)
                if (!parsedNotes) return null

                if (typeof parsedNotes === 'string') {
                  return (
                    <Row label="Notes">
                      <p className="text-gray-700">{parsedNotes}</p>
                    </Row>
                  )
                }

                return (
                  <div className="space-y-3">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Notes</p>
                    {parsedNotes.map(section => (
                      <div key={section.label} className="bg-gray-50 border border-gray-200 rounded-md p-3">
                        <p className="text-gray-700 text-xs font-semibold mb-1.5">{section.label}</p>
                        <div className="space-y-1">
                          {section.rows.map(r => (
                            <div key={r.label} className="flex items-start justify-between gap-3 text-xs">
                              <span className="text-gray-500 shrink-0">{r.label}</span>
                              <span className="text-gray-800 text-right wrap-break-word">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {request.status === 'pending' && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <form action={updateVerificationStatus}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <SubmitButton
                    label="Reject"
                    pendingLabel="Rejecting..."
                    className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2"
                  />
                </form>
                <form action={updateVerificationStatus}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="approved" />
                  <SubmitButton
                    label="Approve"
                    pendingLabel="Approving..."
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
                  />
                </form>
              </div>
            )}
            {request.status !== 'pending' && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <form action={updateVerificationStatus}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value="pending" />
                  <SubmitButton
                    label="Reopen"
                    pendingLabel="Reopening..."
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium px-3 py-2"
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
