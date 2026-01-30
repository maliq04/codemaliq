'use client'

import { useBranding } from '@/components/providers/BrandingProvider'
import { useEffect } from 'react'

export default function DynamicFavicon() {
  const { branding, isLoading } = useBranding()

  const updateFavicon = () => {
    if (typeof window === 'undefined' || isLoading || !branding.faviconUrl) return

    try {
      // Simple, safe favicon update without removing existing elements
      const isBase64 = branding.faviconUrl.startsWith('data:')
      let faviconUrl = branding.faviconUrl

      // For regular URLs, add cache busting. For base64, use as-is
      if (!isBase64) {
        const timestamp = Date.now()
        faviconUrl = branding.faviconUrl.includes('?')
          ? `${branding.faviconUrl}&t=${timestamp}`
          : `${branding.faviconUrl}?t=${timestamp}`
      }

      // Only update existing favicon, don't remove/add elements
      const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (existingFavicon) {
        existingFavicon.href = faviconUrl
        if (isBase64) {
          existingFavicon.type = 'image/png'
        }
      }

      // Update document title only
      if (branding.brandName) {
        const currentTitle = document.title
        const baseTitleParts = currentTitle.split(' | ')
        document.title =
          baseTitleParts.length > 1
            ? `${baseTitleParts[0]} | ${branding.brandName}`
            : `${currentTitle} | ${branding.brandName}`
      }
    } catch (error) {
      console.error('Error updating favicon:', error)
    }
  }

  useEffect(() => {
    // Only update on significant changes, with debouncing
    const timer = setTimeout(() => {
      updateFavicon()
    }, 300)

    return () => clearTimeout(timer)
  }, [branding.faviconUrl, branding.brandName, isLoading])

  // Listen for force update events with heavy debouncing
  useEffect(() => {
    let updateTimer: NodeJS.Timeout

    const handleBrandingUpdate = () => {
      clearTimeout(updateTimer)
      updateTimer = setTimeout(() => {
        updateFavicon()
      }, 500)
    }

    window.addEventListener('brandingForceUpdate', handleBrandingUpdate)

    return () => {
      clearTimeout(updateTimer)
      window.removeEventListener('brandingForceUpdate', handleBrandingUpdate)
    }
  }, [])

  return null // This component doesn't render anything
}
