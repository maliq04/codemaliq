import { Metadata } from 'next'

import AuditLogViewer from '@/components/admin/audit/AuditLogViewer'

export const metadata: Metadata = {
  title: 'Audit Log - Admin',
  robots: 'noindex, nofollow'
}

export default function AuditLogPage() {
  return <AuditLogViewer />
}
