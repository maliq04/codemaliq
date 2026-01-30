'use client'

import { useEffect, useState } from 'react'
import { MdCheckCircle, MdError, MdWarning } from 'react-icons/md'

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
      <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-center gap-2">
          <MdCheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">Firebase Connected</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <MdWarning className="mt-0.5 h-5 w-5 text-yellow-600" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-800">Offline Mode Active</h4>
          <p className="mt-1 text-sm text-yellow-700">
            Firebase/Firestore is currently unavailable. The system is running in fallback mode using local storage.
            Your changes will be saved locally but won't sync to the cloud until the connection is restored.
          </p>
          {status.error && <p className="mt-2 text-xs text-yellow-600">Error: {status.error}</p>}
          <button
            onClick={checkFirebaseStatus}
            className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
          >
            Check connection again
          </button>
        </div>
      </div>
    </div>
  )
}
