import Image from '@/components/elements/Image'
import Link from 'next/link'

import { TbMessage2 as CommentIcon } from 'react-icons/tb'

import { PLACEHOLDER_URL } from '@/common/constant'
import { formatBlogSlug, formatDate } from '@/common/helpers'
import { BlogItem } from '@/common/types/blog'

export default function BlogThumbnail({ newestBlog }: { newestBlog: BlogItem }) {
  if (!newestBlog) return null

  // Determine post type and routing
  const postSource = (newestBlog as any).source || 'unknown'
  const postType = (newestBlog as any).post_type || 'unknown'
  const isLocalPost = (newestBlog as any).is_local || postSource === 'mdx' || postSource === 'firebase'
  const isDevtoPost = postType === 'devto' || (newestBlog as any).devto_id
  const isAdminPost = postType === 'admin' || postSource === 'firebase'
  
  const newSlug = (isLocalPost && !isDevtoPost) ? newestBlog.slug : formatBlogSlug(newestBlog.slug)

  let postId: string
  if (isAdminPost) {
    postId = `admin-${newestBlog.id}`
  } else if (isDevtoPost && (newestBlog as any).devto_id) {
    postId = (newestBlog as any).devto_id
  } else if (isLocalPost) {
    postId = `local-${newestBlog.slug}`
  } else {
    postId = newestBlog.id.toString()
  }

  return (
    <div className="w-full">
      {/* LARGE FEATURED POST - LIKE REFERENCE IMAGE */}
      <Link
        href={`/blog/${newSlug}?id=${postId}&read-mode=true`}
        className="group block w-full cursor-pointer transition-all duration-300 hover:scale-[1.01]"
      >
        {/* MASSIVE IMAGE CONTAINER - MATCHES REFERENCE */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-3xl blog-featured-hero">
          <Image
            src={newestBlog.cover_image || PLACEHOLDER_URL}
            fill
            sizes="100vw"
            alt={newestBlog.title}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          
          {/* Professional gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Featured badge */}
          <div className="absolute top-6 left-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
              Featured Post
            </span>
          </div>

          {/* Large content overlay - like reference */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="max-w-4xl">
              <h1 className="mb-4 text-3xl font-bold leading-tight transition-all duration-300 group-hover:text-teal-300 md:text-4xl lg:text-5xl xl:text-6xl">
                {newestBlog.title}
              </h1>
              
              <p className="mb-6 text-lg leading-relaxed text-white/90 md:text-xl lg:text-2xl max-w-3xl">
                {newestBlog.description}
              </p>
              
              {/* Professional metadata */}
              <div className="flex flex-wrap items-center gap-6 text-base text-white/90">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-teal-400"></div>
                  <span className="font-medium">{formatDate(newestBlog.published_at, 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CommentIcon size={18} />
                  <span>{newestBlog.comments_count} Comment{newestBlog.comments_count !== 1 ? 's' : ''}</span>
                </div>
                {newestBlog.tag_list && newestBlog.tag_list.length > 0 && (
                  <div className="flex gap-3">
                    {newestBlog.tag_list.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm border border-white/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Call to action */}
              <div className="mt-8">
                <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 px-6 py-3 text-lg font-semibold text-white backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105">
                  Read Full Article
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
