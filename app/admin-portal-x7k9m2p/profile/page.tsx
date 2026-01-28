import { Metadata } from 'next'
import CVManager from '@/components/admin/profile/CVManager'

export const metadata: Metadata = {
  title: 'Profile & CV Management - Admin Portal',
  description: 'Manage your professional profile and CV'
}

export default function ProfilePage() {
  return <CVManager />
}