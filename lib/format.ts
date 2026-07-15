export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatCurrency(cents: number | null | undefined, currency = 'usd') {
  if (cents == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

// Some profiles have '' rather than null for an unset name (e.g. incomplete
// signups) — `??` treats '' as present, so chained `a ?? b ?? fallback` silently
// renders blank instead of falling through. This skips blank/whitespace-only values too.
export function firstNonEmpty(...values: (string | null | undefined)[]) {
  for (const v of values) {
    if (v && v.trim()) return v
  }
  return null
}

export function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]!.toUpperCase())
    .join('')
}
