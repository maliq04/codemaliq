import { NextResponse } from 'next/server'
import { database } from '@/lib/firebase-admin'

/**
 * Validate if a data URL contains valid base64 image data
 */
function isValidBase64Image(dataUrl: string): boolean {
  if (!dataUrl.startsWith('data:image/')) {
    return false
  }
  
  try {
    const base64Part = dataUrl.split(',')[1]
    if (!base64Part || base64Part === 'test-data' || base64Part.length < 20) {
      return false
    }
    
    // Try to decode the base64 to validate it
    const decoded = atob(base64Part)
    return decoded.length > 100 // Ensure it's a real image with some content
  } catch (error) {
    return false
  }
}

/**
 * GET /api/branding
 * Get current branding settings for public use
 */
export async function GET() {
  try {
    const settingsRef = database.ref('admin/upload_settings')
    const snapshot = await settingsRef.once('value')
    
    const defaultSettings = {
      logoUrl: '/img/codemaliq.jpg',
      faviconUrl: '/favicon.ico',
      ogImageUrl: '/img/codemaliq.jpg',
      brandName: 'Maliq Al Fathir',
      brandDescription: 'Full Stack Developer & Tech Enthusiast'
    }
    
    const settings = snapshot.val()
    const finalSettings = settings || defaultSettings
    
    // Validate and sanitize URLs
    let logoUrl = finalSettings.logoUrl || defaultSettings.logoUrl
    let faviconUrl = finalSettings.faviconUrl || defaultSettings.faviconUrl
    let ogImageUrl = finalSettings.ogImageUrl || defaultSettings.ogImageUrl
    
    // Check if URLs are valid base64 images, if not use defaults
    if (logoUrl.startsWith('data:') && !isValidBase64Image(logoUrl)) {
      logoUrl = defaultSettings.logoUrl
    }
    if (faviconUrl.startsWith('data:') && !isValidBase64Image(faviconUrl)) {
      faviconUrl = defaultSettings.faviconUrl
    }
    if (ogImageUrl.startsWith('data:') && !isValidBase64Image(ogImageUrl)) {
      ogImageUrl = defaultSettings.ogImageUrl
    }
    
    // Return only the branding-related settings for public use
    const responseData = {
      logoUrl,
      faviconUrl,
      ogImageUrl,
      brandName: finalSettings.brandName || defaultSettings.brandName,
      brandDescription: finalSettings.brandDescription || defaultSettings.brandDescription,
      timestamp: Date.now()
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    console.error('Error fetching branding settings:', error)
    
    // Return default settings if there's an error
    return NextResponse.json({
      success: true,
      data: {
        logoUrl: '/img/codemaliq.jpg',
        faviconUrl: '/favicon.ico',
        ogImageUrl: '/img/codemaliq.jpg',
        brandName: 'Maliq Al Fathir',
        brandDescription: 'Full Stack Developer & Tech Enthusiast',
        timestamp: Date.now(),
        error: 'Failed to fetch from Firebase'
      }
    })
  }
}