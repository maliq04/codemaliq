'use client'

import { usePathname, useRouter } from 'next/navigation'

import Image from '@/components/elements/Image'
import { TbMessage2 as CommentIcon } from 'react-icons/tb'

import { PLACEHOLDER_URL } from '@/common/constant'
import { formatBlogSlug, formatDate } from '@/common/helpers'
import { sendDataLayer } from '@/common/libs/gtm'
import { BlogItem } from '@/common/types/blog'

export interface BlogCardProps {
  post: BlogItem
  priority?: boolean
}

export default function BlogCard({ post, priority = false }: BlogCardProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Safety check for undefined post or missing slug
  if (!post || !post.slug) {
    console.error('BlogCard received invalid post:', post)
    return null
  }

  const trimmedTitle = post.title.slice(0, 70) + (post.title.length > 70 ? '...' : '')
  const trimmedContent = post.description.slice(0, 100) + (post.description.length > 100 ? '...' : '')

  function handleCardClick() {
    sendDataLayer({
      event: 'article_clicked',
      article_id: post.id,
      article_title: post.title,
      article_collection_id: post.collection_id || '',
      page_path: pathname
    })
    
    // Determine post type and routing
    const postSource = (post as any).source || 'unknown'
    const postType = (post as any).post_type || 'unknown'
    const isLocalPost = (post as any).is_local || postSource === 'mdx' || postSource === 'firebase'
    const isDevtoPost = postType === 'devto' || (post as any).devto_id
    const isAdminPost = postType === 'admin' || postSource === 'firebase'
    
    // Generate appropriate slug and post ID
    const newSlug = (isLocalPost && !isDevtoPost) ? post.slug : formatBlogSlug(post.slug)

    let postId: string
    if (isAdminPost) {
      // Admin posts use admin- prefix
      postId = `admin-${post.id}`
    } else if (isDevtoPost && (post as any).devto_id) {
      // Dev.to posts use their dev.to ID
      postId = (post as any).devto_id
    } else if (isLocalPost) {
      // Local MDX posts use local- prefix
      postId = `local-${post.slug}`
    } else {
      // Fallback to regular ID
      postId = post.id.toString()
    }
    
    console.log('BlogCard navigating to post:', { postType, postSource, isLocalPost, isAdminPost, postId, newSlug })
    
    router.push(`/blog/${newSlug}?id=${postId}&read-mode=true`)
  }

  return (
    <div className="flex w-full cursor-pointer flex-col text-start" onClick={handleCardClick}>
      <div className="relative aspect-[16/7] overflow-hidden rounded-lg">
        <Image 
          src={post.cover_image || PLACEHOLDER_URL} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={post.title} 
          className="h-full w-full object-cover"
          priority={priority}
        />
      </div>
      <article className="mt-4 flex w-full flex-grow flex-col space-y-3 self-center">
        <h2 className="font-medium  text-neutral-600 transition-all duration-300 dark:text-neutral-200 dark:hover:text-teal-400 md:text-[17px] lg:hover:text-teal-800 3xl:text-3xl">
          {trimmedTitle}
        </h2>
        <div className="flex gap-4 text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1 ">
            <span className="text-xs 3xl:text-base">{formatDate(post.published_at, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <CommentIcon size={16} />
            <span className="text-xs 3xl:text-base">
              <div className="flex gap-1">
                <span>{post.comments_count}</span>
                <span className="hidden lg:block">Comment{post.comments_count > 1 && 's'}</span>
              </div>
            </span>
          </div>
        </div>
        <p className="hidden text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:block 3xl:text-lg">
          {trimmedContent}
        </p>
      </article>
    </div>
  )
}
