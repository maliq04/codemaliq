import { NextResponse } from 'next/server'
import { getActiveContactLinks } from '@/lib/firestore-contact-links'

export async function GET() {
  try {
    const links = await getActiveContactLinks()

    return NextResponse.json({
      success: true,
      data: links
    })
  } catch (error) {
    console.error('Public contact links API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contact links'
      },
      { status: 500 }
    )
  }
}