'use client'

import { useState, useEffect } from 'react'
import { MdWarning, MdCheckCircle, MdError } from 'react-icons/md'

interface FirebaseStatus {
  firebaseConnected: boolean
  fallbackMode: boolean
  error?: string
}

export default function FirebaseStatusBanner() {
  const [status, setStatus] = useState<FirebaseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkFirebaseStatus()
  }, [])

  const checkFirebaseStatus = async () => {
    try {
      const response = await fetch('/api/firebase-status')
      const result = await response.json()
      setStatus(result)
    } catch (error) {
      setStatus({
        firebaseConnected: false,
        fallbackMode: true,
        error: 'Failed to check Firebase status'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  if (!status || status.firebaseConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <MdCheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 text-sm font-medium">
            Firebase Connected
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <MdWarning className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-yellow-800 font-medium text-sm">
            Offline Mode Active
          </h4>
          <p className="text-yellow-700 text-sm mt-1">
            Firebase/Firestore is currently unavailable. The system is running in fallback mode using local storage. 
            Your changes will be saved locally but won't sync to the cloud until the connection is restored.
          </p>
          {status.error && (
            <p className="text-yellow-600 text-xs mt-2">
              Error: {status.error}
            </p>
          )}
          <button
            onClick={checkFirebaseStatus}
            className="mt-2 text-yellow-800 hover:text-yellow-900 text-sm underline"
          >
            Check connection again
          </button>
        </div>
      </div>
    </div>
  )
}