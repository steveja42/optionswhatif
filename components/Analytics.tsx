'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    goatcounter?: { count: (vars?: object) => void }
  }
}

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip first render — count.js fires automatically on initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (typeof window.goatcounter?.count === 'function') {
      window.goatcounter.count({ path: pathname + (searchParams.toString() ? '?' + searchParams.toString() : '') })
    }
  }, [pathname, searchParams])

  return null
}
