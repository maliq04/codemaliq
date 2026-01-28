import { Metadata } from 'next'
import AdminAuthGuard from '@/components/admin/AdminAuthGuard'
import AdminLayout from '@/components/admin/AdminLayout'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing website content',
  robots: {
    index: false,
    follow: false
  }
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  )
}
