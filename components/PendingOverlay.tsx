'use client'

import { useNavPending } from '@/lib/nav-pending-context'
import PageLoader from '@/components/PageLoader'

export default function PendingOverlay({ children }: { children: React.ReactNode }) {
  const { isPending } = useNavPending()

  return (
    <div className="relative">
      {children}
      {isPending && (
        <>
          {/* Wash covers the full (possibly long) table so stale rows read as inactive. */}
          <div className="absolute inset-0 bg-white/70 rounded-xl z-10" />
          {/* Spinner is viewport-fixed (not centered in the table's full height) so it
              stays visible even when most loaded rows are scrolled out of view. pl-60
              offsets it past the fixed sidebar width so it centers over the content area. */}
          <div className="fixed inset-0 pl-60 flex items-center justify-center pointer-events-none z-20">
            <PageLoader />
          </div>
        </>
      )}
    </div>
  )
}
