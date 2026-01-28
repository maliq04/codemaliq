import { NextResponse } from 'next/server'
import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { database } from '@/lib/firebase-admin'
import { createAuditLog } from '@/lib/audit-log'

export const DELETE = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    await database.ref(`contacts/${id}`).remove()

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'delete',
      resourceType: 'contact',
      resourceId: id,
      resourceTitle: 'Contact message'
    })

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete contact'
      },
      { status: 500 }
    )
  }
})

export const PUT = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    const body = await request.json()
    
    await database.ref(`contacts/${id}`).update({
      read: body.read !== undefined ? body.read : true
    })

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update contact'
      },
      { status: 500 }
    )
  }
})
