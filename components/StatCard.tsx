import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
}

const colors = {
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/20' },
  green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber:  { bg: 'bg-amber-500/10',  icon: 'text-amber-400',  border: 'border-amber-500/20' },
  red:    { bg: 'bg-red-500/10',    icon: 'text-red-400',    border: 'border-red-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
}

export default function StatCard({ label, value, icon: Icon, trend, color = 'blue' }: Props) {
  const c = colors[color]
  return (
    <div className={`bg-gray-900 border ${c.border} rounded-xl p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`${c.bg} p-2 rounded-lg shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  )
}
