import { Metadata } from 'next'

import ProjectEditor from '@/components/admin/projects/ProjectEditor'

export const metadata: Metadata = {
  title: 'Create Project - Admin',
  robots: 'noindex, nofollow'
}

export default function NewProjectPage() {
  return <ProjectEditor />
}
