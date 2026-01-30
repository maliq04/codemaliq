import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { createAuditLog } from '@/lib/audit-log'
import { readJSONFile, writeJSONFile } from '@/lib/fs-utils'

export const GET = withAdminAuthSession(async () => {
  try {
    const data = await readJSONFile<any>('codemaliq.json')
    return NextResponse.json({
      success: true,
      data: data?.roadmaps || { list: [] }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch roadmap'
      },
      { status: 500 }
    )
  }
})

export const PUT = withAdminAuthSession(async (request, session) => {
  try {
    const body = await request.json()
    const data = await readJSONFile<any>('codemaliq.json')

    data.roadmaps = body

    const success = await writeJSONFile('codemaliq.json', data)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update roadmap'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'update',
      resourceType: 'roadmap',
      resourceId: 'roadmap',
      resourceTitle: 'Roadmap'
    })

    return NextResponse.json({
      success: true,
      data: body
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update roadmap'
      },
      { status: 500 }
    )
  }
})
