'use client'

import { FirebaseSocialLinksService, SocialLinksData } from '@/lib/firebase-social-links'
import { useEffect, useState } from 'react'
import { FaDiscord, FaGithub, FaLinkedin, FaNpm } from 'react-icons/fa'
import { MdLink, MdRefresh, MdSave } from 'react-icons/md'

export default function SocialLinksManager() {
  const [links, setLinks] = useState<SocialLinksData>({
    github: '',
    linkedin: '',
    npm: '',
    discord: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    let unsubscribe: (() => void) | null = null

    try {
      // Subscribe to real-time updates with timeout
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Firebase connection timeout, using default values')
          setLinks(FirebaseSocialLinksService.getDefaultLinks())
          setLoading(false)
          setIsConnected(false)
        }
      }, 10000) // 10 second timeout

      unsubscribe = FirebaseSocialLinksService.subscribeToSocialLinks(updatedLinks => {
        clearTimeout(timeoutId)
        setLinks(updatedLinks)
        setLoading(false)
        setIsConnected(true)
        console.log('Social links updated:', updatedLinks)
      })
    } catch (error) {
      console.error('Failed to connect to Firebase:', error)
      // Use default links as fallback
      const defaultLinks = FirebaseSocialLinksService.getDefaultLinks()
      setLinks(defaultLinks)
      setLoading(false)
      setIsConnected(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [mounted])

  const handleInitialize = async () => {
    setSaving(true)
    try {
      await FirebaseSocialLinksService.initializeDatabase()
      alert('Database initialized successfully! The page will refresh.')
      window.location.reload()
    } catch (error) {
      console.error('Failed to initialize database:', error)
      alert('Failed to initialize database. Please check your Firebase configuration.')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await FirebaseSocialLinksService.updateSocialLinks(links)
      alert('Social links updated successfully!')
    } catch (error) {
      console.error('Failed to update links:', error)
      alert('Failed to update links. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (platform: keyof SocialLinksData, value: string) => {
    setLinks(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidForm = () => {
    return Object.values(links).every(link => link.trim() !== '' && validateUrl(link.trim()))
  }

  if (!mounted || loading) {
    return <div className="p-6">Loading social links...</div>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Links Management</h1>
          <p className="text-gray-600">Manage your social media links that appear on the contact page</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? 'Firebase Connected' : 'Offline Mode'}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 rounded-lg bg-white p-6 shadow">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MdLink className="text-blue-600" />
          Edit Social Media Links
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* GitHub */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaGithub className="text-gray-800" />
              GitHub URL
            </label>
            <input
              type="url"
              value={links.github}
              onChange={e => handleInputChange('github', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username"
            />
            {links.github && !validateUrl(links.github) && (
              <p className="text-xs text-red-600">Please enter a valid URL</p>
            )}
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaLinkedin className="text-blue-600" />
              LinkedIn URL
            </label>
            <input
              type="url"
              value={links.linkedin}
              onChange={e => handleInputChange('linkedin', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/in/username"
            />
            {links.linkedin && !validateUrl(links.linkedin) && (
              <p className="text-xs text-red-600">Please enter a valid URL</p>
            )}
          </div>

          {/* NPM */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaNpm className="text-red-600" />
              NPM URL
            </label>
            <input
              type="url"
              value={links.npm}
              onChange={e => handleInputChange('npm', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://npmjs.com/~username"
            />
            {links.npm && !validateUrl(links.npm) && <p className="text-xs text-red-600">Please enter a valid URL</p>}
          </div>

          {/* Discord */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaDiscord className="text-purple-600" />
              Discord URL
            </label>
            <input
              type="url"
              value={links.discord}
              onChange={e => handleInputChange('discord', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://discord.gg/invite"
            />
            {links.discord && !validateUrl(links.discord) && (
              <p className="text-xs text-red-600">Please enter a valid URL</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 border-t pt-4">
          <button
            onClick={handleSave}
            disabled={saving || !isValidForm()}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {!isConnected && (
            <button
              onClick={handleInitialize}
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <MdRefresh />
              Initialize Database
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            <MdRefresh />
            Refresh
          </button>
        </div>

        {/* Help Text */}
        <div className={`rounded-lg p-4 ${isConnected ? 'bg-blue-50' : 'bg-yellow-50'}`}>
          <h3 className={`mb-2 font-medium ${isConnected ? 'text-blue-900' : 'text-yellow-900'}`}>
            {isConnected ? '💡 How it works:' : '⚠️ Database not initialized:'}
          </h3>
          <ul className={`space-y-1 text-sm ${isConnected ? 'text-blue-800' : 'text-yellow-800'}`}>
            {isConnected ? (
              <>
                <li>• Changes are saved to Firebase Realtime Database</li>
                <li>• Updates appear immediately on the contact page</li>
                <li>• All URLs must be valid and start with https://</li>
                <li>• Links are automatically synced across all devices</li>
              </>
            ) : (
              <>
                <li>• Firebase database is not initialized or connection failed</li>
                <li>• Click "Initialize Database" to create the required structure</li>
                <li>• Check your Firebase configuration in .env.local</li>
                <li>• Ensure NEXT_PUBLIC_FIREBASE_DATABASE_URL is set correctly</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
