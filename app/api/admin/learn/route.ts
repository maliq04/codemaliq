import { NextResponse } from 'next/server'
import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { listMDXFiles, readMDXFile, writeMDXFile, deleteMDXFile, generateSlug, ensureUniqueSlug } from '@/lib/fs-utils'
import { createAuditLog } from '@/lib/audit-log'
import fs from 'fs/promises'
import path from 'path'

export const GET = withAdminAuthSession(async () => {
  try {
    const learnDir = path.join(process.cwd(), 'contents/learn')
    const categories = await fs.readdir(learnDir)
    
    const articles: any[] = []
    
    for (const category of categories) {
      const categoryPath = path.join(learnDir, category)
      const stat = await fs.stat(categoryPath)
      
      if (stat.isDirectory()) {
        const files = await listMDXFiles(`contents/learn/${category}`)
        
        for (const file of files) {
          const slug = file.replace(/\.mdx?$/, '')
          const fileData = await readMDXFile(`contents/learn/${category}/${file}`)
          
          if (fileData) {
            articles.push({
              slug,
              category,
              title: fileData.frontmatter.title || slug,
              description: fileData.frontmatter.description || '',
              published: fileData.frontmatter.published !== false,
              content: fileData.content
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: articles
    })
  } catch (error) {
    console.error('Learn articles API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles'
      },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuthSession(async (request, session) => {
  try {
    const body = await request.json()
    const { title, description, content, category, published } = body

    if (!title || !content || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, content, and category are required'
        },
        { status: 400 }
      )
    }

    // Ensure category directory exists
    const categoryDir = path.join(process.cwd(), 'contents/learn', category)
    try {
      await fs.mkdir(categoryDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate slug from title
    const baseSlug = generateSlug(title)
    const slug = await ensureUniqueSlug(baseSlug, `contents/learn/${category}`)

    // Create frontmatter
    const frontmatter = {
      title,
      description: description || '',
      published: published !== false
    }

    // Write MDX file
    const filePath = `contents/learn/${category}/${slug}.mdx`
    const success = await writeMDXFile(filePath, content, frontmatter)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create article'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'create',
      resourceType: 'learn',
      resourceId: `${category}/${slug}`,
      resourceTitle: title
    })

    return NextResponse.json({
      success: true,
      data: {
        slug,
        category,
        message: 'Article created successfully'
      }
    })
  } catch (error) {
    console.error('Learn create API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create article'
      },
      { status: 500 }
    )
  }
})

export const PUT = withAdminAuthSession(async (request, session) => {
  try {
    const body = await request.json()
    const { slug, category, title, description, content, published } = body

    if (!slug || !category || !title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug, category, title, and content are required'
        },
        { status: 400 }
      )
    }

    const frontmatter = {
      title,
      description: description || '',
      published: published !== false
    }

    const filePath = `contents/learn/${category}/${slug}.mdx`
    const success = await writeMDXFile(filePath, content, frontmatter)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update article'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'update',
      resourceType: 'learn',
      resourceId: `${category}/${slug}`,
      resourceTitle: title
    })

    return NextResponse.json({
      success: true,
      data: {
        slug,
        category,
        message: 'Article updated successfully'
      }
    })
  } catch (error) {
    console.error('Learn update API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update article'
      },
      { status: 500 }
    )
  }
})

export const DELETE = withAdminAuthSession(async (request, session) => {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')

    if (!slug || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug and category are required'
        },
        { status: 400 }
      )
    }

    const filePath = `contents/learn/${category}/${slug}.mdx`
    const success = await deleteMDXFile(filePath)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete article'
        },
        { status: 500 }
      )
    }

    await createAuditLog({
      adminEmail: session.user.email!,
      adminName: session.user.name || undefined,
      action: 'delete',
      resourceType: 'learn',
      resourceId: `${category}/${slug}`,
      resourceTitle: slug
    })

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    })
  } catch (error) {
    console.error('Learn delete API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete article'
      },
      { status: 500 }
    )
  }
})
