import { db } from '@/firebase'
import { collection, doc, getDoc, getDocs, limit, query } from 'firebase/firestore'

export async function testFirebaseConnection(): Promise<{
  success: boolean
  error?: string
  details?: any
}> {
  try {
    console.log('Testing Firebase connection...')

    // Test 1: Try to read from a simple collection
    const testQuery = query(collection(db, 'test'), limit(1))
    const snapshot = await getDocs(testQuery)

    console.log('Firebase connection test successful')
    return {
      success: true,
      details: {
        canConnect: true,
        docsCount: snapshot.size
      }
    }
  } catch (error: any) {
    console.error('Firebase connection test failed:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
      details: {
        code: error.code,
        message: error.message
      }
    }
  }
}

export async function initializeFirestoreWithFallback() {
  const connectionTest = await testFirebaseConnection()

  if (!connectionTest.success) {
    console.warn('Firestore connection failed, using fallback mode')
    return false
  }

  return true
}
