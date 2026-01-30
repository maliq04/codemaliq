'use client'

import { toast } from '@/lib/toast'
import { useState } from 'react'
import {
  FaBookmark,
  FaFacebook,
  FaHeart,
  FaLinkedin,
  FaRegBookmark,
  FaRegHeart,
  FaShare,
  FaTwitter
} from 'react-icons/fa'
import { HiOutlineLink } from 'react-icons/hi'

interface LocalStats {
  views: number
  likes: number
  comments: number
  shares: number
  bookmarks: number
}

interface UserInteractions {
  liked: boolean
  bookmarked: boolean
}

interface LocalInteractionBarProps {
  stats: LocalStats
  userInteractions: UserInteractions
  onLike: () => void
  onBookmark: () => void
  onShare: () => void
  slug: string
}

export default function LocalInteractionBar({
  stats,
  userInteractions,
  onLike,
  onBookmark,
  onShare,
  slug
}: LocalInteractionBarProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const title = typeof document !== 'undefined' ? document.title : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast.success('Link copied to clipboard!')
      onShare()
      setShowShareMenu(false)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleSocialShare = (platform: string) => {
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(
          currentUrl
        )}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      onShare()
      setShowShareMenu(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <button
          onClick={onLike}
          className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 ${
            userInteractions.liked
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-neutral-200 text-neutral-600 hover:bg-red-100 hover:text-red-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
          }`}
        >
          {userInteractions.liked ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
          <span className="font-medium">{stats.likes}</span>
          <span className="hidden sm:inline">Like{stats.likes !== 1 && 's'}</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={onBookmark}
          className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 ${
            userInteractions.bookmarked
              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-neutral-200 text-neutral-600 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400'
          }`}
        >
          {userInteractions.bookmarked ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />}
          <span className="font-medium">{stats.bookmarks}</span>
          <span className="hidden sm:inline">Bookmark{stats.bookmarks !== 1 && 's'}</span>
        </button>
      </div>

      {/* Share Button */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 ${
            stats.shares > 0
              ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
              : 'bg-neutral-200 text-neutral-600 hover:bg-green-100 hover:text-green-600 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-green-900/30 dark:hover:text-green-400'
          }`}
        >
          <FaShare size={16} />
          <span className="font-medium">{stats.shares}</span>
          <span className="hidden sm:inline">Share{stats.shares !== 1 && 's'}</span>
        </button>

        {/* Share Menu */}
        {showShareMenu && (
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-white p-2 shadow-lg dark:bg-neutral-800">
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <HiOutlineLink size={18} />
              <span>Copy Link</span>
            </button>
            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <FaTwitter size={18} className="text-blue-400" />
              <span>Share on Twitter</span>
            </button>
            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <FaFacebook size={18} className="text-blue-600" />
              <span>Share on Facebook</span>
            </button>
            <button
              onClick={() => handleSocialShare('linkedin')}
              className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <FaLinkedin size={18} className="text-blue-700" />
              <span>Share on LinkedIn</span>
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />}
    </div>
  )
}
