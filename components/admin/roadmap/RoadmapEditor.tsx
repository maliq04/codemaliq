'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit, Plus, Save } from 'lucide-react'

interface RoadmapItem {
  title: string
  icon: string
  category: string
  linkIndonesia?: string
  linkEnglish?: string
}

interface Roadmap {
  title: string
  description: string
  list: RoadmapItem[]
}

export default function RoadmapEditor() {
  const [roadmap, setRoadmap] = useState<Roadmap>({ title: '', description: '', list: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<RoadmapItem>({
    title: '',
    icon: '',
    category: '',
    linkIndonesia: '',
    linkEnglish: ''
  })

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      const response = await fetch('/api/admin/roadmap')
      const result = await response.json()
      if (result.success) {
        setRoadmap(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch roadmap')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roadmap)
      })

      const result = await response.json()
      if (result.success) {
        alert('Roadmap saved successfully!')
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to save roadmap')
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = () => {
    if (!formData.title || !formData.category) {
      alert('Title and category are required')
      return
    }

    const newList = [...roadmap.list, formData]
    setRoadmap({ ...roadmap, list: newList })
    setIsAdding(false)
    setFormData({ title: '', icon: '', category: '', linkIndonesia: '', linkEnglish: '' })
  }

  const handleUpdate = () => {
    if (editingIndex === null) return
    if (!formData.title || !formData.category) {
      alert('Title and category are required')
      return
    }

    const newList = [...roadmap.list]
    newList[editingIndex] = formData
    setRoadmap({ ...roadmap, list: newList })
    setEditingIndex(null)
    setFormData({ title: '', icon: '', category: '', linkIndonesia: '', linkEnglish: '' })
  }

  const handleDelete = (index: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const newList = roadmap.list.filter((_, i) => i !== index)
    setRoadmap({ ...roadmap, list: newList })
  }

  const startEdit = (item: RoadmapItem, index: number) => {
    setEditingIndex(index)
    setFormData(item)
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingIndex(null)
    setFormData({ title: '', icon: '', category: '', linkIndonesia: '', linkEnglish: '' })
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setIsAdding(false)
    setFormData({ title: '', icon: '', category: '', linkIndonesia: '', linkEnglish: '' })
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const groupedByCategory = roadmap.list.reduce((acc: Record<string, RoadmapItem[]>, item: RoadmapItem) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Roadmap Management</h1>
        <div className="flex gap-2">
          <button
            onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={20} />
            Add Item
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {(isAdding || editingIndex !== null) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            {isAdding ? 'Add New Item' : 'Edit Item'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., React.js, Vue.js"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., frontend-developer, mastering-react-js"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link (Indonesian)</label>
              <input
                type="text"
                value={formData.linkIndonesia || ''}
                onChange={(e) => setFormData({ ...formData, linkIndonesia: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link (English)</label>
              <input
                type="text"
                value={formData.linkEnglish || ''}
                onChange={(e) => setFormData({ ...formData, linkEnglish: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={isAdding ? handleAdd : handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isAdding ? 'Add' : 'Update'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.entries(groupedByCategory).map(([category, items]) => (
        <div key={category} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 capitalize">{category.replace(/-/g, ' ')}</h2>
          <div className="space-y-2">
            {items.map((item, index) => {
              const globalIndex = roadmap.list.findIndex(i => i === item)
              return (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.icon}</p>
                    {(item.linkIndonesia || item.linkEnglish) && (
                      <div className="flex gap-2 mt-1">
                        {item.linkIndonesia && (
                          <a href={item.linkIndonesia} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            🇮🇩 ID
                          </a>
                        )}
                        {item.linkEnglish && (
                          <a href={item.linkEnglish} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            🇬🇧 EN
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item, globalIndex)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(globalIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {roadmap.list.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No roadmap items found. Add your first item!
        </div>
      )}
    </div>
  )
}
