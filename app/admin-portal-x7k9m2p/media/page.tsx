import { Metadata } from 'next'
import MediaLibrary from '@/components/admin/media/MediaLibrary'

export const metadata: Metadata = {
  title: 'Media Library - Admin',
  robots: 'noindex, nofollow'
}

export default function MediaLibraryPage() {
  return <MediaLibrary />
}
