import { storage } from '@/lib/firebase-admin'

export interface FirebaseUploadResult {
  url: string
  path: string
  name: string
  size: number
  contentType: string
  created: string
}

/**
 * Upload a file to Firebase Storage
 * @param file - File buffer
 * @param fileName - Name for the file
 * @param folder - Folder path in storage
 */
export async function uploadToFirebaseStorage(
  file: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<FirebaseUploadResult | null> {
  try {
    console.log('Starting Firebase Storage upload...')
    console.log('File name:', fileName)
    console.log('Folder:', folder)
    console.log('Storage bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    
    const bucket = storage.bucket()
    console.log('Bucket obtained:', bucket.name)
    
    const filePath = `${folder}/${Date.now()}-${fileName}`
    console.log('File path:', filePath)
    
    const fileUpload = bucket.file(filePath)

    // Upload the file
    await fileUpload.save(file, {
      metadata: {
        contentType: 'image/jpeg', // Will be detected automatically
      },
      public: true,
    })
    console.log('File uploaded successfully')

    // Make the file publicly accessible
    await fileUpload.makePublic()
    console.log('File made public')

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`
    console.log('Public URL:', publicUrl)

    const [metadata] = await fileUpload.getMetadata()

    return {
      url: publicUrl,
      path: filePath,
      name: fileName,
      size: parseInt(String(metadata.size || '0')),
      contentType: metadata.contentType || 'image/jpeg',
      created: String(metadata.timeCreated || new Date().toISOString())
    }
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return null
  }
}

/**
 * Delete a file from Firebase Storage
 * @param filePath - The path of the file to delete
 */
export async function deleteFromFirebaseStorage(filePath: string): Promise<boolean> {
  try {
    const bucket = storage.bucket()
    const file = bucket.file(filePath)
    await file.delete()
    return true
  } catch (error) {
    console.error('Error deleting from Firebase Storage:', error)
    return false
  }
}

/**
 * List files from Firebase Storage
 * @param folder - Folder to list files from
 */
export async function listFirebaseStorageFiles(folder: string = 'uploads'): Promise<FirebaseUploadResult[]> {
  try {
    const bucket = storage.bucket()
    const [files] = await bucket.getFiles({ prefix: folder })

    const fileList: FirebaseUploadResult[] = []

    for (const file of files) {
      const [metadata] = await file.getMetadata()
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`

      fileList.push({
        url: publicUrl,
        path: file.name,
        name: file.name.split('/').pop() || file.name,
        size: parseInt(String(metadata.size || '0')),
        contentType: metadata.contentType || 'image/jpeg',
        created: String(metadata.timeCreated || new Date().toISOString())
      })
    }

    return fileList
  } catch (error) {
    console.error('Error listing Firebase Storage files:', error)
    return []
  }
}

/**
 * Get file URL from Firebase Storage
 * @param filePath - Path to the file
 */
export function getFirebaseStorageUrl(filePath: string): string {
  const bucket = storage.bucket()
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`
}
