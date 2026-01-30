'use client'

import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import type { BlogPost, BlogPostFormData } from '@/common/types/admin'

interface BlogEditorProps {
  initialData?: BlogPost
  onSave?: (data: Partial<BlogPost>) => Promise<void>
  mode?: 'create' | 'edit'
}

export default function BlogEditor({ initialData, onSave, mode = 'create' }: BlogEditorProps) {
  const router = useRouter()
  const isEditMode = mode === 'edit'

  const [formData, setFormData] = useState<BlogPostFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    tags: initialData?.tags || [],
    content: initialData?.content || '',
    published: initialData?.published || false,
    category: initialData?.category || 'all',
    postType: initialData?.postType || 'local' // New field for post type
  })

  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (onSave) {
        // Use custom save handler if provided
        await onSave(formData)
      } else {
        // Default save behavior
        const url = '/api/admin/blog'
        const method = 'POST'

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const result = await response.json()

        if (result.success) {
          router.push('/admin-portal-x7k9m2p/blog')
        } else {
          setError(result.error || 'Failed to save post')
        }
      }
    } catch (err) {
      setError('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)

      // Auto-resize image before upload
      const resizedFile = await resizeImageForBlog(file)

      const formData = new FormData()
      formData.append('file', resizedFile)
      formData.append('folder', 'blog')

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          image: result.data.url
        }))
      } else {
        alert(result.error || 'Failed to upload image')
      }
    } catch (err) {
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Auto-resize image function for optimal blog display
  const resizeImageForBlog = (file: File): Promise<File> => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Target dimensions for blog images (16:9 aspect ratio)
        const targetWidth = 1200
        const targetHeight = 675

        // Calculate scaling to maintain aspect ratio
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale

        // Set canvas size to target dimensions
        canvas.width = targetWidth
        canvas.height = targetHeight

        if (ctx) {
          // Fill with white background
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, targetWidth, targetHeight)

          // Center the image
          const offsetX = (targetWidth - scaledWidth) / 2
          const offsetY = (targetHeight - scaledHeight) / 2

          // Draw the resized image
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

          // Convert to blob and create new file
          canvas.toBlob(
            blob => {
              if (blob) {
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(resizedFile)
              } else {
                resolve(file) // Fallback to original file
              }
            },
            'image/jpeg',
            0.9
          ) // High quality JPEG
        } else {
          resolve(file) // Fallback to original file
        }
      }

      img.onerror = () => {
        resolve(file) // Fallback to original file
      }

      img.src = URL.createObjectURL(file)
    })
  }

  if (uploadingImage) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
        <p className="mt-1 text-gray-600">
          {isEditMode ? `Editing: ${initialData?.slug}` : 'Fill in the details below'}
        </p>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setShowPreview(false)}
            className={`border-b-2 px-4 py-2 font-medium transition-colors ${
              !showPreview ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`border-b-2 px-4 py-2 font-medium transition-colors ${
              showPreview ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="rounded-lg bg-white p-8 shadow">
          {formData.image && (
            <div className="mb-6">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl shadow-lg">
                <img src={formData.image} alt={formData.title} className="h-full w-full object-cover" />
                {/* Preview indicator */}
                <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 px-3 py-1 text-sm text-white">
                  Blog Preview
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">Preview shows how your image will appear on the blog page</p>
            </div>
          )}
          <h1 className="mb-4 text-3xl font-bold">{formData.title || 'Untitled'}</h1>
          <p className="mb-4 text-gray-600">{formData.description}</p>
          {formData.tags.length > 0 && (
            <div className="mb-6 flex gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap">{formData.content}</pre>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Enter post title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the post"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category *</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories (Home + Next.js + TypeScript)</option>
              <option value="home">Home Only</option>
              <option value="nextjs">Next.js Only</option>
              <option value="typescript">TypeScript Only</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">Choose where this post will appear on the blog page</p>
          </div>

          {/* Post Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Post Type *</label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                onClick={() => setFormData({ ...formData, postType: 'local' })}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  formData.postType === 'local' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      formData.postType === 'local' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {formData.postType === 'local' && (
                      <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Local Post</h3>
                    <p className="text-sm text-gray-600">Post only on your website</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Advanced comment system with replies
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Like, bookmark, and share features
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Full control over content and interactions
                  </div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, postType: 'devto' })}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  formData.postType === 'devto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      formData.postType === 'devto' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {formData.postType === 'devto' && (
                      <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Dev.to Post</h3>
                    <p className="text-sm text-gray-600">Post published on dev.to</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Uses dev.to comment system
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Links to dev.to for interactions
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Requires dev.to post ID
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dev.to Post ID (only show if devto type selected) */}
          {formData.postType === 'devto' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Dev.to Post ID *</label>
              <input
                type="text"
                value={formData.devtoId || ''}
                onChange={e => setFormData({ ...formData, devtoId: e.target.value })}
                required={formData.postType === 'devto'}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the dev.to post ID (e.g., 123456)"
              />
              <p className="mt-1 text-sm text-gray-500">
                The numeric ID from your dev.to post URL (e.g., dev.to/username/post-title-123456)
              </p>
            </div>
          )}

          {/* Cover Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Cover Image</label>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Image URL"
                />
                <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                  {uploadingImage ? 'Processing...' : 'Upload & Auto-Resize'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview with Proper Sizing */}
              {formData.image && (
                <div className="space-y-2">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50">
                    <img src={formData.image} alt="Cover Image Preview" className="h-full w-full object-cover" />
                    {/* Size indicator overlay */}
                    <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      Optimized for Blog
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    ✅ Image automatically resized to 1200×675px (16:9 ratio) for optimal blog display
                  </p>
                </div>
              )}

              {/* Upload Instructions */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-900">📸 Auto-Resize Feature</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Images are automatically resized to 1200×675px (16:9 aspect ratio)</li>
                  <li>• Perfect size for blog hero images and thumbnails</li>
                  <li>• Maintains image quality while optimizing file size</li>
                  <li>• No more small or poorly sized images!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Content (Markdown) *</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              required
              rows={20}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Write your post content in Markdown..."
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={e => setFormData({ ...formData, published: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publish immediately
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Post' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
