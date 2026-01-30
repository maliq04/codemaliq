'use client'

import { CVInfo, FirebaseCVManager } from '@/lib/firebase-cv-manager'
import { useEffect, useState } from 'react'
import { MdDownload, MdPictureAsPdf } from 'react-icons/md'

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
      unsubscribe = FirebaseCVManager.subscribeToCV(updatedCvInfo => {
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
        <div className="flex w-fit animate-pulse items-center gap-3 rounded-full bg-gray-200 px-6 py-3 dark:bg-gray-700">
          <div className="h-5 w-5 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-600"></div>
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
        className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-900 shadow-md transition-colors duration-200 hover:bg-gray-100 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      >
        <MdPictureAsPdf className="h-5 w-5 text-red-600" />
        <span>Download My CV</span>
        <MdDownload className="h-4 w-4" />
      </button>

      {/* CV Info */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        PDF • {FirebaseCVManager.formatFileSize(cvInfo.fileSize)} • Updated{' '}
        {new Date(cvInfo.lastUpdated).toLocaleDateString()}
      </p>
    </div>
  )
}
