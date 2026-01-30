'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface BrandingSettings {
  logoUrl: string
  faviconUrl: string
  ogImageUrl: string
  brandName: string
  brandDescription: string
  lastUpdated?: number
}

interface BrandingContextType {
  branding: BrandingSettings
  refreshBranding: () => Promise<void>
  isLoading: boolean
  forceRefresh: () => Promise<void>
}

const defaultBranding: BrandingSettings = {
  logoUrl: '/img/codemaliq.jpg',
  faviconUrl: '/favicon.ico',
  ogImageUrl: '/img/codemaliq.jpg',
  brandName: 'Maliq Al Fathir',
  brandDescription: 'Full Stack Developer & Tech Enthusiast'
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  refreshBranding: async () => {},
  isLoading: true,
  forceRefresh: async () => {}
})

export const useBranding = () => {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}

interface BrandingProviderProps {
  children: ReactNode
}

export default function BrandingProvider({ children }: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchBranding = async (forceRefresh = false) => {
    try {
      const cacheBuster = forceRefresh ? `?t=${Date.now()}&r=${Math.random()}` : `?t=${Date.now()}`

      const response = await fetch(`/api/branding${cacheBuster}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      })

      if (response.ok) {
        const data = await response.json()

        if (data.success) {
          const newBranding = {
            ...data.data,
            lastUpdated: Date.now()
          }

          setBranding(newBranding)
          setRefreshKey(prev => prev + 1)

          // Force favicon update by dispatching a custom event
          window.dispatchEvent(
            new CustomEvent('brandingUpdated', {
              detail: newBranding
            })
          )

          // Force a re-render of all branding-dependent components
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('brandingForceUpdate', {
                detail: newBranding
              })
            )
          }, 100)
        }
      }
    } catch (error) {
      console.error('BrandingProvider: Failed to fetch branding settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshBranding = async () => {
    setIsLoading(true)
    await fetchBranding(false)
  }

  const forceRefresh = async () => {
    setIsLoading(true)
    await fetchBranding(true)

    // Additional force refresh with multiple strategies
    setTimeout(async () => {
      await fetchBranding(true)

      // Force all components to re-render by updating refresh key
      setRefreshKey(prev => prev + 1)

      // Dispatch multiple events to ensure all components update
      window.dispatchEvent(
        new CustomEvent('brandingUpdated', {
          detail: { ...branding, forceUpdate: true, timestamp: Date.now() }
        })
      )

      window.dispatchEvent(
        new CustomEvent('brandingForceUpdate', {
          detail: { ...branding, forceUpdate: true, timestamp: Date.now() }
        })
      )

      // Additional event after short delay
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('brandingRefresh', {
            detail: { ...branding, forceUpdate: true, timestamp: Date.now() }
          })
        )
      }, 200)
    }, 100)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        fetchBranding(false)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [])

  const contextValue = {
    branding: { ...branding, refreshKey },
    refreshBranding,
    isLoading,
    forceRefresh
  }

  return <BrandingContext.Provider value={contextValue}>{children}</BrandingContext.Provider>
}
