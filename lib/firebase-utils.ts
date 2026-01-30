import { getAdminDb } from './firebase-admin'

// Example function to test Firebase Admin connection
export async function testFirebaseConnection() {
  try {
    const adminDb = getAdminDb()

    if (!adminDb) {
      return { success: false, error: 'Firebase Admin not available' }
    }

    // Try to access Firestore
    const testCollection = adminDb.collection('test')
    const snapshot = await testCollection.limit(1).get()

    console.log('✅ Firebase Admin SDK connected successfully!')
    console.log(`📊 Test collection size: ${snapshot.size}`)

    return { success: true, message: 'Firebase connection successful' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Firebase Admin SDK connection failed:', error)
    return { success: false, error: errorMessage }
  }
}

// Example function to create a document
export async function createDocument(collection: string, data: any) {
  try {
    const adminDb = getAdminDb()

    if (!adminDb) {
      return { success: false, error: 'Firebase Admin not available' }
    }

    const docRef = await adminDb.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log(`✅ Document created with ID: ${docRef.id}`)
    return { success: true, id: docRef.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error creating document:', error)
    return { success: false, error: errorMessage }
  }
}

// Example function to get documents
export async function getDocuments(collection: string, limit = 10) {
  try {
    const adminDb = getAdminDb()

    if (!adminDb) {
      return { success: false, error: 'Firebase Admin not available' }
    }

    const snapshot = await adminDb.collection(collection).limit(limit).get()
    const documents = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log(`✅ Retrieved ${documents.length} documents from ${collection}`)
    return { success: true, documents }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error getting documents:', error)
    return { success: false, error: errorMessage }
  }
}
