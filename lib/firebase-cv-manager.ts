import { ref as dbRef, set, onValue, remove } from 'firebase/database'
import { realtimeDb } from '@/firebase'

export interface CVInfo {
  base64Data: string
  fileName: string
  fileSize: number
  uploadedAt: number
  lastUpdated: number
  mimeType: string
}

export class FirebaseCVManager {
  
  // Upload CV to Firebase Realtime Database as base64
  static async uploadCV(file: File): Promise<CVInfo> {
    try {
      console.log('🚀 Starting CV upload process (DATABASE-ONLY VERSION)')
      
      // Validate file
      if (!file) {
        throw new Error('No file selected')
      }
      
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed')
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB')
      }

      console.log('✅ File validation passed:', { name: file.name, size: file.size, type: file.type })
      console.log('📄 Converting PDF to base64...')
      
      // Convert file to base64
      const base64Data = await this.fileToBase64(file)
      
      console.log('✅ Base64 conversion completed, length:', base64Data.length)
      
      // Create CV info object
      const cvInfo: CVInfo = {
        base64Data,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: Date.now(),
        lastUpdated: Date.now(),
        mimeType: file.type
      }
      
      // Save to Realtime Database
      console.log('💾 Saving CV to Firebase Realtime Database...')
      console.log('📍 Database path: profile_settings/cv')
      
      await set(dbRef(realtimeDb, 'profile_settings/cv'), cvInfo)
      
      console.log('🎉 CV uploaded successfully to DATABASE:', { fileName: cvInfo.fileName, size: cvInfo.fileSize })
      return cvInfo
      
    } catch (error) {
      console.error('❌ CV upload failed:', error)
      throw error
    }
  }

  // Convert file to base64 string
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:application/pdf;base64, prefix
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  }

  // Get CV info from Realtime Database
  static subscribeToCV(callback: (cvInfo: CVInfo | null) => void): () => void {
    const cvRef = dbRef(realtimeDb, 'profile_settings/cv')
    
    return onValue(cvRef, (snapshot) => {
      if (snapshot.exists()) {
        const cvInfo = snapshot.val() as CVInfo
        callback(cvInfo)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('CV subscription error:', error)
      callback(null)
    })
  }

  // Get CV info once (no subscription)
  static async getCVInfo(): Promise<CVInfo | null> {
    return new Promise((resolve) => {
      const cvRef = dbRef(realtimeDb, 'profile_settings/cv')
      onValue(cvRef, (snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val() as CVInfo)
        } else {
          resolve(null)
        }
      }, { onlyOnce: true })
    })
  }

  // Delete CV from Database
  static async deleteCV(): Promise<void> {
    try {
      // Delete from Database
      await remove(dbRef(realtimeDb, 'profile_settings/cv'))
      console.log('CV deleted successfully')
    } catch (error) {
      console.error('CV deletion failed:', error)
      throw error
    }
  }

  // Download CV (create blob URL and open)
  static downloadCV(cvInfo: CVInfo): void {
    if (!cvInfo?.base64Data) {
      throw new Error('CV data not available')
    }
    
    try {
      // Convert base64 to blob
      const byteCharacters = atob(cvInfo.base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: cvInfo.mimeType || 'application/pdf' })
      
      // Create blob URL and open in new tab
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
      
      // Clean up blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 1000)
      
    } catch (error) {
      console.error('Failed to download CV:', error)
      throw new Error('Failed to process CV file')
    }
  }

  // Get file size in human readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format upload date
  static formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}