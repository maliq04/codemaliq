import { getCloudinaryUrl } from '../libs/cloudinary'
import { METADATA } from './metadata'

// Simple gray placeholder as data URL (1x1 pixel gray image)
export const PLACEHOLDER_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'
export const BACKDROP_IMAGE = getCloudinaryUrl('/backdrop')
export const PROFILE_URL = METADATA.profile
export const RESUME_URL = getCloudinaryUrl('/resume')

export const DEVTO_PROFILE = 'https://dev.to/maliqalfathir'
export const DEVTO_BLOG_API = 'https://dev.to/api/articles?username=maliqalfathir'

export const PAGESPEED_URL = 'https://pagespeed.web.dev/'
export const PAGESPEED_CATEGORIES = '&category=accessibility&category=performance&category=best-practices&category=seo'

export const SAWERIA_URL = 'https://saweria.co/maliqalfathir'
export const CODEWARS_URL = 'https://www.codewars.com/'
export const CODEMALIQ_SERVICE = process.env.CODEMALIQ_SERVICE || ''
