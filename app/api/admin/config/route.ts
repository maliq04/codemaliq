import { NextResponse } from 'next/server'
import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { readJSONFile, writeJSONFile } from '@/lib/fs-utils'
import { createAuditLog } from '@/lib/audit-log'

export const GET = withAdminAuthSession(async () => {
  try {
    const data = await readJSONFile<any>('codemaliq.json')
    return NextResponse.json({
      success: true,
      data: data || {}
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch configuration'
      },
      { status: 500 }
    )
  }
})

export const PUT = withAdminAuthSession(async (request, session) => {
  try {
    const body = await request.json()
    const data = await readJSONFile<any>('codemaliq.json')

    const updatedData = {
      ...data,
      ...body
    }

    const success = await writeJSONFile('codemaliq.json', updatedData)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update configuration'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'update',
      resourceType: 'config',
      resourceId: 'site-config',
      resourceTitle: 'Site Configuration'
    })

    return NextResponse.json({
      success: true,
      data: updatedData
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update configuration'
      },
      { status: 500 }
    )
  }
})
