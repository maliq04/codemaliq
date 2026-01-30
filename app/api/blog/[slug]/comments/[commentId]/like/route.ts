import { NextResponse } from 'next/server'

import { getAdminDatabase } from '@/lib/firebase-admin'

/**
 * POST /api/blog/[slug]/comments/[commentId]/like
 * Toggle like on a comment
 */
export async function POST(request: Request, { params }: { params: { slug: string; commentId: string } }) {
  try {
    const { slug, commentId } = params

    // Get user IP for simple like tracking (in production, use proper user auth)
    const userIp = request.headers.get('x-forwarded-for') || 'anonymous'
    const likeKey = `${userIp}_${commentId}`

    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const commentRef = database.ref(`blog_comments/${slug}/${commentId}`)
    const likesRef = database.ref(`blog_comment_likes/${slug}/${commentId}/${likeKey}`)

    const [commentSnapshot, likeSnapshot] = await Promise.all([commentRef.once('value'), likesRef.once('value')])

    if (!commentSnapshot.exists()) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    }

    const comment = commentSnapshot.val()
    const hasLiked = likeSnapshot.exists()

    if (hasLiked) {
      // Unlike
      await likesRef.remove()
      const newLikes = Math.max(0, (comment.likes || 0) - 1)
      await commentRef.update({ likes: newLikes })

      return NextResponse.json({
        success: true,
        data: { likes: newLikes, userLiked: false }
      })
    } else {
      // Like
      await likesRef.set(true)
      const newLikes = (comment.likes || 0) + 1
      await commentRef.update({ likes: newLikes })

      return NextResponse.json({
        success: true,
        data: { likes: newLikes, userLiked: true }
      })
    }
  } catch (error) {
    console.error('Error toggling comment like:', error)
    return NextResponse.json({ success: false, error: 'Failed to toggle like' }, { status: 500 })
  }
}
