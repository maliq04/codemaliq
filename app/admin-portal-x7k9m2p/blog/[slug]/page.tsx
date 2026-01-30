'use client'

import { useParams, useRouter } from 'next/navigation'

import BlogEditor from '@/components/admin/blog/BlogEditor'
import { useEffect, useState } from 'react'

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
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error || 'Post not found'}</div>
        <button
          onClick={() => router.push('/admin-portal-x7k9m2p/blog')}
          className="mt-4 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          Back to Blog List
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button onClick={() => router.push('/admin-portal-x7k9m2p/blog')} className="text-blue-600 hover:text-blue-700">
          ← Back to Blog List
        </button>
      </div>
      <BlogEditor initialData={post} onSave={handleSave} mode="edit" />
    </div>
  )
}
