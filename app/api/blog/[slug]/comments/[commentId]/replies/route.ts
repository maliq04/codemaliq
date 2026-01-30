import { NextResponse } from 'next/server'

import { getAdminDatabase } from '@/lib/firebase-admin'

/**
 * POST /api/blog/[slug]/comments/[commentId]/replies
 * Add a reply to a comment
 */
export async function POST(request: Request, { params }: { params: { slug: string; commentId: string } }) {
  try {
    const { slug, commentId } = params
    const body = await request.json()
    const { author, email, content } = body

    if (!author || !email || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Check if comment exists
    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const commentRef = database.ref(`blog_comments/${slug}/${commentId}`)
    const commentSnapshot = await commentRef.once('value')

    if (!commentSnapshot.exists()) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    }

    const replyId = Date.now().toString()
    const reply = {
      author: author.trim(),
      email: email.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    }

    const replyRef = database.ref(`blog_comments/${slug}/${commentId}/replies/${replyId}`)
    await replyRef.set(reply)

    return NextResponse.json({
      success: true,
      data: {
        id: replyId,
        ...reply
      }
    })
  } catch (error) {
    console.error('Error adding reply:', error)
    return NextResponse.json({ success: false, error: 'Failed to add reply' }, { status: 500 })
  }
}
