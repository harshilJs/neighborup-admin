const colors = {
  gray: 'bg-gray-500/10 text-gray-400',
  blue: 'bg-blue-500/10 text-blue-400',
  green: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  red: 'bg-red-500/10 text-red-400',
  purple: 'bg-purple-500/10 text-purple-400',
}

interface Props {
  label: string
  color?: keyof typeof colors
}

export default function StatusBadge({ label, color = 'gray' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${colors[color]}`}>
      {label}
    </span>
  )
}
