'use client'

import { FirebaseSocialLinksService, SocialLinksData } from '@/lib/firebase-social-links'
import { useEffect, useState } from 'react'

import { SOCIAL_MEDIA } from '@/common/constant/menu'

import ContactCard from './ContactCard'

export default function ContactList() {
  const [socialLinks, setSocialLinks] = useState<SocialLinksData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let unsubscribe: (() => void) | null = null

    try {
      // Set timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Firebase social links connection timeout, using defaults')
          const defaultLinks = FirebaseSocialLinksService.getDefaultLinks()
          setSocialLinks(defaultLinks)
          setLoading(false)
        }
      }, 8000) // 8 second timeout for frontend

      // Subscribe to real-time social links updates
      unsubscribe = FirebaseSocialLinksService.subscribeToSocialLinks(updatedLinks => {
        clearTimeout(timeoutId)
        setSocialLinks(updatedLinks)
        setLoading(false)
        console.log('Social links updated on contact page:', updatedLinks)
      })
    } catch (error) {
      console.error('Failed to load social links:', error)
      // Use default links as fallback
      const defaultLinks = FirebaseSocialLinksService.getDefaultLinks()
      setSocialLinks(defaultLinks)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [mounted, loading])

  // Create updated social media items with Firebase URLs
  const getUpdatedSocialMedia = () => {
    if (!socialLinks) return SOCIAL_MEDIA

    return SOCIAL_MEDIA.map(media => {
      let updatedHref = media.href

      // Map Firebase links to social media items
      switch (media.id) {
        case 'GitHub':
          updatedHref = socialLinks.github || media.href
          break
        case 'Linkedin':
          updatedHref = socialLinks.linkedin || media.href
          break
        case 'NPM':
          updatedHref = socialLinks.npm || media.href
          break
        case 'Discord':
          updatedHref = socialLinks.discord || media.href
          break
      }

      return {
        ...media,
        href: updatedHref
      }
    })
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex flex-col space-y-4">
        <h2>Find me on</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SOCIAL_MEDIA.map(media => (
            <ContactCard {...media} key={media.id} />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        <h2>Find me on</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const updatedSocialMedia = getUpdatedSocialMedia()

  return (
    <div className="flex flex-col space-y-4">
      <h2>Find me on</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {updatedSocialMedia.map(media => (
          <ContactCard {...media} key={media.id} />
        ))}
      </div>
    </div>
  )
}
