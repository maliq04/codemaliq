import { NextResponse } from 'next/server'
import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { uploadToFirebaseDatabase, listFirebaseDatabaseMedia } from '@/lib/firebase-media'
import { createAuditLog } from '@/lib/audit-log'

/**
 * GET /api/admin/media
 * List all media from Firebase Database
 */
export const GET = withAdminAuthSession(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || undefined

    const media = await listFirebaseDatabaseMedia(folder)

    return NextResponse.json({
      success: true,
      data: media
    })
  } catch (error) {
    console.error('Media list API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch media'
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/admin/media
 * Upload media to Firebase Database
 */
export const POST = withAdminAuthSession(async (request, session) => {
  try {
    console.log('Media upload API called')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'uploads'

    console.log('File received:', file?.name, 'Size:', file?.size)

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided'
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only image files are allowed'
        },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB for database storage)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size must be less than 5MB'
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    console.log('Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('Buffer created, size:', buffer.length)

    // Upload to Firebase Database
    console.log('Uploading to Firebase Database...')
    const result = await uploadToFirebaseDatabase(buffer, file.name, folder)

    if (!result) {
      console.error('Upload failed - result is null')
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload image to Firebase Database'
        },
        { status: 500 }
      )
    }

    console.log('Upload successful, ID:', result.id)

    // Create audit log
    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'create',
      resourceType: 'media',
      resourceId: result.id,
      resourceTitle: file.name
    })

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        id: result.id,
        name: result.name,
        size: result.size
      }
    })
  } catch (error) {
    console.error('Media upload API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload media'
      },
      { status: 500 }
    )
  }
})
