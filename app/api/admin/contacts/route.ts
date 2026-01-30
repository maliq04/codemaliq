import { NextResponse } from 'next/server'

import { withAdminAuthSession } from '@/lib/api/admin-middleware'
import { getAdminDatabase } from '@/lib/firebase-admin'

export const GET = withAdminAuthSession(async () => {
  try {
    const database = getAdminDatabase();
    
    if (!database) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }
    
    const contactsRef = database.ref('contacts')
    const snapshot = await contactsRef.once('value')
    const data = snapshot.val()

    if (!data) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const contacts = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value
    }))

    contacts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: contacts
    })
  } catch (error) {
    console.error('Contacts list API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contacts'
      },
      { status: 500 }
    )
  }
})
