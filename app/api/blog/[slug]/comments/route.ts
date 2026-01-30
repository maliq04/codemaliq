import { NextResponse } from 'next/server'

import { getAdminDatabase } from '@/lib/firebase-admin'

/**
 * GET /api/blog/[slug]/comments
 * Get all comments for a blog post
 */
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const commentsRef = database.ref(`blog_comments/${slug}`)
    const snapshot = await commentsRef.once('value')

    const commentsData = snapshot.val() || {}
    const comments = Object.keys(commentsData)
      .map(id => ({
        id,
        ...commentsData[id],
        replies: commentsData[id].replies
          ? Object.keys(commentsData[id].replies).map(replyId => ({
              id: replyId,
              ...commentsData[id].replies[replyId]
            }))
          : []
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 })
  }
}

/**
 * POST /api/blog/[slug]/comments
 * Add a new comment to a blog post
 */
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const body = await request.json()
    const { author, email, content } = body

    if (!author || !email || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const commentId = Date.now().toString()
    const comment = {
      author: author.trim(),
      email: email.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: {}
    }

    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const commentRef = database.ref(`blog_comments/${slug}/${commentId}`)
    await commentRef.set(comment)

    // Update comment count in stats
    const statsRef = database.ref(`blog_stats/${slug}`)
    const statsSnapshot = await statsRef.once('value')
    const currentStats = statsSnapshot.val() || { views: 0, likes: 0, comments: 0, shares: 0, bookmarks: 0 }
    currentStats.comments += 1
    await statsRef.set(currentStats)

    return NextResponse.json({
      success: true,
      data: {
        id: commentId,
        ...comment,
        replies: []
      }
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 })
  }
}
