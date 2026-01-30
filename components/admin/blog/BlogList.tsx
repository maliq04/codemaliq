'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import type { BlogPost } from '@/common/types/admin'

export default function BlogList() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, filterPublished])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/blog')
      const result = await response.json()

      if (result.success) {
        setPosts(result.data)
      } else {
        setError(result.error || 'Failed to fetch posts')
      }
    } catch (err) {
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = [...posts]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by published status
    if (filterPublished === 'published') {
      filtered = filtered.filter(post => post.published)
    } else if (filterPublished === 'draft') {
      filtered = filtered.filter(post => !post.published)
    }

    setFilteredPosts(filtered)
  }

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/blog/${slug}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setPosts(posts.filter(p => p.slug !== slug))
        setDeleteConfirm(null)
      } else {
        alert(result.error || 'Failed to delete post')
      }
    } catch (err) {
      alert('Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-gray-600">{posts.length} total posts</p>
        </div>
        <Link
          href="/admin-portal-x7k9m2p/blog/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Create New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterPublished}
            onChange={e => setFilterPublished(e.target.value as any)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">No posts found</div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.slug} className="rounded-lg bg-white shadow transition-shadow hover:shadow-md">
              <div className="p-6">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {post.image && (
                    <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={post.image} alt={post.title} fill sizes="128px" className="object-cover" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-gray-900">{post.title}</h3>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="mb-2 line-clamp-2 text-sm text-gray-600">{post.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                          {post.author && <span>By {post.author}</span>}
                          {post.tags.length > 0 && (
                            <span className="flex gap-1">
                              {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="rounded bg-gray-100 px-2 py-1">
                                  {tag}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin-portal-x7k9m2p/blog/${post.slug}`)}
                          className="rounded px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        {deleteConfirm === post.slug ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(post.slug)}
                              className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(post.slug)}
                            className="rounded px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
