'use client'

import { sendGTMEvent } from '@next/third-parties/google'

// Extend Window interface for GTM globals
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: Object[]
  }
}

// Check if we're in development mode
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' ||
         (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
         (typeof window !== 'undefined' && window.location.hostname.includes('127.0.0.1'))
}

// Check if GTM is available and initialized
const isGTMAvailable = () => {
  return !isDevelopment() &&
         typeof window !== 'undefined' && 
         window.gtag !== undefined && 
         window.dataLayer !== undefined
}

export const sendPageView = (url: string) => {
  // Skip in development
  if (isDevelopment()) {
    return
  }

  try {
    if (isGTMAvailable()) {
      sendGTMEvent({ event: 'page_viewed', url })
    }
  } catch (error) {
    // Silently handle GTM errors
    console.warn('GTM not available for page view tracking:', error)
  }
}

export const sendDataLayer = (data: Record<string, unknown>) => {
  // Skip in development
  if (isDevelopment()) {
    return
  }

  try {
    if (isGTMAvailable()) {
      sendGTMEvent(data)
    }
  } catch (error) {
    // Silently handle GTM errors
    console.warn('GTM not available for data layer event:', error)
  }
}
