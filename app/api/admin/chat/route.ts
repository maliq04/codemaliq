import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { getAdminDatabase } from '@/lib/firebase-admin'

export const GET = withAdminAuthSession(async () => {
  try {
    const database = getAdminDatabase()
    
    if (!database) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }
    
    const chatRef = database.ref('chat')
    const snapshot = await chatRef.once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const messages = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value
    }))

    messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      success: true,
      data: messages
    })
  } catch (error) {
    console.error('Chat list API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages'
      },
      { status: 500 }
    )
  }
})
