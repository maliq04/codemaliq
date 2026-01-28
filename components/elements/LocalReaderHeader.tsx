'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaRegEye as ViewIcon, FaHeart as LikeIcon, FaComment as CommentIcon } from 'react-icons/fa'
import { HiOutlineClock as ClockIcon, HiShare } from 'react-icons/hi'
import { BsBookmark as BookmarkIcon } from 'react-icons/bs'
import { scroller } from 'react-scroll'

import { formatDate } from '@/common/helpers'

interface LocalStats {
  views: number
  likes: number
  comments: number
  shares: number
  bookmarks: number
}

interface LocalReaderHeaderProps {
  title: string
  stats: LocalStats
  reading_time_minutes?: number
  published_at?: string
}

export default function LocalReaderHeader({
  title,
  stats,
  published_at,
  reading_time_minutes
}: LocalReaderHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  const scrollToSection = () => {
    scroller.scrollTo('local-comments', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 250)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const transition = { duration: 0.3, ease: 'easeInOut' }
  const titleVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 }
  }

  return (
    <>
      {!isScrolled ? (
        <motion.div
          className="space-y-4"
          initial="initial"
          animate="animate"
          variants={titleVariants}
          transition={transition}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            Local Post
          </div>
          {/* Title is now displayed on the image, so we hide it here */}
        </motion.div>
      ) : (
        <motion.div
          className="shadow-bottom top-0 z-10 border-b border-neutral-300 bg-light py-6 backdrop-blur dark:border-neutral-600 dark:bg-dark lg:sticky"
          initial="initial"
          animate="animate"
          variants={titleVariants}
          transition={transition}
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              Local
            </div>
            <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>
          </div>
        </motion.div>
      )}
      
      <div className="mb-6 flex flex-col justify-between gap-2 border-b border-dashed border-neutral-600 pb-6 pt-5 text-[14px] text-neutral-600 dark:text-neutral-400 sm:flex-row">
        <div>
          Published on
          <span className="px-1 font-medium">{published_at ? formatDate(published_at) : ''}</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1 font-medium">
            <ViewIcon size={16} />
            <div className="ml-0.5 flex gap-1">
              <span>{stats.views}</span>
              <span>Views</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 font-medium">
            <ClockIcon size={16} />
            <div className="ml-0.5 flex gap-1">
              <span>{reading_time_minutes}</span>
              <span>min read</span>
            </div>
          </div>

          <div className={`flex items-center gap-1 font-medium ${stats.likes > 0 ? 'text-red-500' : ''}`}>
            <LikeIcon size={16} />
            <div className="ml-0.5 flex gap-1">
              <span>{stats.likes}</span>
              <span>Like{stats.likes !== 1 && 's'}</span>
            </div>
          </div>
          
          <div
            className="hidden cursor-pointer items-center gap-1 font-medium hover:dark:text-neutral-300 md:flex"
            onClick={scrollToSection}
          >
            <CommentIcon size={16} />
            <div className="ml-0.5 flex gap-1">
              <span>{stats.comments}</span>
              <span>Comment{stats.comments !== 1 && 's'}</span>
            </div>
          </div>

          <div className={`flex items-center gap-1 font-medium ${stats.shares > 0 ? 'text-green-500' : ''}`}>
            <HiShare size={16} />
            <div className="ml-0.5 flex gap-1">
              <span>{stats.shares}</span>
              <span>Share{stats.shares !== 1 && 's'}</span>
            </div>
          </div>

          <div className={`flex items-center gap-1 font-medium ${stats.bookmarks > 0 ? 'text-yellow-500' : ''}`}>
            <BookmarkIcon size={16} />
            <div className="ml-0.5 flex gap-1">
              <span>{stats.bookmarks}</span>
              <span>Bookmark{stats.bookmarks !== 1 && 's'}</span>
            </div>
          </div>
        </div>

        <div
          className="flex cursor-pointer items-center gap-1 font-medium hover:dark:text-neutral-300 md:hidden"
          onClick={scrollToSection}
        >
          <CommentIcon size={16} />
          <div className="ml-0.5 flex gap-1">
            <span>{stats.comments}</span>
            <span>Comment{stats.comments !== 1 && 's'}</span>
          </div>
        </div>
      </div>
    </>
  )
}