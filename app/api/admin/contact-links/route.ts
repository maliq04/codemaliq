import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { addContactLink, getAllContactLinks } from '@/lib/firestore-contact-links'

export const GET = withAdminAuthSession(async () => {
  try {
    const links = await getAllContactLinks()

    return NextResponse.json({
      success: true,
      data: links
    })
  } catch (error) {
    console.error('Contact links list API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contact links'
      },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuthSession(async (request: Request) => {
  try {
    const body = await request.json()
    const { title, description, url, icon, category, isActive, order, bgColor, buttonText } = body

    if (!title || !url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and URL are required'
        },
        { status: 400 }
      )
    }

    const linkData = {
      title: title.trim(),
      description: description?.trim() || '',
      url: url.trim(),
      icon: icon || 'github',
      category: category || 'professional',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 1,
      bgColor: bgColor || 'bg-slate-900',
      buttonText: buttonText || 'Go to Link'
    }

    const id = await addContactLink(linkData)

    return NextResponse.json({
      success: true,
      data: {
        id,
        ...linkData
      }
    })
  } catch (error) {
    console.error('Contact links create API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact link'
      },
      { status: 500 }
    )
  }
})
