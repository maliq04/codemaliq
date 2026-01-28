import { Metadata } from 'next'
import BlogList from '@/components/admin/blog/BlogList'

export const metadata: Metadata = {
  title: 'Blog Management - Admin',
  robots: 'noindex, nofollow'
}

export default function BlogManagementPage() {
  return <BlogList />
}
