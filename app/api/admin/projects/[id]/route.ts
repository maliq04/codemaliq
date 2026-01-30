import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { createAuditLog } from '@/lib/audit-log'
import { readJSONFile, writeJSONFile } from '@/lib/fs-utils'

/**
 * GET /api/admin/projects/[id]
 * Get a single project
 */
export const GET = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    const data = await readJSONFile<any>('codemaliq.json')

    if (!data || !data.projects) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
        { status: 404 }
      )
    }

    const project = data.projects.find((p: any) => p.id === parseInt(id))

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Project get API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project'
      },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/admin/projects/[id]
 * Update a project
 */
export const PUT = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    const body = await request.json()
    const { title, slug, description, image, link_demo, link_github, stacks, is_featured, is_show } = body

    const data = await readJSONFile<any>('codemaliq.json')

    if (!data || !data.projects) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
        { status: 404 }
      )
    }

    const projectIndex = data.projects.findIndex((p: any) => p.id === parseInt(id))

    if (projectIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
        { status: 404 }
      )
    }

    data.projects[projectIndex] = {
      ...data.projects[projectIndex],
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      image: image || '',
      link_demo: link_demo || '',
      link_github: link_github || '',
      stacks: stacks || [],
      is_featured: is_featured !== undefined ? is_featured : data.projects[projectIndex].is_featured,
      is_show: is_show !== undefined ? is_show : data.projects[projectIndex].is_show
    }

    const success = await writeJSONFile('codemaliq.json', data)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update project'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'update',
      resourceType: 'project',
      resourceId: id,
      resourceTitle: title
    })

    return NextResponse.json({
      success: true,
      data: data.projects[projectIndex]
    })
  } catch (error) {
    console.error('Project update API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project'
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/admin/projects/[id]
 * Delete a project
 */
export const DELETE = withAdminAuthSession(async (request, session, context) => {
  try {
    const { id } = context?.params || {}
    const data = await readJSONFile<any>('codemaliq.json')

    if (!data || !data.projects) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
        { status: 404 }
      )
    }

    const projectIndex = data.projects.findIndex((p: any) => p.id === parseInt(id))

    if (projectIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found'
        },
        { status: 404 }
      )
    }

    const project = data.projects[projectIndex]
    data.projects.splice(projectIndex, 1)

    const success = await writeJSONFile('codemaliq.json', data)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete project'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'delete',
      resourceType: 'project',
      resourceId: id,
      resourceTitle: project.title
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Project delete API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project'
      },
      { status: 500 }
    )
  }
})
