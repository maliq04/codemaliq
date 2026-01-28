import { NextResponse } from 'next/server'
import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { readJSONFile, writeJSONFile } from '@/lib/fs-utils'
import { createAuditLog } from '@/lib/audit-log'

/**
 * GET /api/admin/projects
 * List all projects
 */
export const GET = withAdminAuthSession(async () => {
  try {
    const data = await readJSONFile<any>('codemaliq.json')

    if (!data || !data.projects) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    return NextResponse.json({
      success: true,
      data: data.projects
    })
  } catch (error) {
    console.error('Projects list API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects'
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/admin/projects
 * Create a new project
 */
export const POST = withAdminAuthSession(async (request, session) => {
  try {
    const body = await request.json()
    const { title, slug, description, image, link_demo, link_github, stacks, is_featured } = body

    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and description are required'
        },
        { status: 400 }
      )
    }

    const data = await readJSONFile<any>('codemaliq.json')

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to read configuration'
        },
        { status: 500 }
      )
    }

    // Generate new ID
    const maxId = data.projects?.length > 0 
      ? Math.max(...data.projects.map((p: any) => p.id || 0))
      : 0
    const newId = maxId + 1

    const newProject = {
      id: newId,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      image: image || '',
      link_demo: link_demo || '',
      link_github: link_github || '',
      stacks: stacks || [],
      is_show: true,
      is_featured: is_featured || false
    }

    data.projects = data.projects || []
    data.projects.push(newProject)

    const success = await writeJSONFile('codemaliq.json', data)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create project'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'create',
      resourceType: 'project',
      resourceId: newId.toString(),
      resourceTitle: title
    })

    return NextResponse.json({
      success: true,
      data: newProject
    })
  } catch (error) {
    console.error('Project create API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project'
      },
      { status: 500 }
    )
  }
})
