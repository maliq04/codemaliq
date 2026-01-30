'use client'

import Image from 'next/image'

import { useBranding } from '@/components/providers/BrandingProvider'
import { useEffect, useState } from 'react'

interface DynamicLogoProps {
  width?: number
  height?: number
  className?: string
  alt?: string
}

/**
 * Validate if a data URL contains valid base64 image data
 */
function isValidBase64Image(dataUrl: string): boolean {
  if (!dataUrl.startsWith('data:image/')) {
    return false
  }

  try {
    const base64Part = dataUrl.split(',')[1]
    if (!base64Part || base64Part === 'test-data' || base64Part.length < 20) {
      return false
    }

    // Try to decode the base64 to validate it
    const decoded = atob(base64Part)
    return decoded.length > 100 // Ensure it's a real image with some content
  } catch (error) {
    return false
  }
}

export default function DynamicLogo({ width = 40, height = 40, className = '', alt }: DynamicLogoProps) {
  const { branding, isLoading } = useBranding()
  const [imageError, setImageError] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  // Reset image error when branding changes
  useEffect(() => {
    setImageError(false)
    setRenderKey(prev => prev + 1)
  }, [branding.logoUrl, branding.lastUpdated])

  // Listen for branding force update events
  useEffect(() => {
    const handleBrandingUpdate = () => {
      setImageError(false)
      setRenderKey(prev => prev + 1)
    }

    window.addEventListener('brandingUpdated', handleBrandingUpdate)
    window.addEventListener('brandingForceUpdate', handleBrandingUpdate)
    window.addEventListener('brandingRefresh', handleBrandingUpdate)

    return () => {
      window.removeEventListener('brandingUpdated', handleBrandingUpdate)
      window.removeEventListener('brandingForceUpdate', handleBrandingUpdate)
      window.removeEventListener('brandingRefresh', handleBrandingUpdate)
    }
  }, [])

  // Show loading placeholder while fetching branding
  if (isLoading) {
    return (
      <div
        className={`animate-pulse rounded bg-neutral-200 dark:bg-neutral-700 ${className}`}
        style={{ width, height }}
      />
    )
  }

  // Validate logo URL and fallback to default if invalid
  let logoSrc = branding.logoUrl || '/img/codemaliq.jpg'

  // Check if it's an invalid base64 URL
  if (logoSrc.startsWith('data:') && !isValidBase64Image(logoSrc)) {
    logoSrc = '/img/codemaliq.jpg'
  }

  // Fallback to default logo if uploaded image fails to load
  if (imageError) {
    logoSrc = '/img/codemaliq.jpg'
  }

  const logoAlt = alt || branding.brandName || 'Logo'

  // Check if the logo is a base64 data URL
  const isBase64 = logoSrc.startsWith('data:')

  // Create a unique key for cache busting - use timestamp from branding data
  const cacheKey = `logo-${branding.lastUpdated || Date.now()}-${renderKey}`

  // For base64 images, use regular img tag to avoid Next.js optimization issues
  if (isBase64) {
    return (
      <img
        src={logoSrc}
        alt={logoAlt}
        width={width}
        height={height}
        className={`logo-preview ${className}`}
        onError={() => setImageError(true)}
        key={cacheKey}
        style={{
          objectFit: 'contain',
          imageRendering: 'auto',
          maxWidth: '100%',
          width: `${width}px`,
          height: `${height}px`
        }}
      />
    )
  }

  // For regular URLs, use Next.js Image component with proper aspect ratio handling
  return (
    <Image
      src={logoSrc}
      alt={logoAlt}
      width={0}
      height={0}
      sizes={`${Math.max(width, height)}px`}
      className={`logo-preview ${className}`}
      onError={() => setImageError(true)}
      priority
      key={cacheKey}
      style={{
        objectFit: 'contain',
        imageRendering: 'auto',
        width: 'auto',
        height: 'auto',
        maxWidth: `${width}px`,
        maxHeight: `${height}px`
      }}
    />
  )
}
