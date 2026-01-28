import { Metadata } from 'next'
import ProjectEditor from '@/components/admin/projects/ProjectEditor'

export const metadata: Metadata = {
  title: 'Edit Project - Admin',
  robots: 'noindex, nofollow'
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return <ProjectEditor id={params.id} />
}
