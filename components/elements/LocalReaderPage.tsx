'use client'

import Breakline from '@/components/elements/Breakline'
import LocalCommentSystem from '@/components/elements/LocalCommentSystem'
import LocalInteractionBar from '@/components/elements/LocalInteractionBar'
import LocalReaderHeader from '@/components/elements/LocalReaderHeader'
import MDXComponent from '@/components/elements/MDXComponent'
import { useEffect, useState } from 'react'

import { PLACEHOLDER_URL } from '@/common/constant'
import { BlogDetailProps } from '@/common/types/blog'

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
  // Initialize all hooks at the top level (unconditionally)
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

  // Load stats and user interactions on mount (must be before early return)
  useEffect(() => {
    if (!content?.slug) return

    const loadStats = async () => {
      try {
        const response = await fetch(`/api/blog/${content.slug}/stats`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats(prev => ({ ...prev, ...data.data }))
          }
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    const loadUserInteractions = () => {
      try {
        const liked = localStorage.getItem(`liked_${content.slug}`) === 'true'
        const bookmarked = localStorage.getItem(`bookmarked_${content.slug}`) === 'true'
        setUserInteractions({ liked, bookmarked })
      } catch (error) {
        console.error('Failed to load user interactions:', error)
      }
    }

    const trackView = async () => {
      try {
        await fetch(`/api/blog/${content.slug}/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'view' })
        })
      } catch (error) {
        console.error('Failed to track view:', error)
      }
    }

    loadStats()
    loadUserInteractions()
    trackView()
  }, [content?.slug])

  // Safety check for content (after hooks)
  if (!content) {
    return (
      <div className="p-8 text-center">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          Error: No content provided to LocalReaderPage
        </div>
      </div>
    )
  }

  const { cover_image, title, body_markdown, published_at, tags, reading_time_minutes, slug } = content

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
        <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-2xl">
          {/* Image Container: Created Full Width & Full Height according to aspect ratio */}
          <div className="relative h-[300px] w-full md:h-[450px]">
            <img
              src={cover_image || PLACEHOLDER_URL}
              alt={title || 'Blog post image'}
              className="h-full w-full object-cover"
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
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-8">
              <h1 className="text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">{title || 'Untitled Post'}</h1>
            </div>
          </div>

          {/* Title: Here we'll add padding so the text doesn't overlap the edges */}
          <div className="p-10">
            <h2 className="mb-4 text-xl font-medium leading-tight text-white">
              {/* Additional metadata or description can go here */}
            </h2>
          </div>
        </div>

        {/* BLOG CONTENT SECTION */}
        <div className="mx-auto max-w-4xl px-4 py-8">
          {body_markdown ? (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <MDXComponent>{body_markdown}</MDXComponent>
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-300 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-neutral-800 dark:text-neutral-200">Content is loading...</p>
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

      <LocalCommentSystem slug={slug || ''} commentsCount={stats.comments} onCommentAdded={handleCommentAdded} />
    </>
  )
}
