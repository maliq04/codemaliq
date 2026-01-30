'use client'

import UploadManager from '@/components/admin/uploads/UploadManager'

export default function AdminUploadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Upload Management</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Manage site assets, branding, and upload settings</p>
      </div>

      <UploadManager />
    </div>
  )
}
