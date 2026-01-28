'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import BlogEditor from '@/components/admin/blog/BlogEditor'
import type { BlogPost } from '@/common/types/admin'

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blog')
      const result = await response.json()

      if (result.success) {
        const foundPost = result.data.find((p: BlogPost) => p.slug === slug)
        if (foundPost) {
          setPost(foundPost)
        } else {
          setError('Post not found')
        }
      } else {
        setError(result.error || 'Failed to fetch post')
      }
    } catch (err) {
      setError('Failed to fetch post')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: Partial<BlogPost>) => {
    try {
      const response = await fetch(`/api/admin/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        alert('Post updated successfully!')
        router.push('/admin-portal-x7k9m2p/blog')
      } else {
        alert(result.error || 'Failed to update post')
      }
    } catch (err) {
      alert('Failed to update post')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error || 'Post not found'}
        </div>
        <button
          onClick={() => router.push('/admin-portal-x7k9m2p/blog')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Blog List
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin-portal-x7k9m2p/blog')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Blog List
        </button>
      </div>
      <BlogEditor initialData={post} onSave={handleSave} mode="edit" />
    </div>
  )
}
