import { NextResponse } from 'next/server'

import { getAdminDatabase } from '@/lib/firebase-admin'

/**
 * GET /api/blog/[slug]/stats
 * Get blog post statistics (views, likes, comments, shares)
 */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const database = getAdminDatabase()
    
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }
    
    const statsRef = database.ref(`blog_stats/${slug}`)
    const snapshot = await statsRef.once('value')

    const stats = snapshot.val() || {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching blog stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}

/**
 * POST /api/blog/[slug]/stats
 * Update blog post statistics
 */
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const body = await request.json()
    const { action } = body // 'view', 'like', 'unlike', 'comment', 'share'

    const database = getAdminDatabase()
    
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const statsRef = database.ref(`blog_stats/${slug}`)
    const snapshot = await statsRef.once('value')
    const currentStats = snapshot.val() || {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0
    }

    switch (action) {
      case 'view':
        currentStats.views += 1
        break
      case 'like':
        currentStats.likes += 1
        break
      case 'unlike':
        currentStats.likes = Math.max(0, currentStats.likes - 1)
        break
      case 'comment':
        currentStats.comments += 1
        break
      case 'share':
        currentStats.shares += 1
        break
      case 'bookmark':
        currentStats.bookmarks += 1
        break
      case 'unbookmark':
        currentStats.bookmarks = Math.max(0, currentStats.bookmarks - 1)
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    await statsRef.set(currentStats)

    return NextResponse.json({
      success: true,
      data: currentStats
    })
  } catch (error) {
    console.error('Error updating blog stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to update stats' }, { status: 500 })
  }
}
