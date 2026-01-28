'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { AuditLog } from '@/common/types/admin'
import { FiFileText, FiFolder, FiMessageSquare, FiMail, FiImage, FiSettings, FiBook, FiMap } from 'react-icons/fi'

interface RecentActivityProps {
  limit?: number
}

const iconMap = {
  blog: FiFileText,
  project: FiFolder,
  chat: FiMessageSquare,
  contact: FiMail,
  media: FiImage,
  config: FiSettings,
  learn: FiBook,
  roadmap: FiMap
}

const actionColors = {
  create: 'text-green-600 dark:text-green-400',
  update: 'text-blue-600 dark:text-blue-400',
  delete: 'text-red-600 dark:text-red-400'
}

export default function RecentActivity({ limit = 10 }: RecentActivityProps) {
  const [activities, setActivities] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [limit])

  async function fetchActivities() {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/audit?limit=${limit}`)
      const data = await response.json()

      if (data.success) {
        setActivities(data.data)
      } else {
        setError(data.error || 'Failed to load activity')
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('Failed to load recent activity')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg bg-neutral-50 p-8 text-center dark:bg-neutral-800">
        <p className="text-neutral-500 dark:text-neutral-400">No recent activity</p>
        <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
          Activity will appear here as you make changes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => {
        const Icon = iconMap[activity.resourceType]
        const actionColor = actionColors[activity.action]

        return (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <div className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-700">
              <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-900 dark:text-neutral-100">
                <span className={`font-medium ${actionColor}`}>
                  {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}d
                </span>{' '}
                {activity.resourceType}: <span className="font-medium">{activity.resourceTitle}</span>
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {activity.adminName || activity.adminEmail} •{' '}
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
