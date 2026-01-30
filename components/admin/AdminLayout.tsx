'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import {
  FiActivity,
  FiBook,
  FiFileText,
  FiFolder,
  FiHome,
  FiImage,
  FiLogOut,
  FiMail,
  FiMap,
  FiMenu,
  FiMessageSquare,
  FiSettings,
  FiUpload,
  FiUser,
  FiX
} from 'react-icons/fi'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin-portal-x7k9m2p', icon: FiHome },
  { name: 'Blog Posts', href: '/admin-portal-x7k9m2p/blog', icon: FiFileText },
  { name: 'Projects', href: '/admin-portal-x7k9m2p/projects', icon: FiFolder },
  { name: 'Chat Moderation', href: '/admin-portal-x7k9m2p/chat', icon: FiMessageSquare },
  { name: 'Learning Articles', href: '/admin-portal-x7k9m2p/learn', icon: FiBook },
  { name: 'Roadmap', href: '/admin-portal-x7k9m2p/roadmap', icon: FiMap },
  { name: 'Contacts', href: '/admin-portal-x7k9m2p/contacts', icon: FiMail },
  { name: 'Profile & CV', href: '/admin-portal-x7k9m2p/profile', icon: FiUser },
  { name: 'Media Library', href: '/admin-portal-x7k9m2p/media', icon: FiImage },
  { name: 'Upload Management', href: '/admin-portal-x7k9m2p/uploads', icon: FiUpload },
  { name: 'Configuration', href: '/admin-portal-x7k9m2p/config', icon: FiSettings },
  { name: 'Audit Log', href: '/admin-portal-x7k9m2p/audit', icon: FiActivity }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-neutral-800 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-700">
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 lg:hidden"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map(item => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-700'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
            <div className="mb-3 flex items-center gap-3">
              {session?.user?.image && (
                <img src={session.user.image} alt={session.user.name || 'Admin'} className="h-10 w-10 rounded-full" />
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {session?.user?.name}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              <FiLogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 lg:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              View Site →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 dark:bg-neutral-900">{children}</main>
      </div>
    </div>
  )
}
