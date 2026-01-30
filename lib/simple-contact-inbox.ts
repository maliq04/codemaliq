// Simple contact inbox service (fallback implementation)
export interface ContactMessage {
  id?: string
  name: string
  email: string
  message: string
  timestamp: number
  read: boolean
}

// Simple in-memory storage for demo purposes
// In a real app, this would connect to a database
let messages: ContactMessage[] = []
let messageIdCounter = 1

export class SimpleContactInboxService {
  // Send a new message
  static async sendMessage(messageData: Omit<ContactMessage, 'id' | 'timestamp' | 'read'>): Promise<string> {
    const newMessage: ContactMessage = {
      id: `msg_${messageIdCounter++}`,
      ...messageData,
      timestamp: Date.now(),
      read: false
    }

    messages.unshift(newMessage) // Add to beginning
    console.log('Message sent:', newMessage)
    return newMessage.id!
  }

  // Get all messages
  static async getMessages(): Promise<ContactMessage[]> {
    return [...messages].sort((a, b) => b.timestamp - a.timestamp)
  }

  // Mark message as read
  static async markAsRead(messageId: string): Promise<void> {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      message.read = true
    }
  }

  // Delete message
  static async deleteMessage(messageId: string): Promise<void> {
    messages = messages.filter(m => m.id !== messageId)
  }

  // Subscribe to messages (simplified - no real-time updates)
  static subscribeToMessages(callback: (messages: ContactMessage[]) => void): () => void {
    // Initial load
    callback([...messages])

    // Return unsubscribe function (no-op for this simple implementation)
    return () => {}
  }
}

// Initialize with some demo messages for testing
if (messages.length === 0) {
  SimpleContactInboxService.sendMessage({
    name: 'Demo User',
    email: 'demo@example.com',
    message:
      'This is a demo message to show how the inbox works. In a real implementation, this would be connected to a proper database.'
  })
}
