import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { createAuditLog } from '@/lib/audit-log'
import { deleteMDXFile, readMDXFile, writeMDXFile } from '@/lib/fs-utils'

import type { BlogPost } from '@/common/types/admin'

/**
 * GET /api/admin/blog/[slug]
 * Get a single blog post by slug
 */
export const GET = withAdminAuthSession(async (request, session, context) => {
  try {
    const { slug } = context?.params || {}

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug is required'
        },
        { status: 400 }
      )
    }

    const filePath = `contents/blog/${slug}.mdx`
    const fileData = await readMDXFile(filePath)

    if (!fileData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      )
    }

    const post: BlogPost = {
      slug,
      title: fileData.frontmatter.title || slug,
      description: fileData.frontmatter.description || '',
      date: fileData.frontmatter.date || new Date().toISOString(),
      image: fileData.frontmatter.image || '',
      tags: fileData.frontmatter.tags || [],
      content: fileData.content,
      published: fileData.frontmatter.published !== false,
      author: fileData.frontmatter.author,
      readTime: fileData.frontmatter.readTime,
      category: fileData.frontmatter.category || 'all'
    }

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Blog get API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog post'
      },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/admin/blog/[slug]
 * Update an existing blog post
 */
export const PUT = withAdminAuthSession(async (request, session, context) => {
  try {
    const { slug } = context?.params || {}
    const body = await request.json()
    const { title, description, image, tags, content, published, category } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and content are required'
        },
        { status: 400 }
      )
    }

    // Check if blog post exists
    const filePath = `contents/blog/${slug}.mdx`
    const existingData = await readMDXFile(filePath)

    if (!existingData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      )
    }

    // Update frontmatter (preserve date, update other fields)
    const frontmatter = {
      ...existingData.frontmatter,
      title,
      description: description || '',
      image: image || '',
      tags: tags || [],
      published: published !== false,
      category: category || 'all',
      updatedAt: new Date().toISOString()
    }

    // Write updated MDX file
    const success = await writeMDXFile(filePath, content, frontmatter)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update blog post'
        },
        { status: 500 }
      )
    }

    // Revalidate blog pages to show updated content
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)

    // Create audit log
    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'update',
      resourceType: 'blog',
      resourceId: slug,
      resourceTitle: title
    })

    return NextResponse.json({
      success: true,
      data: {
        slug,
        message: 'Blog post updated successfully'
      }
    })
  } catch (error) {
    console.error('Blog update API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update blog post'
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/admin/blog/[slug]
 * Delete a blog post
 */
export const DELETE = withAdminAuthSession(async (request, session, context) => {
  try {
    const { slug } = context?.params || {}

    // Check if blog post exists
    const filePath = `contents/blog/${slug}.mdx`
    const existingData = await readMDXFile(filePath)

    if (!existingData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found'
        },
        { status: 404 }
      )
    }

    // Delete MDX file
    const success = await deleteMDXFile(filePath)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete blog post'
        },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'delete',
      resourceType: 'blog',
      resourceId: slug,
      resourceTitle: existingData.frontmatter.title || slug
    })

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Blog delete API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete blog post'
      },
      { status: 500 }
    )
  }
})
