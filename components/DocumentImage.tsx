'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function DocumentImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <div className="relative inline-block">
      {!loaded && (
        <div className="flex items-center justify-center w-40 h-40 bg-gray-50 border border-gray-200 rounded-md">
          <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`max-h-64 w-auto rounded-md border border-gray-200 ${loaded ? '' : 'hidden'}`}
      />
    </div>
  )
}
