'use client'

import { useState, useEffect } from 'react'
import { FirebaseContactInboxService, ContactMessage } from '@/lib/firebase-social-links'
import { MdEmail, MdMarkEmailRead, MdDelete, MdRefresh } from 'react-icons/md'

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
      unsubscribe = FirebaseContactInboxService.subscribeToMessages((updatedMessages) => {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Inbox</h1>
          <p className="text-gray-600">
            {messages.length} total messages, {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Real-time updates' : 'Offline mode'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            <MdRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
          
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MdEmail className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm mt-2">Messages from the contact form will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.read) {
                      handleMarkAsRead(message.id!)
                    }
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'border-blue-500 bg-blue-50'
                      : message.read
                      ? 'border-gray-200 bg-white hover:bg-gray-50'
                      : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{message.name}</h3>
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedMessage.name}
                  </h2>
                  <p className="text-gray-600 mb-1">{selectedMessage.email}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedMessage.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedMessage.read && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id!)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <MdMarkEmailRead className="w-4 h-4" />
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id!)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    <MdDelete className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Message:</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Quick Actions:</h3>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: Your message&body=Hi ${selectedMessage.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0ABest regards`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedMessage.email)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Copy Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <MdEmail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a message to view
              </h3>
              <p className="text-gray-600">
                Choose a message from the list to see its full content and reply options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}