import { Metadata } from 'next'

import BackButton from '@/components/elements/BackButton'
import Container from '@/components/elements/Container'
import LocalReaderPage from '@/components/elements/LocalReaderPage'
import ReaderPage from '@/components/elements/ReaderPage'
import StructuredData from '@/components/elements/StructuredData'
import { getBlogDetail, getComments } from '@/services/blog'
import { getBlogViews } from '@/services/view'
import { BlogPosting, WithContext } from 'schema-dts'

import { METADATA } from '@/common/constant/metadata'
import { BlogDetailProps, CommentItemProps } from '@/common/types/blog'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const blog = await getBlogDetail({ params, searchParams })

  // Handle missing blog data
  if (!blog || !blog.title) {
    return {
      title: `Blog Post Not Found ${METADATA.exTitle}`,
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: `${blog.title} ${METADATA.exTitle}`,
    description: blog.description,
    openGraph: {
      images: blog.cover_image,
      url: `${process.env.DOMAIN}/${blog.slug}`,
      siteName: METADATA.openGraph.siteName,
      locale: METADATA.openGraph.locale,
      type: 'article',
      authors: blog.user?.name || 'Maliq Al Fathir'
    },
    keywords: blog.title,
    alternates: {
      canonical: `${process.env.DOMAIN}/${blog.slug}`
    }
  }
}

function generateStructuredData(blog: BlogDetailProps, comments: CommentItemProps[]): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    name: blog.title,
    description: blog.description,
    datePublished: blog.published_at,
    dateCreated: blog.created_at,
    url: blog.url,
    author: {
      '@type': 'Person',
      name: blog.user?.name || 'Maliq Al Fathir',
      image: {
        '@type': 'ImageObject',
        url: blog.user?.profile_image || ''
      },
      url: blog.user?.website_url || ''
    },
    image: {
      '@type': 'ImageObject',
      url: blog.cover_image
    },
    commentCount: comments.length,
    keywords: blog.tag_list
  }
}

export default async function BlogDetailPage({ params, searchParams }: Props) {
  const blog = await getBlogDetail({ params, searchParams })

  const pageViewCount = await getBlogViews(searchParams.id as string)
  const comments = await getComments(searchParams.id as string)

  // Check if this is a local post (starts with 'local-')
  const isLocalPost = (searchParams.id as string)?.startsWith('local-')

  return (
    <>
      <StructuredData data={generateStructuredData(blog, comments)} />
      <Container data-aos="fade-left">
        <BackButton url="/blog?category=home" />
        {isLocalPost ? (
          <LocalReaderPage content={blog} pageViewCount={pageViewCount} />
        ) : (
          <ReaderPage content={blog} pageViewCount={pageViewCount} comments={comments} />
        )}
      </Container>
    </>
  )
}
