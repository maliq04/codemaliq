'use client'

import { useEffect, useState } from 'react'

export default function MediaLibrary() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/admin/media')
      const result = await response.json()
      if (result.success) {
        setMedia(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch media')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'uploads')

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        fetchMedia()
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Delete this image?')) return

    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        setMedia(media.filter(m => m.id !== mediaId))
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {media.map(item => (
          <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="relative aspect-square">
              <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-2 p-3">
              <p className="truncate text-xs text-gray-500">{item.name}</p>
              <p className="text-xs text-gray-400">{(item.size / 1024).toFixed(1)} KB</p>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(item.url)}
                  className="flex-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
