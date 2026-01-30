import Link from 'next/link'

import Breakline from '@/components/elements/Breakline'
import CommentList from '@/components/elements/CommentList'
import Image from '@/components/elements/Image'
import MDXComponent from '@/components/elements/MDXComponent'

import { PLACEHOLDER_URL } from '@/common/constant'
import { BlogDetailProps, CommentItemProps } from '@/common/types/blog'

import ReaderHeader from './ReaderHeader'

interface ReaderProps {
  content: BlogDetailProps
  comments: CommentItemProps[]
  pageViewCount: number
}

export default function ReaderPage({ content, comments, pageViewCount }: ReaderProps) {
  const { cover_image, title, body_markdown, comments_count, published_at, tags, reading_time_minutes, id, url } =
    content
  return (
    <>
      <ReaderHeader
        title={title}
        comments_count={comments_count}
        reading_time_minutes={reading_time_minutes}
        published_at={published_at}
        page_views_count={pageViewCount}
      />
      <div className="space-y-6 leading-[1.8] text-neutral-900 dark:text-neutral-100">
        {/* Main Black Card */}
        <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-2xl">
          {/* Image Container: Created Full Width & Full Height according to aspect ratio */}
          <div className="relative h-[300px] w-full md:h-[450px]">
            <img
              src={cover_image || PLACEHOLDER_URL}
              alt={title}
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
              <h1 className="text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">{title}</h1>
            </div>
          </div>
        </div>

        {/* BLOG CONTENT SECTION */}
        <div className="mx-auto max-w-4xl px-4 py-8">
          {body_markdown && (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <MDXComponent>{body_markdown}</MDXComponent>
            </div>
          )}
        </div>
      </div>
      {tags?.length >= 1 && (
        <div className="my-10 space-y-2">
          <h3 className="text-lg font-medium">Tags:</h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {tags?.map((stack: string) => (
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
      <div className="mb-4 flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Comment on DEV Community:</h3>
        <Link href={url} target="_blank" className="text-blue-600">
          {url}
        </Link>
      </div>
      <CommentList id={id} totalComments={comments_count} comments={comments} />
    </>
  )
}
