import { NextResponse } from 'next/server'

import { testFirebaseConnection } from '@/lib/firebase-connection-test'

export async function GET() {
  try {
    const result = await testFirebaseConnection()

    return NextResponse.json({
      success: true,
      firebaseConnected: result.success,
      error: result.error,
      details: result.details,
      fallbackMode: !result.success
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      firebaseConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackMode: true
    })
  }
}
