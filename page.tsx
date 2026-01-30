import { Metadata } from 'next'

import SearchInput from '@/SearchInput'
import AdsPlaceholder from '@/components/elements/AdsPlaceholder'
import Section from '@/components/elements/Section'
import { siteConfig } from '@/config'
import { getBlogData } from '@/services/blog'
// Path yang benar untuk data blog
import { getPromotions } from '@/services/codemaliq'

import { IAdsBanner } from '@/common/types/ads'
import { BlogItem } from '@/common/types/blog'

import BlogCard from '@/modules/blog/components/BlogCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: `Kumpulan tulisan seputar pemrograman, teknologi, dan pengembangan diri oleh ${siteConfig.author.name}.`,
  alternates: {
    canonical: `${siteConfig.url}/blog`
  }
}

export default async function BlogPage() {
  const [posts, promotions] = await Promise.all([getBlogData(), getPromotions()])
  const promotion = promotions.find((item: IAdsBanner) => item.showingOn?.includes('/blog'))

  return (
    <Section>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-muted-foreground">
            Kumpulan tulisan seputar pemrograman, teknologi, dan pengembangan diri
          </p>
        </div>
        <SearchInput />
        {promotion && <AdsPlaceholder data={promotion} />}
        {posts.map((post: BlogItem) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </Section>
  )
}
