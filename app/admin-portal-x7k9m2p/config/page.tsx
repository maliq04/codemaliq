import { Metadata } from 'next'

import ConfigEditor from '@/components/admin/config/ConfigEditor'

export const metadata: Metadata = {
  title: 'Configuration - Admin',
  robots: 'noindex, nofollow'
}

export default function ConfigurationPage() {
  return <ConfigEditor />
}
