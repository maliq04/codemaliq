import { NextResponse } from 'next/server'

import { getAdminDatabase } from '@/lib/firebase-admin'

/**
 * POST /api/blog/[slug]/comments/[commentId]/replies/[replyId]/like
 * Toggle like on a reply
 */
export async function POST(
  request: Request,
  { params }: { params: { slug: string; commentId: string; replyId: string } }
) {
  try {
    const { slug, commentId, replyId } = params

    // Get user IP for simple like tracking (in production, use proper user auth)
    const userIp = request.headers.get('x-forwarded-for') || 'anonymous'
    const likeKey = `${userIp}_${replyId}`

    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const replyRef = database.ref(`blog_comments/${slug}/${commentId}/replies/${replyId}`)
    const likesRef = database.ref(`blog_reply_likes/${slug}/${commentId}/${replyId}/${likeKey}`)

    const [replySnapshot, likeSnapshot] = await Promise.all([replyRef.once('value'), likesRef.once('value')])

    if (!replySnapshot.exists()) {
      return NextResponse.json({ success: false, error: 'Reply not found' }, { status: 404 })
    }

    const reply = replySnapshot.val()
    const hasLiked = likeSnapshot.exists()

    if (hasLiked) {
      // Unlike
      await likesRef.remove()
      const newLikes = Math.max(0, (reply.likes || 0) - 1)
      await replyRef.update({ likes: newLikes })

      return NextResponse.json({
        success: true,
        data: { likes: newLikes, userLiked: false }
      })
    } else {
      // Like
      await likesRef.set(true)
      const newLikes = (reply.likes || 0) + 1
      await replyRef.update({ likes: newLikes })

      return NextResponse.json({
        success: true,
        data: { likes: newLikes, userLiked: true }
      })
    }
  } catch (error) {
    console.error('Error toggling reply like:', error)
    return NextResponse.json({ success: false, error: 'Failed to toggle like' }, { status: 500 })
  }
}
