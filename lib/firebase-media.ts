import { database } from '@/lib/firebase-admin'

export interface MediaItem {
  id: string
  name: string
  url: string
  size: number
  contentType: string
  created: string
  folder: string
}

/**
 * Upload image to Firebase Database (as base64)
 * @param file - File buffer
 * @param fileName - Name for the file
 * @param folder - Folder/category
 */
export async function uploadToFirebaseDatabase(
  file: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<MediaItem | null> {
  try {
    const mediaRef = database.ref('media')
    
    // Convert buffer to base64
    const base64Data = file.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64Data}`
    
    // Create media item
    const mediaItem: Omit<MediaItem, 'id'> = {
      name: fileName,
      url: dataUrl,
      size: file.length,
      contentType: 'image/jpeg',
      created: new Date().toISOString(),
      folder
    }
    
    // Push to database
    const newMediaRef = await mediaRef.push(mediaItem)
    
    return {
      id: newMediaRef.key!,
      ...mediaItem
    }
  } catch (error) {
    console.error('Error uploading to Firebase Database:', error)
    return null
  }
}

/**
 * Delete media from Firebase Database
 * @param mediaId - The ID of the media to delete
 */
export async function deleteFromFirebaseDatabase(mediaId: string): Promise<boolean> {
  try {
    const mediaRef = database.ref(`media/${mediaId}`)
    await mediaRef.remove()
    return true
  } catch (error) {
    console.error('Error deleting from Firebase Database:', error)
    return false
  }
}

/**
 * List all media from Firebase Database
 * @param folder - Optional folder to filter by
 */
export async function listFirebaseDatabaseMedia(folder?: string): Promise<MediaItem[]> {
  try {
    const mediaRef = database.ref('media')
    const snapshot = await mediaRef.once('value')
    
    if (!snapshot.exists()) {
      return []
    }
    
    const mediaList: MediaItem[] = []
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val()
      if (!folder || data.folder === folder) {
        mediaList.push({
          id: childSnapshot.key!,
          ...data
        })
      }
      return false // Continue iteration
    })
    
    // Sort by created date, newest first
    mediaList.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    
    return mediaList
  } catch (error) {
    console.error('Error listing Firebase Database media:', error)
    return []
  }
}

/**
 * Get a single media item
 * @param mediaId - The ID of the media
 */
export async function getFirebaseDatabaseMedia(mediaId: string): Promise<MediaItem | null> {
  try {
    const mediaRef = database.ref(`media/${mediaId}`)
    const snapshot = await mediaRef.once('value')
    
    if (!snapshot.exists()) {
      return null
    }
    
    return {
      id: snapshot.key!,
      ...snapshot.val()
    }
  } catch (error) {
    console.error('Error getting Firebase Database media:', error)
    return null
  }
}
