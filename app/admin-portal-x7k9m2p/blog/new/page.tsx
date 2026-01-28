import { Metadata } from 'next'
import BlogEditor from '@/components/admin/blog/BlogEditor'

export const metadata: Metadata = {
  title: 'Create Blog Post - Admin',
  robots: 'noindex, nofollow'
}

export default function NewBlogPage() {
  return <BlogEditor />
}
