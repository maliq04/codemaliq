import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { initializeDefaultContactLinks } from '@/lib/firestore-contact-links'

export const POST = withAdminAuthSession(async () => {
  try {
    const links = await initializeDefaultContactLinks()

    return NextResponse.json({
      success: true,
      data: links
    })
  } catch (error) {
    console.error('Contact links initialize API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize contact links'
      },
      { status: 500 }
    )
  }
})
