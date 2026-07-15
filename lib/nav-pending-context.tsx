'use client'

import { createContext, useContext, useTransition, type ReactNode } from 'react'

interface NavPendingValue {
  isPending: boolean
  navigate: (fn: () => void) => void
}

const NavPendingContext = createContext<NavPendingValue | null>(null)

// Next's router.push() runs inside its own transition, which suppresses the
// route's loading.tsx fallback and swaps in new data silently. Wrapping the
// same push in our own useTransition gives an isPending flag we can render
// a visible loader from, instead of the page looking frozen mid-filter.
export function NavPendingProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition()

  function navigate(fn: () => void) {
    startTransition(fn)
  }

  return <NavPendingContext.Provider value={{ isPending, navigate }}>{children}</NavPendingContext.Provider>
}

export function useNavPending() {
  const ctx = useContext(NavPendingContext)
  if (!ctx) throw new Error('useNavPending must be used within a NavPendingProvider')
  return ctx
}
