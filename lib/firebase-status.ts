import { realtimeDb, db, auth } from '@/firebase'

export interface FirebaseStatus {
  auth: boolean
  firestore: boolean
  realtimeDatabase: boolean
  overall: boolean
  errors: string[]
}

export async function checkFirebaseStatus(): Promise<FirebaseStatus> {
  const status: FirebaseStatus = {
    auth: false,
    firestore: false,
    realtimeDatabase: false,
    overall: false,
    errors: []
  }

  // Check Firebase Auth
  try {
    if (auth) {
      status.auth = true
    } else {
      status.errors.push('Firebase Auth not initialized')
    }
  } catch (error) {
    status.errors.push(`Firebase Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Check Firestore
  try {
    if (db) {
      status.firestore = true
    } else {
      status.errors.push('Firestore not initialized')
    }
  } catch (error) {
    status.errors.push(`Firestore error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Check Realtime Database
  try {
    if (realtimeDb) {
      status.realtimeDatabase = true
    } else {
      status.errors.push('Realtime Database not initialized')
    }
  } catch (error) {
    status.errors.push(`Realtime Database error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Overall status
  status.overall = status.auth && (status.firestore || status.realtimeDatabase)

  return status
}

export function getFirebaseConfigStatus() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  return {
    isComplete: missingVars.length === 0,
    missingVars,
    hasRealtimeDb: !!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  }
}