import { Metadata } from 'next'

import ProjectsList from '@/components/admin/projects/ProjectsList'

export const metadata: Metadata = {
  title: 'Projects Management - Admin',
  robots: 'noindex, nofollow'
}

export default function ProjectsPage() {
  return <ProjectsList />
}
