import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
  href?: string
}

const colors = {
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-100' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100' },
  red:    { bg: 'bg-red-50',     icon: 'text-red-600',     border: 'border-red-100' },
  purple: { bg: 'bg-purple-50',  icon: 'text-purple-600',  border: 'border-purple-100' },
}

export default function StatCard({ label, value, icon: Icon, trend, color = 'blue', href }: Props) {
  const c = colors[color]
  const card = (
    <div
      className={`bg-white border ${c.border} rounded-xl p-4 shadow-sm ${
        href ? 'hover:shadow-md hover:border-gray-300 transition-shadow cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
        </div>
        <div className={`${c.bg} p-2 rounded-lg shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    )
  }

  return card
}
