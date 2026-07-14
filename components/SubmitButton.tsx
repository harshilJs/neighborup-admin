'use client'

import { useFormStatus } from 'react-dom'

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

interface Props {
  label: string
  pendingLabel: string
  icon?: React.ReactNode
  className?: string
}

export default function SubmitButton({ label, pendingLabel, icon, className }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ''} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {pending ? <Spinner /> : icon}
      {pending ? pendingLabel : label}
    </button>
  )
}
