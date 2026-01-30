import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { createAuditLog } from '@/lib/audit-log'
import { ensureUniqueSlug, generateSlug, listMDXFiles, readMDXFile, writeMDXFile } from '@/lib/fs-utils'

import type { BlogPost } from '@/common/types/admin'

/**
 * GET /api/admin/blog
 * List all blog posts
 */
export const GET = withAdminAuthSession(async () => {
  try {
    const blogFiles = await listMDXFiles('contents/blog')
    const posts: BlogPost[] = []

    for (const file of blogFiles) {
      const slug = file.replace(/\.mdx?$/, '')
      const filePath = `contents/blog/${file}`
      const fileData = await readMDXFile(filePath)

      if (fileData) {
        posts.push({
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
        })
      }
    }

    // Sort by date, newest first
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      data: posts
    })
  } catch (error) {
    console.error('Blog list API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts'
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/admin/blog
 * Create a new blog post
 */
export const POST = withAdminAuthSession(async (request, session) => {
  try {
    const body = await request.json()
    const { title, description, image, tags, content, published, category, postType, devtoId } = body

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

    // Validate dev.to post requirements
    if (postType === 'devto' && !devtoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dev.to Post ID is required for dev.to posts'
        },
        { status: 400 }
      )
    }

    // Generate slug from title
    const baseSlug = generateSlug(title)
    const slug = await ensureUniqueSlug(baseSlug, 'contents/blog')

    // Create frontmatter
    const frontmatter = {
      title,
      description: description || '',
      date: new Date().toISOString(),
      image: image || '',
      tags: tags || [],
      published: published !== false,
      author: session.user.name || session.user.email,
      category: category || 'all',
      postType: postType || 'local',
      ...(postType === 'devto' && devtoId && { devtoId })
    }

    // Write MDX file
    const filePath = `contents/blog/${slug}.mdx`
    const success = await writeMDXFile(filePath, content, frontmatter)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create blog post'
        },
        { status: 500 }
      )
    }

    // Revalidate blog pages to show new content
    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)

    // Create audit log
    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'create',
      resourceType: 'blog',
      resourceId: slug,
      resourceTitle: title,
      changes: { postType: postType || 'local', ...(devtoId && { devtoId }) }
    })

    return NextResponse.json({
      success: true,
      data: {
        slug,
        postType: postType || 'local',
        message: `${postType === 'devto' ? 'Dev.to' : 'Local'} blog post created successfully`
      }
    })
  } catch (error) {
    console.error('Blog create API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create blog post'
      },
      { status: 500 }
    )
  }
})
