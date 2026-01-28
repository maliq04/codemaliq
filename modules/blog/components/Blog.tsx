import { BlogItem } from '@/common/types/blog'

import BlogHeader from './BlogHeader'
import BlogThumbnail from './BlogThumbnail'
import RelatedArticlesCarousel from './RelatedArticlesCarousel'

interface BlogProps {
  blogs: BlogItem[]
}

export default function Blog({ blogs }: BlogProps) {
  return (
    <div className="space-y-12">
      {/* Blog Header */}
      <BlogHeader />
      
      {/* Featured Post - Clean Layout */}
      {blogs && blogs.length > 0 && (
        <div className="space-y-8">
          <BlogThumbnail newestBlog={blogs[0]} />
        </div>
      )}
      
      {/* Related Articles Section - Clean Layout */}
      {blogs && blogs.length > 1 && (
        <div className="space-y-6">
          <RelatedArticlesCarousel posts={blogs.slice(1)} />
        </div>
      )}
    </div>
  )
}
