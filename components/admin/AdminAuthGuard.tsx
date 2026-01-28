'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AdminAuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AdminAuthGuard({ children, fallback }: AdminAuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (status === 'loading') {
        return
      }

      if (status === 'unauthenticated') {
        // Redirect to sign-in page
        router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
        return
      }

      if (status === 'authenticated') {
        try {
          // Check admin status via API
          const response = await fetch('/api/admin/check-access')
          const data = await response.json()
          
          setIsAdmin(data.isAdmin)
          setUserEmail(data.email)
          setIsChecking(false)
        } catch (error) {
          console.error('Failed to check admin access:', error)
          setIsAdmin(false)
          setIsChecking(false)
        }
      }
    }

    checkAdminAccess()
  }, [status, session, router])

  // Show loading state while checking authentication
  if (status === 'loading' || isChecking) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Verifying access...</p>
          </div>
        </div>
      )
    )
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-neutral-800">
          <div className="mb-4 text-6xl">🚫</div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">Access Denied</h1>
          <p className="mb-4 text-neutral-600 dark:text-neutral-400">
            You don't have permission to access the admin dashboard.
          </p>
          {userEmail && (
            <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-500">
              Signed in as: <span className="font-mono">{userEmail}</span>
            </p>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-neutral-900 px-6 py-2 text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              Go to Home
            </button>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="rounded-lg border border-neutral-300 px-6 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated and is admin
  return <>{children}</>
}
