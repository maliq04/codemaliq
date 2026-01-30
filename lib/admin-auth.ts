import { options } from '@/app/api/auth/[...nextauth]/options'
import { getServerSession } from 'next-auth/next'

/**
 * Get the list of admin emails from environment variables
 */
export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || ''
  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0)
}

/**
 * Check if a given email is in the admin whitelist
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false

  const adminEmails = getAdminEmails()
  const normalizedEmail = email.trim().toLowerCase()

  return adminEmails.includes(normalizedEmail)
}

/**
 * Check if the current user is an admin
 * Returns true if user is authenticated and their email is in the admin whitelist
 */
export async function isAdminUser(): Promise<boolean> {
  const session = await getServerSession(options)

  if (!session?.user?.email) {
    return false
  }

  return isAdminEmail(session.user.email)
}

/**
 * Get the current admin session
 * Returns the session if user is an admin, null otherwise
 */
export async function getAdminSession() {
  const session = await getServerSession(options)

  if (!session?.user?.email) {
    return null
  }

  if (!isAdminEmail(session.user.email)) {
    return null
  }

  return session
}

/**
 * Admin user interface
 */
export interface AdminUser {
  email: string
  name: string | null
  image: string | null
}

/**
 * Get admin user info from session
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getAdminSession()

  if (!session?.user) {
    return null
  }

  return {
    email: session.user.email!,
    name: session.user.name || null,
    image: session.user.image || null
  }
}
