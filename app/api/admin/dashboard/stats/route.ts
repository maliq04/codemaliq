import { NextResponse } from 'next/server'

import { withAdminAuth } from '@/lib/api/admin-middleware'
import { getAdminDatabase } from '@/lib/firebase-admin'
import { listMDXFiles, readJSONFile } from '@/lib/fs-utils'

import type { DashboardStats } from '@/common/types/admin'

async function getStats() {
  try {
    // Get blog posts count
    const blogFiles = await listMDXFiles('contents/blog')
    const totalBlogs = blogFiles.length

    // Get recent blogs (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    // For now, we'll just count all blogs as recent
    const recentBlogs = 0 // Will be implemented when we parse dates

    // Get projects count from codemaliq.json
    const config = await readJSONFile<any>('codemaliq.json')
    const totalProjects = config?.projects?.length || 0
    const recentProjects = 0 // Will be implemented with timestamps

    // Get chat messages count from Firebase using Admin SDK
    const chatRef = database.ref('chat')
    const chatSnapshot = await chatRef.once('value')
    const totalChatMessages = chatSnapshot.exists() ? Object.keys(chatSnapshot.val()).length : 0
    const recentMessages = 0 // Will be implemented with date filtering

    // Get contacts count from Firebase using Admin SDK
    const contactsRef = database.ref('contacts')
    const contactsSnapshot = await contactsRef.once('value')
    let unreadContacts = 0
    let recentContacts = 0

    if (contactsSnapshot.exists()) {
      const contacts = contactsSnapshot.val()
      Object.values(contacts).forEach((contact: any) => {
        if (!contact.read) {
          unreadContacts++
        }
        // Check if recent (last 7 days)
        const contactDate = new Date(contact.timestamp)
        if (contactDate >= sevenDaysAgo) {
          recentContacts++
        }
      })
    }

    const stats: DashboardStats = {
      totalBlogs,
      totalProjects,
      totalChatMessages,
      unreadContacts,
      recentBlogs,
      recentProjects,
      recentMessages,
      recentContacts
    }

    return stats
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    throw error
  }
}

export const GET = withAdminAuth(async () => {
  try {
    const stats = await getStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics'
      },
      { status: 500 }
    )
  }
})
