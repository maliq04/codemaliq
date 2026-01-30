import { NextResponse } from 'next/server'

import { options } from '@/app/api/auth/[...nextauth]/options'
import { createAuditLog } from '@/lib/audit-log'
import { getAdminDatabase } from '@/lib/firebase-admin'
import { getServerSession } from 'next-auth'

/**
 * DELETE /api/admin/uploads/files/[id]
 * Delete an uploaded file
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.email || session.user.email !== 'maliqalfathir04@gmail.com') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    // Get file data before deletion for logging
    const fileRef = database.ref(`admin/uploaded_files/${id}`)
    const snapshot = await fileRef.once('value')
    const fileData = snapshot.val()

    if (!fileData) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 })
    }

    // Delete file from Firebase
    await fileRef.remove()

    // Log admin action
    await createAuditLog({
      adminEmail: session.user.email,
      adminName: session.user.name || 'Admin',
      action: 'delete',
      resourceType: 'media',
      resourceId: id,
      resourceTitle: fileData.name
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 })
  }
}
