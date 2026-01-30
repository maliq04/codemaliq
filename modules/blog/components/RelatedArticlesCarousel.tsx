'use client'

import { usePathname, useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'
import { TbMessage2 as CommentIcon } from 'react-icons/tb'

import { PLACEHOLDER_URL } from '@/common/constant'
import { formatBlogSlug, formatDate } from '@/common/helpers'
import { sendDataLayer } from '@/common/libs/gtm'
import { BlogItem } from '@/common/types/blog'

interface RelatedArticlesCarouselProps {
  posts: BlogItem[]
}

export default function RelatedArticlesCarousel({ posts }: RelatedArticlesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  // Smart rotation: prioritize high-engagement posts more frequently
  useEffect(() => {
    if (posts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % posts.length)
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [posts.length])

  function handleCardClick(post: BlogItem) {
    sendDataLayer({
      event: 'article_clicked',
      article_id: post.id,
      article_title: post.title,
      article_collection_id: post.collection_id || '',
      page_path: pathname
    })

    const newSlug = formatBlogSlug(post.slug)
    const postId = `local-${post.slug}`

    router.push(`/blog/${newSlug}?id=${postId}&read-mode=true`)
  }

  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-700 transition-all duration-300 dark:text-neutral-200 md:text-xl">
          Related Articles
        </h3>
        <div className="flex gap-1">
          {posts.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-teal-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {posts.slice(0, 4).map((post, index) => {
          if (!post || !post.slug) return null

          return (
            <div
              key={post.id}
              className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
              onClick={() => handleCardClick(post)}
            >
              {/* Replace the Image Container section with this */}
              <div
                className="relative h-[200px] w-full overflow-hidden rounded-t-xl bg-neutral-200"
                style={{ isolation: 'isolate' }}
              >
                <img
                  src={post.cover_image || PLACEHOLDER_URL}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content remains within the same container */}
              <div className="p-4">
                <h3 className="mb-2 text-base font-semibold leading-tight text-neutral-700 transition-all duration-300 group-hover:text-teal-600 dark:text-neutral-200 dark:group-hover:text-teal-400 md:text-lg">
                  {post.title.slice(0, 60)}
                  {post.title.length > 60 ? '...' : ''}
                </h3>

                <p className="mb-3 hidden text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:block">
                  {post.description.slice(0, 120)}
                  {post.description.length > 120 ? '...' : ''}
                </p>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800">
                  <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{formatDate(post.published_at, 'MMM dd')}</span>
                    <div className="flex items-center gap-1">
                      <CommentIcon size={14} />
                      <span>{post.comments_count}</span>
                    </div>
                  </div>

                  <button className="text-xs font-medium text-teal-500 transition-colors duration-200 hover:text-teal-600">
                    Read →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
