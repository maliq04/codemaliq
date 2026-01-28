import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase-admin'
import { createAuditLog } from '@/lib/audit-log'
import { getServerSession } from 'next-auth'
import { options } from '@/app/api/auth/[...nextauth]/options'

/**
 * GET /api/admin/uploads/files
 * Get uploaded files list
 */
export async function GET() {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.email || session.user.email !== 'maliqalfathir04@gmail.com') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const filesRef = database.ref('admin/uploaded_files')
    const snapshot = await filesRef.once('value')
    
    const filesData = snapshot.val() || {}
    const files = Object.entries(filesData).map(([id, data]: [string, any]) => ({
      id,
      ...data
    })).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    
    return NextResponse.json({
      success: true,
      data: files
    })
  } catch (error) {
    console.error('Error fetching uploaded files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/uploads/files
 * Upload a new file
 */
export async function POST(request: Request) {
  console.log('=== Upload API POST called ===')
  try {
    const session = await getServerSession(options)
    console.log('Session:', session)
    console.log('User email:', session?.user?.email)
    
    if (!session?.user?.email || session.user.email !== 'maliqalfathir04@gmail.com') {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('File received:', file?.name, file?.size, file?.type)

    // Get upload settings
    console.log('Getting upload settings...')
    const settingsRef = database.ref('admin/upload_settings')
    const settingsSnapshot = await settingsRef.once('value')
    const settings = settingsSnapshot.val() || {
      maxFileSize: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
    console.log('Settings:', settings)

    // Validate file size
    const maxSizeBytes = settings.maxFileSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: `File size exceeds ${settings.maxFileSize}MB limit` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!settings.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      )
    }

    console.log('Converting file to base64...')
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`
    console.log('Base64 conversion complete, length:', base64.length)

    // Generate unique ID
    const fileId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    console.log('Generated file ID:', fileId)
    
    console.log('Storing file in Firebase...')
    // Store file data in Firebase
    const fileData = {
      name: file.name,
      url: dataUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.user.email
    }

    const fileRef = database.ref(`admin/uploaded_files/${fileId}`)
    await fileRef.set(fileData)
    console.log('File stored successfully')

    console.log('Creating audit log...')
    // Log admin action
    await createAuditLog({
      adminEmail: session.user.email,
      adminName: session.user.name || 'Admin',
      action: 'create',
      resourceType: 'media',
      resourceId: fileId,
      resourceTitle: file.name
    })
    console.log('Audit log created')

    console.log('Upload complete, returning response')
    return NextResponse.json({
      success: true,
      data: {
        id: fileId,
        ...fileData
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { success: false, error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}