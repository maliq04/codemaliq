'use client'

import { useState, useEffect } from 'react'
import { FaReply, FaHeart, FaRegHeart } from 'react-icons/fa'
import { formatDate } from '@/common/helpers'
import { toast } from '@/lib/toast'

interface Comment {
  id: string
  author: string
  email: string
  content: string
  timestamp: string
  likes: number
  replies: Reply[]
  userLiked?: boolean
}

interface Reply {
  id: string
  author: string
  email: string
  content: string
  timestamp: string
  likes: number
  userLiked?: boolean
}

interface LocalCommentSystemProps {
  slug: string
  commentsCount: number
  onCommentAdded: () => void
}

export default function LocalCommentSystem({ slug, commentsCount, onCommentAdded }: LocalCommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState({ author: '', email: '', content: '' })
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [newReply, setNewReply] = useState({ author: '', email: '', content: '' })

  useEffect(() => {
    loadComments()
  }, [slug])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}/comments`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComments(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.author.trim() || !newComment.email.trim() || !newComment.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newComment.author.trim(),
          email: newComment.email.trim(),
          content: newComment.content.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComments(prev => [data.data, ...prev])
          setNewComment({ author: '', email: '', content: '' })
          onCommentAdded()
          toast.success('Comment added successfully!')
        }
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const handleSubmitReply = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault()
    
    if (!newReply.author.trim() || !newReply.email.trim() || !newReply.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch(`/api/blog/${slug}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newReply.author.trim(),
          email: newReply.email.trim(),
          content: newReply.content.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, replies: [...comment.replies, data.data] }
              : comment
          ))
          setNewReply({ author: '', email: '', content: '' })
          setReplyingTo(null)
          toast.success('Reply added successfully!')
        }
      } else {
        toast.error('Failed to add reply')
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
      toast.error('Failed to add reply')
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/blog/${slug}/comments/${commentId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: data.data.likes, userLiked: data.data.userLiked }
              : comment
          ))
        }
      }
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  const handleLikeReply = async (commentId: string, replyId: string) => {
    try {
      const response = await fetch(`/api/blog/${slug}/comments/${commentId}/replies/${replyId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setComments(prev => prev.map(comment => 
            comment.id === commentId 
              ? {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply.id === replyId
                      ? { ...reply, likes: data.data.likes, userLiked: data.data.userLiked }
                      : reply
                  )
                }
              : comment
          ))
        }
      }
    } catch (error) {
      console.error('Failed to like reply:', error)
    }
  }

  if (loading) {
    return (
      <section id="local-comments" className="space-y-5 pb-6 pt-4">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-neutral-200 rounded dark:bg-neutral-700"></div>
        </div>
      </section>
    )
  }

  return (
    <section id="local-comments" className="space-y-6 pb-6 pt-4">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-semibold">Comments ({commentsCount})</h3>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Local Discussion
        </div>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
        <h4 className="font-medium">Add a comment</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Your name"
            value={newComment.author}
            onChange={(e) => setNewComment(prev => ({ ...prev, author: e.target.value }))}
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={newComment.email}
            onChange={(e) => setNewComment(prev => ({ ...prev, email: e.target.value }))}
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
            required
          />
        </div>
        <textarea
          placeholder="Write your comment..."
          value={newComment.content}
          onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-700"
          rows={4}
          required
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4 border-b border-neutral-200 pb-6 dark:border-neutral-700">
              {/* Comment */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{comment.author}</div>
                    <div className="text-sm text-neutral-500">{formatDate(comment.timestamp)}</div>
                  </div>
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-red-500"
                  >
                    {comment.userLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    {comment.likes}
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300">{comment.content}</p>
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <FaReply size={12} />
                  Reply
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="ml-6 space-y-3 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-700">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={newReply.author}
                      onChange={(e) => setNewReply(prev => ({ ...prev, author: e.target.value }))}
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-600"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={newReply.email}
                      onChange={(e) => setNewReply(prev => ({ ...prev, email: e.target.value }))}
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-600"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Write your reply..."
                    value={newReply.content}
                    onChange={(e) => setNewReply(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-600"
                    rows={3}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Post Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="rounded-md bg-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-6 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="space-y-2 border-l-2 border-neutral-200 pl-4 dark:border-neutral-600">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{reply.author}</div>
                          <div className="text-xs text-neutral-500">{formatDate(reply.timestamp)}</div>
                        </div>
                        <button
                          onClick={() => handleLikeReply(comment.id, reply.id)}
                          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-500"
                        >
                          {reply.userLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                          {reply.likes}
                        </button>
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}