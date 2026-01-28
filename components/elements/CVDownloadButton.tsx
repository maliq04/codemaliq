'use client'

import { useState, useEffect } from 'react'
import { MdDownload, MdPictureAsPdf } from 'react-icons/md'
import { FirebaseCVManager, CVInfo } from '@/lib/firebase-cv-manager'

export default function CVDownloadButton() {
  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let unsubscribe: (() => void) | null = null

    try {
      // Set timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('CV loading timeout')
          setLoading(false)
        }
      }, 5000) // 5 second timeout

      // Subscribe to CV updates
      unsubscribe = FirebaseCVManager.subscribeToCV((updatedCvInfo) => {
        clearTimeout(timeoutId)
        setCvInfo(updatedCvInfo)
        setLoading(false)
        console.log('CV info loaded:', updatedCvInfo)
      })
    } catch (error) {
      console.error('Failed to load CV info:', error)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [mounted, loading])

  const handleDownload = () => {
    if (!cvInfo) {
      alert('CV is not available at the moment. Please try again later.')
      return
    }
    
    try {
      FirebaseCVManager.downloadCV(cvInfo)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download CV. Please try again.')
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className="mt-6">
        <div className="animate-pulse flex items-center gap-3 bg-gray-200 dark:bg-gray-700 px-6 py-3 rounded-full w-fit">
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  // Don't show button if no CV is available
  if (!cvInfo) {
    return null
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleDownload}
        className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600"
      >
        <MdPictureAsPdf className="w-5 h-5 text-red-600" />
        <span>Download My CV</span>
        <MdDownload className="w-4 h-4" />
      </button>
      
      {/* CV Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        PDF • {FirebaseCVManager.formatFileSize(cvInfo.fileSize)} • Updated {new Date(cvInfo.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  )
}