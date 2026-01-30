'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'
import { FaDiscord, FaGithub, FaInstagram, FaLinkedin, FaNpm, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa'

interface ContactLink {
  id: string
  title: string
  description: string
  url: string
  icon: string
  category: 'social' | 'professional' | 'community' | 'other'
  isActive: boolean
  order: number
  bgColor?: string
  buttonText?: string
}

const iconMap = {
  github: FaGithub,
  linkedin: FaLinkedin,
  npm: FaNpm,
  discord: FaDiscord,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok
}

export default function ContactLinks() {
  const [links, setLinks] = useState<ContactLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/contact-links')
      const result = await response.json()
      if (result.success) {
        setLinks(result.data.filter((link: ContactLink) => link.isActive))
      }
    } catch (err) {
      console.error('Failed to fetch contact links')
    } finally {
      setLoading(false)
    }
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent ? (
      <IconComponent className="h-8 w-8 text-white" />
    ) : (
      <FaGithub className="h-8 w-8 text-white" />
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
          </div>
        ))}
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No contact links available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {links
        .sort((a, b) => a.order - b.order)
        .map(link => (
          <div
            key={link.id}
            className={`group relative overflow-hidden rounded-2xl p-6 text-white transition-transform duration-300 hover:scale-105 ${
              link.bgColor || 'bg-neutral-900'
            }`}
          >
            {/* Background pattern/texture */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-4 top-4">{renderIcon(link.icon)}</div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="mb-2 text-xl font-bold">{link.title}</h3>
              <p className="mb-4 text-sm leading-relaxed opacity-80">{link.description}</p>

              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors duration-200 hover:bg-white/30"
              >
                {link.buttonText || 'Go to Link'} →
              </Link>
            </div>

            {/* Large icon in background */}
            <div className="absolute bottom-4 right-4 opacity-20">{renderIcon(link.icon)}</div>
          </div>
        ))}
    </div>
  )
}
