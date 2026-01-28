'use client'

import { useState, useEffect } from 'react'
import { FiUpload, FiImage, FiSettings, FiSave, FiTrash2, FiEye } from 'react-icons/fi'
import Image from 'next/image'
import { useBranding } from '@/components/providers/BrandingProvider'

interface UploadSettings {
  maxFileSize: number // in MB
  allowedTypes: string[]
  logoUrl: string
  faviconUrl: string
  ogImageUrl: string
  brandName: string
  brandDescription: string
}

interface UploadedFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

export default function UploadManager() {
  const { forceRefresh } = useBranding()
  const [settings, setSettings] = useState<UploadSettings>({
    maxFileSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    logoUrl: '/img/codemaliq.jpg',
    faviconUrl: '/favicon.ico',
    ogImageUrl: '/img/codemaliq.jpg',
    brandName: 'Maliq Al Fathir',
    brandDescription: 'Full Stack Developer & Tech Enthusiast'
  })
  
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'settings' | 'branding' | 'files'>('branding')

  useEffect(() => {
    loadSettings()
    loadFiles()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/uploads/settings')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(prev => ({ ...prev, ...data.data }))
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/admin/uploads/files')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFiles(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/uploads/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        // Add delay to ensure Firebase is updated
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Force refresh branding context to update the UI immediately
        await forceRefresh()
        
        // Additional refresh after a short delay to ensure UI updates
        setTimeout(async () => {
          await forceRefresh()
        }, 500)
        
        alert('Settings saved successfully! Changes should be visible immediately.')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleBrandingImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'logo' | 'favicon' | 'ogImage') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > settings.maxFileSize * 1024 * 1024) {
      alert(`File size must be less than ${settings.maxFileSize}MB`)
      return
    }

    // Validate file type
    if (!settings.allowedTypes.includes(file.type)) {
      alert('File type not allowed')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/uploads/files', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update the appropriate URL in settings immediately
          const uploadedUrl = data.data.url
          const fieldName = imageType === 'logo' ? 'logoUrl' : imageType === 'favicon' ? 'faviconUrl' : 'ogImageUrl'
          
          // Update local state
          const updatedSettings = {
            ...settings,
            [fieldName]: uploadedUrl
          }
          setSettings(updatedSettings)
          
          // CRITICAL: Save the settings immediately to Firebase
          const settingsToSave = {
            ...updatedSettings
          }
          
          // Save to Firebase immediately
          const saveResponse = await fetch('/api/admin/uploads/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settingsToSave)
          })
          
          if (saveResponse.ok) {
            
            // Add delay to ensure Firebase is updated
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Force refresh branding context with cache busting multiple times
            await forceRefresh()
            
            // Additional refresh after a short delay to ensure UI updates
            setTimeout(async () => {
              await forceRefresh()
            }, 500)
            
            // Show success message
            alert(`${imageType === 'logo' ? 'Logo' : imageType === 'favicon' ? 'Favicon' : 'Open Graph image'} uploaded and applied successfully! The changes should be visible immediately.`)
            
          } else {
            const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }))
            console.error('Failed to save settings to Firebase:', errorData.error || 'Unknown error')
            
            if (saveResponse.status === 401) {
              alert('Authentication required! Please make sure you are logged in to the admin portal. The image was uploaded but not applied permanently.')
            } else {
              alert(`Image uploaded but failed to apply permanently (${saveResponse.status}). Please try clicking "Save Branding" manually or check your admin login.`)
            }
          }
          
          // Add to files list
          setFiles(prev => [data.data, ...prev])
        }
      } else {
        console.error('Upload failed with status:', response.status)
        alert('Failed to upload file')
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to upload file')
    } finally {
      setLoading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > settings.maxFileSize * 1024 * 1024) {
      alert(`File size must be less than ${settings.maxFileSize}MB`)
      return
    }

    // Validate file type
    if (!settings.allowedTypes.includes(file.type)) {
      alert('File type not allowed')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/uploads/files', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFiles(prev => [data.data, ...prev])
          alert('File uploaded successfully!')
        }
      } else {
        alert('Failed to upload file')
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to upload file')
    } finally {
      setLoading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/admin/uploads/files/${fileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        alert('File deleted successfully!')
      } else {
        alert('Failed to delete file')
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      alert('Failed to delete file')
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  }

  const tabs = [
    { id: 'branding', label: 'Branding', icon: FiImage },
    { id: 'settings', label: 'Upload Settings', icon: FiSettings },
    { id: 'files', label: 'File Manager', icon: FiUpload }
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
            <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Site Branding
            </h3>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
                />
              </div>

              {/* Brand Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Brand Description
                </label>
                <input
                  type="text"
                  value={settings.brandDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, brandDescription: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Logo URL
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
                      placeholder="Enter logo URL or upload below"
                    />
                    {settings.logoUrl && (
                      <div className="flex-shrink-0">
                        {settings.logoUrl.startsWith('data:') ? (
                          <img
                            src={settings.logoUrl}
                            alt="Logo preview"
                            width={40}
                            height={40}
                            className="rounded border admin-preview"
                            style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '40px', maxHeight: '40px' }}
                          />
                        ) : (
                          <Image
                            src={settings.logoUrl}
                            alt="Logo preview"
                            width={0}
                            height={0}
                            sizes="40px"
                            className="rounded border admin-preview"
                            style={{ width: 'auto', height: 'auto', maxWidth: '40px', maxHeight: '40px' }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="logo-upload"
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        loading 
                          ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed dark:bg-neutral-600 dark:text-neutral-400' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                      }`}
                    >
                      <FiUpload className="h-4 w-4" />
                      {loading ? 'Uploading...' : 'Upload Logo'}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      className="sr-only"
                      accept={settings.allowedTypes.join(',')}
                      onChange={(e) => handleBrandingImageUpload(e, 'logo')}
                      disabled={loading}
                    />
                    <span className="text-xs text-neutral-500">
                      Max {settings.maxFileSize}MB • PNG, JPG, GIF, WebP
                    </span>
                  </div>
                </div>
              </div>

              {/* Favicon URL */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Favicon URL
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.faviconUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                      className="block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
                      placeholder="Enter favicon URL or upload below"
                    />
                    {settings.faviconUrl && (
                      <div className="flex-shrink-0">
                        {settings.faviconUrl.startsWith('data:') ? (
                          <img
                            src={settings.faviconUrl}
                            alt="Favicon preview"
                            width={24}
                            height={24}
                            className="rounded border admin-preview"
                            style={{ objectFit: 'contain', width: 'auto', height: 'auto', maxWidth: '24px', maxHeight: '24px' }}
                          />
                        ) : (
                          <Image
                            src={settings.faviconUrl}
                            alt="Favicon preview"
                            width={0}
                            height={0}
                            sizes="24px"
                            className="rounded border admin-preview"
                            style={{ width: 'auto', height: 'auto', maxWidth: '24px', maxHeight: '24px' }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="favicon-upload"
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        loading 
                          ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed dark:bg-neutral-600 dark:text-neutral-400' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                      }`}
                    >
                      <FiUpload className="h-4 w-4" />
                      {loading ? 'Uploading...' : 'Upload Favicon'}
                    </label>
                    <input
                      id="favicon-upload"
                      type="file"
                      className="sr-only"
                      accept={settings.allowedTypes.join(',')}
                      onChange={(e) => handleBrandingImageUpload(e, 'favicon')}
                      disabled={loading}
                    />
                    <span className="text-xs text-neutral-500">
                      Recommended: 32x32px ICO or PNG
                    </span>
                  </div>
                </div>
              </div>

              {/* OG Image URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Open Graph Image URL
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.ogImageUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, ogImageUrl: e.target.value }))}
                      className="block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
                      placeholder="Enter Open Graph image URL or upload below"
                    />
                    {settings.ogImageUrl && (
                      <div className="flex-shrink-0">
                        {settings.ogImageUrl.startsWith('data:') ? (
                          <img
                            src={settings.ogImageUrl}
                            alt="OG image preview"
                            width={60}
                            height={40}
                            className="rounded border object-cover admin-preview"
                            style={{ objectFit: 'cover', width: 'auto', height: 'auto', maxWidth: '60px', maxHeight: '40px' }}
                          />
                        ) : (
                          <Image
                            src={settings.ogImageUrl}
                            alt="OG image preview"
                            width={0}
                            height={0}
                            sizes="60px"
                            className="rounded border object-cover admin-preview"
                            style={{ width: 'auto', height: 'auto', maxWidth: '60px', maxHeight: '40px' }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="og-image-upload"
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        loading 
                          ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed dark:bg-neutral-600 dark:text-neutral-400' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                      }`}
                    >
                      <FiUpload className="h-4 w-4" />
                      {loading ? 'Uploading...' : 'Upload OG Image'}
                    </label>
                    <input
                      id="og-image-upload"
                      type="file"
                      className="sr-only"
                      accept={settings.allowedTypes.join(',')}
                      onChange={(e) => handleBrandingImageUpload(e, 'ogImage')}
                      disabled={loading}
                    />
                    <span className="text-xs text-neutral-500">
                      Recommended: 1200x630px • Max {settings.maxFileSize}MB
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSave className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
            <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Upload Configuration
            </h3>
            
            <div className="space-y-4">
              {/* Max File Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
                />
              </div>

              {/* Allowed File Types */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Allowed File Types
                </label>
                <div className="mt-2 space-y-2">
                  {['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.allowedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings(prev => ({ ...prev, allowedTypes: [...prev.allowedTypes, type] }))
                          } else {
                            setSettings(prev => ({ ...prev, allowedTypes: prev.allowedTypes.filter(t => t !== type) }))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSave className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Manager Tab */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
            <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Upload New File
            </h3>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center dark:border-neutral-600">
              <FiUpload className="mx-auto h-12 w-12 text-neutral-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Click to upload or drag and drop
                  </span>
                  <span className="mt-1 block text-xs text-neutral-500">
                    Max {settings.maxFileSize}MB • {settings.allowedTypes.join(', ')}
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept={settings.allowedTypes.join(',')}
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="rounded-lg bg-white shadow dark:bg-neutral-800">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Uploaded Files ({files.length})
              </h3>
            </div>
            
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {files.length === 0 ? (
                <div className="px-6 py-8 text-center text-neutral-500">
                  No files uploaded yet
                </div>
              ) : (
                files.map(file => (
                  <div key={file.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      {file.type.startsWith('image/') && (
                        file.url.startsWith('data:') ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            width={48}
                            height={48}
                            className="rounded border object-cover admin-preview"
                            style={{ objectFit: 'cover', width: 'auto', height: 'auto', maxWidth: '48px', maxHeight: '48px' }}
                          />
                        ) : (
                          <Image
                            src={file.url}
                            alt={file.name}
                            width={48}
                            height={48}
                            className="rounded border object-cover admin-preview"
                            style={{ width: 'auto', height: 'auto', maxWidth: '48px', maxHeight: '48px' }}
                          />
                        )
                      )}
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{file.name}</p>
                        <p className="text-sm text-neutral-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="rounded p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700"
                        title="Copy URL"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="rounded p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        title="Delete file"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}