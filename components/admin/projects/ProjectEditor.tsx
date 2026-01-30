'use client'

import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

interface ProjectEditorProps {
  id?: string
}

export default function ProjectEditor({ id }: ProjectEditorProps) {
  const router = useRouter()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    image: '',
    link_demo: '',
    link_github: '',
    stacks: [] as string[],
    is_featured: false,
    is_show: true
  })

  const [stackInput, setStackInput] = useState('')
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      fetchProject()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/projects/${id}`)
      const result = await response.json()

      if (result.success) {
        setFormData(result.data)
      } else {
        setError(result.error || 'Failed to fetch project')
      }
    } catch (err) {
      setError('Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = isEditMode ? `/api/admin/projects/${id}` : '/api/admin/projects'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        router.push('/admin-portal-x7k9m2p/projects')
      } else {
        setError(result.error || 'Failed to save project')
      }
    } catch (err) {
      setError('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const handleAddStack = () => {
    if (stackInput.trim() && !formData.stacks.includes(stackInput.trim())) {
      setFormData({
        ...formData,
        stacks: [...formData.stacks, stackInput.trim()]
      })
      setStackInput('')
    }
  }

  const handleRemoveStack = (stack: string) => {
    setFormData({
      ...formData,
      stacks: formData.stacks.filter(s => s !== stack)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)

      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'projects')

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formDataUpload
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

  if (loading) {
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
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Project' : 'Create New Project'}</h1>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={e => setFormData({ ...formData, slug: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="auto-generated-from-title"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Description *</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Project Image</label>
          <div className="flex items-start gap-4">
            <input
              type="text"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Image URL"
            />
            <label className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
              {uploadingImage ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
          {formData.image && (
            <img src={formData.image} alt="Preview" className="mt-2 h-48 w-full rounded-lg object-cover" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Demo Link</label>
            <input
              type="url"
              value={formData.link_demo}
              onChange={e => setFormData({ ...formData, link_demo: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">GitHub Link</label>
            <input
              type="url"
              value={formData.link_github}
              onChange={e => setFormData({ ...formData, link_github: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Tech Stack</label>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              value={stackInput}
              onChange={e => setStackInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddStack())}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Add a technology"
            />
            <button
              type="button"
              onClick={handleAddStack}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          {formData.stacks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.stacks.map(stack => (
                <span
                  key={stack}
                  className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  {stack}
                  <button
                    type="button"
                    onClick={() => handleRemoveStack(stack)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Featured Project</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_show}
              onChange={e => setFormData({ ...formData, is_show: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Visible on Site</span>
          </label>
        </div>

        <div className="flex gap-4 border-t pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
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
    </div>
  )
}
