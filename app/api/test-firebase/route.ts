import { NextResponse } from 'next/server'
import { testFirebaseConnection } from '@/lib/firebase-utils'

export async function GET() {
  try {
    const result = await testFirebaseConnection()
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: 'Firebase Admin SDK is configured correctly!',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Firebase connection failed',
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Firebase connection',
      error: errorMessage
    }, { status: 500 })
  }
}