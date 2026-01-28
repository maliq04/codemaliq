'use client'

import { useEffect, useState } from 'react'
import StatCard from './StatCard'
import RecentActivity from './RecentActivity'
import type { DashboardStats } from '@/common/types/admin'
import { FiFileText, FiFolder, FiMessageSquare, FiMail } from 'react-icons/fi'

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Failed to load statistics')
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <p className="font-medium">Error loading dashboard</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Blog Posts"
          value={stats?.totalBlogs ?? '-'}
          icon={<FiFileText className="h-6 w-6" />}
          color="blue"
          subtitle={stats?.recentBlogs ? `${stats.recentBlogs} this week` : undefined}
          loading={loading}
        />
        <StatCard
          title="Projects"
          value={stats?.totalProjects ?? '-'}
          icon={<FiFolder className="h-6 w-6" />}
          color="green"
          subtitle={stats?.recentProjects ? `${stats.recentProjects} this week` : undefined}
          loading={loading}
        />
        <StatCard
          title="Chat Messages"
          value={stats?.totalChatMessages ?? '-'}
          icon={<FiMessageSquare className="h-6 w-6" />}
          color="purple"
          subtitle={stats?.recentMessages ? `${stats.recentMessages} this week` : undefined}
          loading={loading}
        />
        <StatCard
          title="Contacts"
          value={stats?.unreadContacts ?? '-'}
          icon={<FiMail className="h-6 w-6" />}
          color="orange"
          subtitle="Unread messages"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin-portal-x7k9m2p/blog"
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md dark:bg-neutral-800"
          >
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">New Blog Post</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Create a new article</p>
            </div>
          </a>

          <a
            href="/admin-portal-x7k9m2p/projects"
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md dark:bg-neutral-800"
          >
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">New Project</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Add a portfolio project</p>
            </div>
          </a>

          <a
            href="/admin-portal-x7k9m2p/media"
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md dark:bg-neutral-800"
          >
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
              <svg
                className="h-6 w-6 text-purple-600 dark:text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Upload Media</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Add images to library</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100">Recent Activity</h2>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
          <RecentActivity limit={10} />
        </div>
      </div>
    </div>
  )
}
