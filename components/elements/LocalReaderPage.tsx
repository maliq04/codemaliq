'use client'

import Image from '@/components/elements/Image'
import { useState, useEffect } from 'react'

import Breakline from '@/components/elements/Breakline'
import MDXComponent from '@/components/elements/MDXComponent'

import { PLACEHOLDER_URL } from '@/common/constant'
import { BlogDetailProps } from '@/common/types/blog'

import LocalReaderHeader from '@/components/elements/LocalReaderHeader'
import LocalInteractionBar from '@/components/elements/LocalInteractionBar'
import LocalCommentSystem from '@/components/elements/LocalCommentSystem'

interface LocalReaderProps {
  content: BlogDetailProps
  pageViewCount: number
}

interface LocalStats {
  views: number
  likes: number
  comments: number
  shares: number
  bookmarks: number
}

export default function LocalReaderPage({ content, pageViewCount }: LocalReaderProps) {
  // Safety check for content
  if (!content) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: No content provided to LocalReaderPage
        </div>
      </div>
    )
  }

  const { cover_image, title, body_markdown, published_at, tags, reading_time_minutes, slug } = content
  
  // Initialize state with error handling
  const [stats, setStats] = useState<LocalStats>({
    views: pageViewCount || 0,
    likes: 0,
    comments: 0,
    shares: 0,
    bookmarks: 0
  })
  
  const [userInteractions, setUserInteractions] = useState({
    liked: false,
    bookmarked: false
  })

  // Simplified functions with error handling
  const loadStats = async () => {
    if (!slug) return
    
    try {
      const response = await fetch(`/api/blog/${slug}/stats`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && setStats) {
          setStats(prev => ({ ...prev, ...data.data }))
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadUserInteractions = () => {
    if (!slug || !setUserInteractions) return
    
    try {
      const liked = localStorage.getItem(`liked_${slug}`) === 'true'
      const bookmarked = localStorage.getItem(`bookmarked_${slug}`) === 'true'
      setUserInteractions({ liked, bookmarked })
    } catch (error) {
      console.error('Failed to load user interactions:', error)
    }
  }

  const trackView = async () => {
    if (!slug) return
    
    try {
      await fetch(`/api/blog/${slug}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' })
      })
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  // Load stats and user interactions on mount
  useEffect(() => {
    if (!slug) return
    
    loadStats()
    loadUserInteractions()
    trackView()
  }, [slug])

  const handleLike = async () => {
    if (!slug || !setStats || !setUserInteractions) return
    
    try {
      const action = userInteractions.liked ? 'unlike' : 'like'
      
      const response = await fetch(`/api/blog/${slug}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const newLiked = !userInteractions.liked
        setUserInteractions(prev => ({ ...prev, liked: newLiked }))
        setStats(prev => ({
          ...prev,
          likes: newLiked ? prev.likes + 1 : prev.likes - 1
        }))
        localStorage.setItem(`liked_${slug}`, newLiked.toString())
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleBookmark = async () => {
    if (!slug || !setStats || !setUserInteractions) return
    
    try {
      const action = userInteractions.bookmarked ? 'unbookmark' : 'bookmark'
      const response = await fetch(`/api/blog/${slug}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const newBookmarked = !userInteractions.bookmarked
        setUserInteractions(prev => ({ ...prev, bookmarked: newBookmarked }))
        setStats(prev => ({
          ...prev,
          bookmarks: newBookmarked ? prev.bookmarks + 1 : prev.bookmarks - 1
        }))
        localStorage.setItem(`bookmarked_${slug}`, newBookmarked.toString())
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  const handleShare = async () => {
    if (!slug || !setStats) return
    
    try {
      await fetch(`/api/blog/${slug}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share' })
      })
      setStats(prev => ({ ...prev, shares: prev.shares + 1 }))
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  const handleCommentAdded = () => {
    if (!setStats) return
    setStats(prev => ({ ...prev, comments: prev.comments + 1 }))
  }

  return (
    <>
      <LocalReaderHeader
        title={title || 'Untitled'}
        stats={stats}
        reading_time_minutes={reading_time_minutes}
        published_at={published_at}
      />
      
      <div className="space-y-6 leading-[1.8] text-neutral-900 dark:text-neutral-100">
        {/* Main Black Card */}
        <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-2xl">
          {/* Image Container: Created Full Width & Full Height according to aspect ratio */}
          <div className="w-full h-[300px] md:h-[450px] relative">
            <img
              src={cover_image || PLACEHOLDER_URL}
              alt={title || 'Blog post image'}
              className="w-full h-full object-cover"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover' // This is key to ensuring the image isn't squashed but remains full.
              }}
            />
            {/* Professional gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {title || 'Untitled Post'}
              </h1>
            </div>
          </div>
          
          {/* Title: Here we'll add padding so the text doesn't overlap the edges */}
          <div className="p-10">
            <h2 className="text-xl font-medium text-white leading-tight mb-4">
              {/* Additional metadata or description can go here */}
            </h2>
          </div>
        </div>
        
        {/* BLOG CONTENT SECTION */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {body_markdown ? (
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <MDXComponent>{body_markdown}</MDXComponent>
            </div>
          ) : (
            <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-lg dark:bg-neutral-800 dark:border-neutral-700">
              <p className="text-neutral-800 dark:text-neutral-200">
                Content is loading...
              </p>
            </div>
          )}
        </div>
      </div>

      {tags && tags.length >= 1 && (
        <div className="my-10 space-y-2">
          <h3 className="text-lg font-medium">Tags:</h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((stack: string) => (
              <span
                key={stack}
                className="rounded-full bg-neutral-200 px-4 py-1 text-[14px] font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200"
              >
                {stack}
              </span>
            ))}
          </div>
        </div>
      )}

      <Breakline className="!my-10" />

      <LocalInteractionBar
        stats={stats}
        userInteractions={userInteractions}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        slug={slug || ''}
      />

      <Breakline className="!my-6" />

      <LocalCommentSystem
        slug={slug || ''}
        commentsCount={stats.comments}
        onCommentAdded={handleCommentAdded}
      />
    </>
  )
}