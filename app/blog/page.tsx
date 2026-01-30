import { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import Container from '@/components/elements/Container'
import { getBlogData } from '@/services/blog'

import { BLOG_LINK } from '@/common/constant/menu'
import { METADATA } from '@/common/constant/metadata'
import { BlogItem } from '@/common/types/blog'

import Blog from '@/modules/blog'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: `Blog ${METADATA.exTitle}`,
  description: 'My blogs content about programming and software development',
  keywords: 'blog code maliq, codemaliq',
  alternates: {
    canonical: `${process.env.DOMAIN}/blog`
  }
}

export default async function BlogPage({ searchParams }: { searchParams: { category: string } }) {
  if (!searchParams.category) {
    redirect('/blog?category=home')
  }
  const blogs = await getBlog(searchParams.category)
  return (
    <Container data-aos="fade-left">
      <Blog blogs={blogs} />
    </Container>
  )
}

async function getBlog(category: string) {
  revalidatePath('/blog')
  const blogs = await getBlogData()

  const activeId = BLOG_LINK.find(link => link.value === category)?.id

  const data: BlogItem[] = blogs?.filter((blog: BlogItem) => {
    return blog.collection_id === activeId
  })

  return data
}
