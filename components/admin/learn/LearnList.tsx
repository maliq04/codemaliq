'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit, Plus, Eye, EyeOff } from 'lucide-react'

interface LearnArticle {
  slug: string
  category: string
  title: string
  description: string
  published: boolean
  content?: string
}

export default function LearnList() {
  const [articles, setArticles] = useState<LearnArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingArticle, setEditingArticle] = useState<LearnArticle | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    content: '',
    published: true
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/learn')
      const data = await response.json()
      if (data.success) {
        setArticles(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        alert('Article created successfully!')
        setIsCreating(false)
        setFormData({ title: '', description: '', category: '', content: '', published: true })
        fetchArticles()
      } else {
        alert('Failed to create article: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to create article:', error)
      alert('Failed to create article')
    }
  }

  const handleUpdate = async () => {
    if (!editingArticle) return
    
    try {
      const response = await fetch('/api/admin/learn', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: editingArticle.slug,
          category: editingArticle.category
        })
      })
      const data = await response.json()
      if (data.success) {
        alert('Article updated successfully!')
        setEditingArticle(null)
        setFormData({ title: '', description: '', category: '', content: '', published: true })
        fetchArticles()
      } else {
        alert('Failed to update article: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to update article:', error)
      alert('Failed to update article')
    }
  }

  const handleDelete = async (article: LearnArticle) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return

    try {
      const response = await fetch(`/api/admin/learn?slug=${article.slug}&category=${article.category}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        alert('Article deleted successfully!')
        fetchArticles()
      } else {
        alert('Failed to delete article: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to delete article:', error)
      alert('Failed to delete article')
    }
  }

  const startEdit = (article: LearnArticle) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      description: article.description,
      category: article.category,
      content: article.content || '',
      published: article.published
    })
    setIsCreating(false)
  }

  const startCreate = () => {
    setIsCreating(true)
    setEditingArticle(null)
    setFormData({ title: '', description: '', category: '', content: '', published: true })
  }

  const cancelEdit = () => {
    setEditingArticle(null)
    setIsCreating(false)
    setFormData({ title: '', description: '', category: '', content: '', published: true })
  }

  // Group articles by category
  const groupedArticles = articles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = []
    }
    acc[article.category].push(article)
    return acc
  }, {} as Record<string, LearnArticle[]>)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Learning Articles</h1>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      {(isCreating || editingArticle) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            {isCreating ? 'Create New Article' : 'Edit Article'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., learn-vue-js, js-tips"
                className="w-full px-3 py-2 border rounded"
                disabled={!!editingArticle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border rounded font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Published</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isCreating ? 'Create' : 'Update'}
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

      <div className="space-y-6">
        {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
          <div key={category} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 capitalize">
              {category.replace(/-/g, ' ')}
            </h3>
            <div className="space-y-2">
              {categoryArticles.map((article) => (
                <div
                  key={`${article.category}-${article.slug}`}
                  className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{article.title}</h4>
                      {article.published ? (
                        <Eye size={16} className="text-green-600" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </div>
                    {article.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {article.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(article)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(article)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No learning articles found. Create your first article!
        </div>
      )}
    </div>
  )
}
