import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { createAuditLog } from '@/lib/audit-log'
import { getAdminDatabase } from '@/lib/firebase-admin'

export const DELETE = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    const database = getAdminDatabase()
    
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }
    
    const chatRef = database.ref(`chat/${id}`)

    const snapshot = await chatRef.once('value')
    const message = snapshot.val()

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message not found'
        },
        { status: 404 }
      )
    }

    await chatRef.remove()

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'delete',
      resourceType: 'chat',
      resourceId: id,
      resourceTitle: `Message from ${message.name}`
    })

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    console.error('Chat delete API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete message'
      },
      { status: 500 }
    )
  }
})

export const PUT = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    const body = await request.json()
    const { is_show, flagged } = body

    const database = getAdminDatabase()
    
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }

    const chatRef = database.ref(`chat/${id}`)
    const snapshot = await chatRef.once('value')

    if (!snapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message not found'
        },
        { status: 404 }
      )
    }

    const updates: any = {}
    if (is_show !== undefined) updates.is_show = is_show
    if (flagged !== undefined) updates.flagged = flagged

    await chatRef.update(updates)

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'update',
      resourceType: 'chat',
      resourceId: id,
      resourceTitle: 'Chat message'
    })

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully'
    })
  } catch (error) {
    console.error('Chat update API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update message'
      },
      { status: 500 }
    )
  }
})
