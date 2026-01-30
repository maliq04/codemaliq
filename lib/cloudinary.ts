import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_HOST,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export interface CloudinaryUploadResult {
  public_id: string
  url: string
  secure_url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
}

export interface CloudinaryMediaItem {
  public_id: string
  url: string
  secure_url: string
  format: string
  width: number
  height: number
  created_at: string
  tags: string[]
  resource_type: string
}

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder to upload to
 * @param options - Additional upload options
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  folder: string = 'uploads',
  options: {
    tags?: string[]
    transformation?: any
    public_id?: string
  } = {}
): Promise<CloudinaryUploadResult | null> {
  try {
    // Convert buffer to base64 if needed
    let fileData: string
    if (Buffer.isBuffer(file)) {
      fileData = `data:image/png;base64,${file.toString('base64')}`
    } else {
      fileData = file
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      tags: options.tags,
      transformation: options.transformation,
      public_id: options.public_id,
      resource_type: 'auto'
    })

    return {
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return null
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return false
  }
}

/**
 * Get all media from Cloudinary
 * @param folder - Optional folder to filter by
 * @param maxResults - Maximum number of results to return
 */
export async function getCloudinaryMedia(folder?: string, maxResults: number = 100): Promise<CloudinaryMediaItem[]> {
  try {
    const options: any = {
      max_results: maxResults,
      resource_type: 'image'
    }

    if (folder) {
      options.prefix = folder
    }

    const result = await cloudinary.api.resources(options)

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      url: resource.url,
      secure_url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      created_at: resource.created_at,
      tags: resource.tags || [],
      resource_type: resource.resource_type
    }))
  } catch (error) {
    console.error('Error getting Cloudinary media:', error)
    return []
  }
}

/**
 * Get media by tag
 * @param tag - Tag to filter by
 * @param maxResults - Maximum number of results
 */
export async function getCloudinaryMediaByTag(tag: string, maxResults: number = 100): Promise<CloudinaryMediaItem[]> {
  try {
    const result = await cloudinary.api.resources_by_tag(tag, {
      max_results: maxResults,
      resource_type: 'image'
    })

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      url: resource.url,
      secure_url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      created_at: resource.created_at,
      tags: resource.tags || [],
      resource_type: resource.resource_type
    }))
  } catch (error) {
    console.error('Error getting Cloudinary media by tag:', error)
    return []
  }
}

/**
 * Validate file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @param allowedFormats - Allowed file formats
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 10,
  allowedFormats: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    }
  }

  // Check file type
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedFormats.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Generate a Cloudinary upload signature for client-side uploads
 */
export function generateUploadSignature(folder: string = 'uploads'): {
  signature: string
  timestamp: number
  api_key: string
  folder: string
} {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder
    },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    folder
  }
}

export default cloudinary
