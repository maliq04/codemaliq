import { NextResponse } from 'next/server'
import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { updateContactLink, deleteContactLink } from '@/lib/firestore-contact-links'

export const PUT = withAdminAuthSession(async (request: Request, session: any, context?: { params: any }) => {
  try {
    const { id } = context?.params || {}
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      )
    }
    const body = await request.json()

    // Remove id from update data if present
    const { id: _, ...updateData } = body

    await updateContactLink(id, updateData)

    return NextResponse.json({
      success: true,
      data: {
        id,
        ...updateData
      }
    })
  } catch (error) {
    console.error('Contact links update API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact link'
      },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminAuthSession(async (_request: Request, _session: any, context?: { params: any }) => {
  try {
    const { id } = context?.params || {}
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      )
    }

    await deleteContactLink(id)

    return NextResponse.json({
      success: true,
      message: 'Contact link deleted successfully'
    })
  } catch (error) {
    console.error('Contact links delete API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete contact link'
      },
      { status: 500 }
    )
  }
})