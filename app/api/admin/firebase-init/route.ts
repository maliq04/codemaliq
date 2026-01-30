import { NextRequest, NextResponse } from 'next/server'

import { FirebaseSocialLinksService } from '@/lib/firebase-social-links'

export async function POST(request: NextRequest) {
  try {
    // Initialize the Firebase database with default data
    await FirebaseSocialLinksService.initializeDatabase()

    return NextResponse.json({
      success: true,
      message: 'Firebase database initialized successfully'
    })
  } catch (error) {
    console.error('Failed to initialize Firebase database:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
