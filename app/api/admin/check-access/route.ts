import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { options } from '@/app/api/auth/[...nextauth]/options'

/**
 * GET /api/admin/check-access
 * Check if the current user has admin access
 */
export async function GET() {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        isAdmin: false,
        email: null,
        error: 'Not authenticated'
      })
    }

    // Check if user is admin (only maliqalfathir04@gmail.com)
    const isAdmin = session.user.email === 'maliqalfathir04@gmail.com'
    
    return NextResponse.json({
      isAdmin,
      email: session.user.email,
      name: session.user.name
    })
  } catch (error) {
    console.error('Error checking admin access:', error)
    return NextResponse.json(
      {
        isAdmin: false,
        email: null,
        error: 'Failed to check access'
      },
      { status: 500 }
    )
  }
}