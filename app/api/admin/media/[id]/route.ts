import { NextResponse } from 'next/server'
import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { deleteFromFirebaseDatabase, getFirebaseDatabaseMedia } from '@/lib/firebase-media'
import { createAuditLog } from '@/lib/audit-log'

/**
 * DELETE /api/admin/media/[id]
 * Delete media from Firebase Database
 */
export const DELETE = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Media ID is required'
        },
        { status: 400 }
      )
    }

    // Get media info before deleting (for audit log)
    const mediaItem = await getFirebaseDatabaseMedia(id)

    // Delete from Firebase Database
    const success = await deleteFromFirebaseDatabase(id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete media'
        },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'delete',
      resourceType: 'media',
      resourceId: id,
      resourceTitle: mediaItem?.name || id
    })

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    })
  } catch (error) {
    console.error('Media delete API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete media'
      },
      { status: 500 }
    )
  }
})
