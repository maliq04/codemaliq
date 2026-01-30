import { NextResponse } from 'next/server'

import { options } from '@/app/api/auth/[...nextauth]/options'
import { createAuditLog } from '@/lib/audit-log'
import { getAdminDatabase } from '@/lib/firebase-admin'
import { getServerSession } from 'next-auth'

/**
 * GET /api/admin/uploads/settings
 * Get upload settings
 */
export async function GET() {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.email || session.user.email !== 'maliqalfathir04@gmail.com') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const settingsRef = database.ref('admin/upload_settings')
    const snapshot = await settingsRef.once('value')

    const defaultSettings = {
      maxFileSize: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      logoUrl: '/img/codemaliq.jpg',
      faviconUrl: '/favicon.ico',
      ogImageUrl: '/img/codemaliq.jpg',
      brandName: 'Maliq Al Fathir',
      brandDescription: 'Full Stack Developer & Tech Enthusiast'
    }

    const settings = snapshot.val() || defaultSettings

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching upload settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

/**
 * POST /api/admin/uploads/settings
 * Update upload settings
 */
export async function POST(request: Request) {
  console.log('=== Upload Settings API POST called ===')
  try {
    const session = await getServerSession(options)
    console.log('Session:', session)

    if (!session?.user?.email || session.user.email !== 'maliqalfathir04@gmail.com') {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const database = getAdminDatabase()

    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    }

    const body = await request.json()
    console.log('Request body:', body)

    const { maxFileSize, allowedTypes, logoUrl, faviconUrl, ogImageUrl, brandName, brandDescription } = body

    console.log('Validating settings...')
    // Validate settings
    if (!maxFileSize || maxFileSize < 1 || maxFileSize > 50) {
      console.log('Invalid max file size:', maxFileSize)
      return NextResponse.json({ success: false, error: 'Invalid max file size' }, { status: 400 })
    }

    if (!allowedTypes || !Array.isArray(allowedTypes) || allowedTypes.length === 0) {
      console.log('Invalid allowed types:', allowedTypes)
      return NextResponse.json({ success: false, error: 'Invalid allowed types' }, { status: 400 })
    }

    console.log('Saving settings to Firebase...')
    const settings = {
      maxFileSize,
      allowedTypes,
      logoUrl: logoUrl || '/img/codemaliq.jpg',
      faviconUrl: faviconUrl || '/favicon.ico',
      ogImageUrl: ogImageUrl || '/img/codemaliq.jpg',
      brandName: brandName || 'Maliq Al Fathir',
      brandDescription: brandDescription || 'Full Stack Developer & Tech Enthusiast',
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    }

    const settingsRef = database.ref('admin/upload_settings')
    await settingsRef.set(settings)
    console.log('Settings saved successfully')

    console.log('Creating audit log...')
    // Log admin action
    await createAuditLog({
      adminEmail: session.user.email,
      adminName: session.user.name || 'Admin',
      action: 'update',
      resourceType: 'config',
      resourceId: 'upload_settings',
      resourceTitle: 'Upload Settings'
    })
    console.log('Audit log created')

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error updating upload settings:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
