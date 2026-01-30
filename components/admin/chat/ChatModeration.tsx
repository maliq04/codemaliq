'use client'

import { useEffect, useState } from 'react'

export default function ChatModeration() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'flagged' | 'hidden'>('all')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/chat')
      const result = await response.json()
      if (result.success) {
        setMessages(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return

    try {
      const response = await fetch(`/api/admin/chat/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        setMessages(messages.filter(m => m.id !== id))
      }
    } catch (err) {
      alert('Failed to delete message')
    }
  }

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/chat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_show: !currentStatus })
      })
      const result = await response.json()
      if (result.success) {
        setMessages(messages.map(m => (m.id === id ? { ...m, is_show: !currentStatus } : m)))
      }
    } catch (err) {
      alert('Failed to update message')
    }
  }

  const filteredMessages = messages.filter(m => {
    if (filter === 'flagged') return m.flagged
    if (filter === 'hidden') return !m.is_show
    return true
  })

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Chat Moderation</h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="all">All Messages</option>
          <option value="flagged">Flagged</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredMessages.map(msg => (
          <div key={msg.id} className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  {msg.image && <img src={msg.image} alt={msg.name} className="h-8 w-8 rounded-full" />}
                  <div>
                    <p className="font-medium text-gray-900">{msg.name}</p>
                    <p className="text-xs text-gray-500">{msg.email}</p>
                  </div>
                  {!msg.is_show && <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">Hidden</span>}
                  {msg.flagged && <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">Flagged</span>}
                </div>
                <p className="text-gray-700">{msg.message}</p>
                <p className="mt-2 text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleVisibility(msg.id, msg.is_show)}
                  className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
                >
                  {msg.is_show ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
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
