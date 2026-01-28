'use client'

import { useState, useEffect } from 'react'
import { MdDownload, MdDelete, MdPictureAsPdf, MdCloudUpload } from 'react-icons/md'
import { FirebaseCVManager, CVInfo } from '@/lib/firebase-cv-manager'

export default function CVManager() {
  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null)
  const [uploading, setUploading] = useState(false)
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
      // Subscribe to CV updates
      unsubscribe = FirebaseCVManager.subscribeToCV((updatedCvInfo) => {
        setCvInfo(updatedCvInfo)
        setLoading(false)
        console.log('CV info updated:', updatedCvInfo)
      })
    } catch (error) {
      console.error('Failed to subscribe to CV updates:', error)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [mounted])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await FirebaseCVManager.uploadCV(file)
      alert('CV uploaded successfully!')
      
      // Reset file input
      event.target.value = ''
    } catch (error) {
      console.error('Upload failed:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the current CV?')) return

    try {
      await FirebaseCVManager.deleteCV()
      alert('CV deleted successfully!')
    } catch (error) {
      console.error('Delete failed:', error)
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDownload = () => {
    if (!cvInfo) return
    
    try {
      FirebaseCVManager.downloadCV(cvInfo)
    } catch (error) {
      console.error('Download failed:', error)
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleInitialize = async () => {
    try {
      const response = await fetch('/api/admin/cv/initialize', {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Database initialized successfully! Please try uploading again.')
        // Refresh the component
        window.location.reload()
      } else {
        alert(`Initialization failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Initialization failed:', error)
      alert('Initialization failed. Please check console for details.')
    }
  }

  if (!mounted || loading) {
    return <div className="p-6">Loading CV manager...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV Management</h1>
          <p className="text-gray-600">
            Upload and manage your professional CV for the About page
          </p>
        </div>
      </div>

      {/* Current CV Status */}
      {cvInfo ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <MdPictureAsPdf className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Current CV
                </h3>
                <p className="text-gray-600 mb-2">{cvInfo.fileName}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Size: {FirebaseCVManager.formatFileSize(cvInfo.fileSize)}</p>
                  <p>Uploaded: {FirebaseCVManager.formatDate(cvInfo.uploadedAt)}</p>
                  {cvInfo.lastUpdated !== cvInfo.uploadedAt && (
                    <p>Updated: {FirebaseCVManager.formatDate(cvInfo.lastUpdated)}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <MdDownload />
                Preview
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <MdDelete />
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <MdCloudUpload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No CV uploaded yet
          </h3>
          <p className="text-gray-600 mb-4">
            Upload your professional CV to make it available on the About page
          </p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {cvInfo ? 'Replace CV' : 'Upload CV'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 10MB. Only PDF files are allowed.
            </p>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Uploading to Firebase Storage...</span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload your CV as a PDF file (max 10MB)</li>
          <li>• The file is converted to base64 and stored in Firebase Database</li>
          <li>• No external storage needed - everything in one place</li>
          <li>• Visitors can download your CV from the About page</li>
          <li>• Replacing a CV will automatically overwrite the old file</li>
        </ul>
      </div>

      {/* Troubleshooting */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-medium text-yellow-900 mb-2">🔧 Troubleshooting:</h3>
        <p className="text-sm text-yellow-800 mb-3">
          If you're getting permission errors, try initializing the database:
        </p>
        <button
          onClick={handleInitialize}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm"
        >
          Initialize Database
        </button>
        <p className="text-xs text-yellow-700 mt-2">
          This creates the required database structure for CV storage.
        </p>
      </div>
    </div>
  )
}