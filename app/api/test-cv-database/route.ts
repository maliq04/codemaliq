import { NextRequest, NextResponse } from 'next/server'
import { ref, set, get } from 'firebase/database'
import { realtimeDb } from '@/firebase'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing CV database connection...')
    
    // Test write to profile_settings/cv
    const testData = {
      test: true,
      timestamp: Date.now(),
      message: 'CV database test'
    }
    
    const cvRef = ref(realtimeDb, 'profile_settings/cv_test')
    await set(cvRef, testData)
    
    console.log('Write test successful')
    
    // Test read
    const snapshot = await get(cvRef)
    const readData = snapshot.val()
    
    console.log('Read test successful:', readData)
    
    return NextResponse.json({ 
      success: true, 
      message: 'CV database connection working',
      testData: readData
    })
  } catch (error) {
    console.error('CV database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}