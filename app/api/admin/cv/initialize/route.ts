import { NextRequest, NextResponse } from 'next/server'

import { realtimeDb } from '@/firebase'
import { ref, set } from 'firebase/database'

export async function POST(request: NextRequest) {
  try {
    // Initialize the profile_settings structure in Firebase
    const profileSettingsRef = ref(realtimeDb, 'profile_settings')

    // Create initial structure
    await set(profileSettingsRef, {
      cv: null, // Will be populated when CV is uploaded
      initialized: true,
      created_at: Date.now()
    })

    return NextResponse.json({
      success: true,
      message: 'Profile settings initialized successfully'
    })
  } catch (error) {
    console.error('Failed to initialize profile settings:', error)
    return NextResponse.json({ success: false, error: 'Failed to initialize profile settings' }, { status: 500 })
  }
}
