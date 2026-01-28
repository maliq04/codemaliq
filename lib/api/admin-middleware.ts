import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'

/**
 * Higher-order function to protect API routes with admin authentication
 * 
 * Usage:
 * export const GET = withAdminAuth(async (request, session) => {
 *   // Your API logic here
 *   return NextResponse.json({ data: 'protected data' })
 * })
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: Request, ...args: T) => Promise<NextResponse>
) {
  return async (request: Request, ...args: T): Promise<NextResponse> => {
    try {
      // Check if user is authenticated and is an admin
      const session = await getAdminSession()

      if (!session) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'You must be signed in as an admin to access this resource'
          },
          { status: 401 }
        )
      }

      // User is authenticated and is admin, proceed with the handler
      return await handler(request, ...args)
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'An error occurred while processing your request'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware variant that passes the session to the handler
 * 
 * Usage:
 * export const GET = withAdminAuthSession(async (request, session, context) => {
 *   const adminEmail = session.user.email
 *   const { params } = context
 *   // Your API logic here
 * })
 */
export function withAdminAuthSession(
  handler: (
    request: Request, 
    session: NonNullable<Awaited<ReturnType<typeof getAdminSession>>>,
    context?: { params: any }
  ) => Promise<NextResponse>
) {
  return async (request: Request, context?: { params: any }): Promise<NextResponse> => {
    try {
      const session = await getAdminSession()

      if (!session) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'You must be signed in as an admin to access this resource'
          },
          { status: 401 }
        )
      }

      // Pass session and context to handler
      return await handler(request, session, context)
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'An error occurred while processing your request'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to create standardized error responses
 */
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      error: true,
      message
    },
    { status }
  )
}

/**
 * Helper to create standardized success responses
 */
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data
    },
    { status }
  )
}
