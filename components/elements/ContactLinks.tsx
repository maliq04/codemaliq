'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaNpm, FaDiscord, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'

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
    return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : <FaGithub className="w-8 h-8 text-white" />
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-40"></div>
          </div>
        ))}
      </div>
    )
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No contact links available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {links
        .sort((a, b) => a.order - b.order)
        .map(link => (
          <div
            key={link.id}
            className={`p-6 rounded-2xl text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300 ${
              link.bgColor || 'bg-neutral-900'
            }`}
          >
            {/* Background pattern/texture */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4">
                {renderIcon(link.icon)}
              </div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">{link.title}</h3>
              <p className="text-sm opacity-80 mb-4 leading-relaxed">
                {link.description}
              </p>
              
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors duration-200 backdrop-blur-sm"
              >
                {link.buttonText || 'Go to Link'} →
              </Link>
            </div>
            
            {/* Large icon in background */}
            <div className="absolute bottom-4 right-4 opacity-20">
              {renderIcon(link.icon)}
            </div>
          </div>
        ))}
    </div>
  )
}