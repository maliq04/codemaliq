'use client'

import { ContactMessage, FirebaseContactInboxService } from '@/lib/firebase-social-links'
import { useEffect, useState } from 'react'
import { MdDelete, MdEmail, MdMarkEmailRead, MdRefresh } from 'react-icons/md'

export default function ContactInboxManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    let unsubscribe: (() => void) | null = null

    try {
      // Set timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.warn('Firebase inbox connection timeout')
          setMessages([])
          setLoading(false)
          setIsConnected(false)
        }
      }, 10000) // 10 second timeout

      // Subscribe to real-time inbox updates
      unsubscribe = FirebaseContactInboxService.subscribeToMessages(updatedMessages => {
        clearTimeout(timeoutId)
        setMessages(updatedMessages)
        setLoading(false)
        setIsConnected(true)

        // Count unread messages
        const unread = updatedMessages.filter(msg => !msg.read).length
        setUnreadCount(unread)

        console.log('Inbox updated:', updatedMessages.length, 'messages,', unread, 'unread')
      })
    } catch (error) {
      console.error('Failed to subscribe to inbox updates:', error)
      setMessages([])
      setLoading(false)
      setIsConnected(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [mounted])

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await FirebaseContactInboxService.markAsRead(messageId)
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      alert('Failed to mark message as read')
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Delete this message?')) return

    try {
      await FirebaseContactInboxService.deleteMessage(messageId)
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  if (!mounted || loading) {
    return <div className="p-6">Loading inbox...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Inbox</h1>
          <p className="text-gray-600">
            {messages.length} total messages, {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? 'Real-time updates' : 'Offline mode'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            <MdRefresh className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="space-y-2 lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Messages</h2>

          {messages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <MdEmail className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No messages yet</p>
              <p className="mt-2 text-sm">Messages from the contact form will appear here</p>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.read) {
                      handleMarkAsRead(message.id!)
                    }
                  }}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'border-blue-500 bg-blue-50'
                      : message.read
                      ? 'border-gray-200 bg-white hover:bg-gray-50'
                      : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{message.name}</h3>
                      {!message.read && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                    </div>
                    <span className="text-xs text-gray-500">{formatTimeAgo(message.timestamp)}</span>
                  </div>
                  <p className="mb-2 text-sm text-gray-600">{message.email}</p>
                  <p className="line-clamp-2 text-sm text-gray-700">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="mb-2 text-xl font-bold text-gray-900">{selectedMessage.name}</h2>
                  <p className="mb-1 text-gray-600">{selectedMessage.email}</p>
                  <p className="text-sm text-gray-500">{formatDate(selectedMessage.timestamp)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedMessage.read && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id!)}
                      className="flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
                    >
                      <MdMarkEmailRead className="h-4 w-4" />
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id!)}
                    className="flex items-center gap-1 rounded-md bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                  >
                    <MdDelete className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium text-gray-900">Message:</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{selectedMessage.message}</p>
              </div>

              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-medium text-blue-900">Quick Actions:</h3>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Your message&body=Hi ${selectedMessage.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0ABest regards`}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedMessage.email)}
                    className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Copy Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <MdEmail className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">Select a message to view</h3>
              <p className="text-gray-600">Choose a message from the list to see its full content and reply options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
