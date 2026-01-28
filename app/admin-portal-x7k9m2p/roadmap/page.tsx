import { Metadata } from 'next'
import RoadmapEditor from '@/components/admin/roadmap/RoadmapEditor'

export const metadata: Metadata = {
  title: 'Roadmap Management - Admin',
  robots: 'noindex, nofollow'
}

export default function RoadmapPage() {
  return <RoadmapEditor />
}
