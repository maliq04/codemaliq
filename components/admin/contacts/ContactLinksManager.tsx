'use client'

import { useEffect, useState } from 'react'
import { FaDiscord, FaGithub, FaInstagram, FaLinkedin, FaNpm, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa'
import { MdAdd, MdCancel, MdDelete, MdEdit, MdSave } from 'react-icons/md'

import FirebaseStatusBanner from '../FirebaseStatusBanner'

interface ContactLink {
  id: string
  title: string
  description: string
  url: string
  icon: string
  category: 'social' | 'professional' | 'community' | 'other'
  isActive: boolean
  order: number
  bgColor?: string
  buttonText?: string
}

const iconMap = {
  github: FaGithub,
  linkedin: FaLinkedin,
  npm: FaNpm,
  discord: FaDiscord,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok
}

const defaultLinks: Omit<ContactLink, 'id'>[] = [
  {
    title: 'Explore the code',
    description: 'Explore the source code for all my projects on GitHub.',
    url: 'https://github.com/maliqalfathir',
    icon: 'github',
    category: 'professional',
    isActive: true,
    order: 1,
    bgColor: 'bg-slate-900',
    buttonText: 'Go to GitHub'
  },
  {
    title: "Let's connect",
    description: 'Connect for collaboration or explore my professional experience.',
    url: 'https://linkedin.com/in/maliqalfathir',
    icon: 'linkedin',
    category: 'professional',
    isActive: true,
    order: 2,
    bgColor: 'bg-blue-600',
    buttonText: 'Go to LinkedIn'
  },
  {
    title: 'Open source',
    description: 'Install and contribute to my open-source projects.',
    url: 'https://npmjs.com/~maliqalfathir',
    icon: 'npm',
    category: 'professional',
    isActive: true,
    order: 3,
    bgColor: 'bg-red-600',
    buttonText: 'Go to NPM'
  },
  {
    title: 'Chat with the community',
    description: 'Join over 1,000+ others developers on The Maliq Al Fathir Discord.',
    url: 'https://discord.gg/maliqalfathir',
    icon: 'discord',
    category: 'community',
    isActive: true,
    order: 4,
    bgColor: 'bg-purple-600',
    buttonText: 'Go to Discord'
  }
]

export default function ContactLinksManager() {
  const [links, setLinks] = useState<ContactLink[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<Partial<ContactLink>>({})

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/admin/contact-links')
      const result = await response.json()
      if (result.success) {
        setLinks(result.data)
      } else {
        // Initialize with default links if none exist
        await initializeDefaultLinks()
      }
    } catch (err) {
      console.error('Failed to fetch contact links')
      await initializeDefaultLinks()
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultLinks = async () => {
    try {
      const response = await fetch('/api/admin/contact-links/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: defaultLinks })
      })
      const result = await response.json()
      if (result.success) {
        setLinks(result.data)
      }
    } catch (err) {
      console.error('Failed to initialize default links')
    }
  }

  const handleSave = async (linkData: Partial<ContactLink>) => {
    try {
      // Validate required fields
      if (!linkData.title?.trim()) {
        alert('Title is required')
        return
      }

      if (!linkData.url?.trim()) {
        alert('URL is required')
        return
      }

      // Validate URL format
      const url = linkData.url.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL must start with http:// or https://')
        return
      }

      // Validate order is a positive number
      if (linkData.order && (isNaN(Number(linkData.order)) || Number(linkData.order) < 1)) {
        alert('Order must be a positive number')
        return
      }

      const apiUrl = editingId ? `/api/admin/contact-links/${editingId}` : '/api/admin/contact-links'
      const method = editingId ? 'PUT' : 'POST'

      const dataToSend = {
        ...linkData,
        title: linkData.title?.trim(),
        url: url,
        description: linkData.description?.trim() || '',
        order: Number(linkData.order) || 1
      }

      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      const result = await response.json()
      if (result.success) {
        await fetchLinks()
        setEditingId(null)
        setIsAdding(false)
        setFormData({})
        alert(editingId ? 'Link updated successfully!' : 'Link added successfully!')
      } else {
        alert(`Failed to save link: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Save error:', err)
      alert(`Failed to save link: ${err instanceof Error ? err.message : 'Network error'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact link?')) return

    try {
      const response = await fetch(`/api/admin/contact-links/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        setLinks(links.filter(l => l.id !== id))
      }
    } catch (err) {
      alert('Failed to delete link')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/contact-links/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      const result = await response.json()
      if (result.success) {
        setLinks(links.map(l => (l.id === id ? { ...l, isActive } : l)))
      }
    } catch (err) {
      alert('Failed to update link')
    }
  }

  const startEdit = (link: ContactLink) => {
    setEditingId(link.id)
    setFormData(link)
  }

  const startAdd = () => {
    setIsAdding(true)
    setFormData({
      title: '',
      description: '',
      url: '',
      icon: 'github',
      category: 'professional',
      isActive: true,
      order: links.length + 1,
      bgColor: 'bg-slate-900',
      buttonText: 'Go to Link'
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({})
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <FaGithub className="h-5 w-5" />
  }

  const renderForm = () => (
    <div className="space-y-4 rounded-lg bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Let's connect"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">URL *</label>
          <input
            type="url"
            value={formData.url || ''}
            onChange={e => setFormData({ ...formData, url: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://github.com/username"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Must start with http:// or https://</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Brief description of this link"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Button Text</label>
          <input
            type="text"
            value={formData.buttonText || ''}
            onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Go to GitHub"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Background Color</label>
          <select
            value={formData.bgColor || 'bg-slate-900'}
            onChange={e => setFormData({ ...formData, bgColor: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bg-slate-900">Dark Gray (GitHub)</option>
            <option value="bg-blue-600">Blue (LinkedIn)</option>
            <option value="bg-red-600">Red (NPM)</option>
            <option value="bg-purple-600">Purple (Discord)</option>
            <option value="bg-green-600">Green</option>
            <option value="bg-yellow-600">Yellow</option>
            <option value="bg-pink-600">Pink</option>
            <option value="bg-indigo-600">Indigo</option>
            <option value="bg-teal-600">Teal</option>
            <option value="bg-orange-600">Orange</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Icon</label>
          <select
            value={formData.icon || 'github'}
            onChange={e => setFormData({ ...formData, icon: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(iconMap).map(icon => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.category || 'professional'}
            onChange={e => setFormData({ ...formData, category: e.target.value as ContactLink['category'] })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="social">Social</option>
            <option value="professional">Professional</option>
            <option value="community">Community</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Order</label>
          <input
            type="number"
            value={formData.order || 1}
            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive || false}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className="mr-2"
          />
          Active
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleSave(formData)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <MdSave /> Save
        </button>
        <button
          onClick={cancelEdit}
          className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          <MdCancel /> Cancel
        </button>
      </div>
    </div>
  )

  if (loading) {
    return <div className="p-6">Loading contact links...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <FirebaseStatusBanner />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contact Links Management</h1>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          <MdAdd /> Add Link
        </button>
      </div>

      {isAdding && renderForm()}

      <div className="space-y-4">
        {links
          .sort((a, b) => a.order - b.order)
          .map(link => (
            <div key={link.id} className="rounded-lg bg-white p-4 shadow">
              {editingId === link.id ? (
                renderForm()
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex items-center gap-2">
                      {renderIcon(link.icon)}
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          link.category === 'professional'
                            ? 'bg-blue-100 text-blue-700'
                            : link.category === 'social'
                            ? 'bg-purple-100 text-purple-700'
                            : link.category === 'community'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {link.category}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{link.title}</h3>
                        <span className="text-sm text-gray-500">#{link.order}</span>
                        {!link.isActive && (
                          <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">Inactive</span>
                        )}
                      </div>
                      <p className="mb-2 text-sm text-gray-600">{link.description}</p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={link.isActive}
                        onChange={e => handleToggleActive(link.id, e.target.checked)}
                        className="mr-1"
                      />
                      Active
                    </label>
                    <button onClick={() => startEdit(link)} className="rounded p-2 text-blue-600 hover:bg-blue-50">
                      <MdEdit />
                    </button>
                    <button onClick={() => handleDelete(link.id)} className="rounded p-2 text-red-600 hover:bg-red-50">
                      <MdDelete />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
