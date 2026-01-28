import { Metadata } from 'next'
import LearnList from '@/components/admin/learn/LearnList'

export const metadata: Metadata = {
  title: 'Learning Articles - Admin',
  robots: 'noindex, nofollow'
}

export default function LearningArticlesPage() {
  return <LearnList />
}
