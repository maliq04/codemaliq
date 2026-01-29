import { ServiceAccount, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getDatabase } from 'firebase-admin/database'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

let app: any = null
let adminDb: any = null
let adminAuth: any = null
let database: any = null
let storage: any = null

// Lazy initialization function
function initializeFirebaseAdmin() {
  if (app) return app

  try {
    // Check if required environment variables are available
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('Firebase Admin SDK environment variables not configured')
      return null
    }

    // Firebase Admin SDK configuration
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }

    // Initialize Firebase Admin SDK
    app = !getApps().length
      ? initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        })
      : getApps()[0]

    // Initialize services
    adminDb = getFirestore(app)
    adminAuth = getAuth(app)
    database = getDatabase(app)
    storage = getStorage(app)

    return app
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error)
    return null
  }
}

// Getter functions that initialize on demand
export function getAdminDb() {
  if (!adminDb) {
    initializeFirebaseAdmin()
  }
  return adminDb
}

export function getAdminAuth() {
  if (!adminAuth) {
    initializeFirebaseAdmin()
  }
  return adminAuth
}

export function getAdminDatabase() {
  if (!database) {
    initializeFirebaseAdmin()
  }
  return database
}

export function getAdminStorage() {
  if (!storage) {
    initializeFirebaseAdmin()
  }
  return storage
}

export function getFirebaseApp() {
  if (!app) {
    initializeFirebaseAdmin()
  }
  return app
}

// Legacy exports for backward compatibility
export { getAdminDb as adminDb, getAdminAuth as adminAuth, getAdminDatabase as database, getAdminStorage as storage }
export default getFirebaseApp
