'use client'

import { usePathname, useSearchParams } from 'next/navigation'

import { GoogleTagManager } from '@next/third-parties/google'
import { useEffect, useState } from 'react'

import { sendPageView } from '@/common/libs/gtm'

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || process.env.GTM_ID || ''
  const [gtmReady, setGtmReady] = useState(false)

  // Completely disable GTM in development
  // Check multiple ways to detect development mode
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (typeof window !== 'undefined' && window.location.hostname.includes('127.0.0.1'))

  const shouldLoadGTM = GTM_ID && !isDevelopment

  // Wait for GTM to initialize before sending events
  useEffect(() => {
    if (shouldLoadGTM) {
      const timer = setTimeout(() => {
        setGtmReady(true)
      }, 1000) // Wait 1 second for GTM to initialize

      return () => clearTimeout(timer)
    }
  }, [shouldLoadGTM])

  useEffect(() => {
    if (pathname && shouldLoadGTM && gtmReady) {
      // Add small delay to ensure GTM is fully loaded
      const timer = setTimeout(() => {
        sendPageView(pathname)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams, shouldLoadGTM, gtmReady])

  // Only render GTM if we should load it
  if (!shouldLoadGTM) {
    return null
  }

  return <GoogleTagManager gtmId={GTM_ID} />
}
