import { NextResponse } from 'next/server'

import { withAdminAuth } from '@/lib/api/admin-middleware'
import { getAuditLogs } from '@/lib/audit-log'

export const GET = withAdminAuth(async request => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const logs = await getAuditLogs(limit)

    return NextResponse.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Audit log API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit logs'
      },
      { status: 500 }
    )
  }
})
