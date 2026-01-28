import { ref, onValue, update, push, serverTimestamp, set } from 'firebase/database'
import { realtimeDb } from '@/firebase'

// Types
export interface SocialLink {
  id: string
  title: string
  description: string
  href: string
  isActive: boolean
}

export interface ContactMessage {
  id?: string
  name: string
  email: string
  message: string
  timestamp: number
  read: boolean
}

export interface SocialLinksData {
  github: string
  linkedin: string
  npm: string
  discord: string
}

// Social Links Management
export class FirebaseSocialLinksService {
  
  // Initialize database with default data
  static async initializeDatabase(): Promise<void> {
    try {
      const defaultLinks: SocialLinksData = {
        github: 'https://github.com/maliq04',
        linkedin: 'https://www.linkedin.com/in/maliq-al-fathir/',
        npm: 'https://www.npmjs.com/~maliqalfathir',
        discord: 'https://discord.gg/76UFeGdXy6'
      }

      await set(ref(realtimeDb, 'contact_settings/links'), {
        ...defaultLinks,
        updatedAt: serverTimestamp()
      })

      console.log('Firebase database initialized with default social links')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  // Get current social links
  static subscribeToSocialLinks(callback: (links: SocialLinksData) => void): () => void {
    const linksRef = ref(realtimeDb, 'contact_settings/links')
    
    return onValue(linksRef, (snapshot) => {
      // IMPORTANT: Always provide fallback data to prevent infinite loading
      const data = snapshot.val()
      
      if (data && typeof data === 'object') {
        // Remove Firebase metadata and keep only the link data
        const { updatedAt, ...links } = data
        callback(links as SocialLinksData)
      } else {
        // If no data exists, return default values and initialize database
        const defaultLinks = this.getDefaultLinks()
        callback(defaultLinks)
        
        // Auto-initialize database in background
        this.initializeDatabase().catch(console.error)
      }
    }, (error) => {
      console.error('Firebase subscription error:', error)
      // On error, still provide default data to prevent loading state
      callback(this.getDefaultLinks())
    })
  }

  // Update social links
  static async updateSocialLinks(links: SocialLinksData): Promise<void> {
    try {
      const linksRef = ref(realtimeDb, 'contact_settings/links')
      await update(linksRef, {
        ...links,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Failed to update social links:', error)
      throw error
    }
  }

  // Get default social links (fallback)
  static getDefaultLinks(): SocialLinksData {
    return {
      github: 'https://github.com/maliq04',
      linkedin: 'https://www.linkedin.com/in/maliq-al-fathir/',
      npm: 'https://www.npmjs.com/~maliqalfathir',
      discord: 'https://discord.gg/76UFeGdXy6'
    }
  }
}

// Contact Messages Management
export class FirebaseContactInboxService {
  
  // Send a new message
  static async sendMessage(messageData: Omit<ContactMessage, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const messagesRef = ref(realtimeDb, 'inbox')
      
      const newMessage = {
        ...messageData,
        timestamp: serverTimestamp(),
        read: false
      }
      
      const result = await push(messagesRef, newMessage)
      return result.key!
    } catch (error) {
      console.error('Failed to send message to Firebase:', error)
      throw error
    }
  }

  // Subscribe to messages (for admin)
  static subscribeToMessages(callback: (messages: ContactMessage[]) => void): () => void {
    const messagesRef = ref(realtimeDb, 'inbox')
    
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      
      if (data && typeof data === 'object') {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          timestamp: data[key].timestamp || Date.now()
        })).sort((a, b) => b.timestamp - a.timestamp) // Most recent first
        
        callback(messagesList)
      } else {
        // Return empty array if no messages exist
        callback([])
      }
    }, (error) => {
      console.error('Firebase inbox subscription error:', error)
      // On error, return empty array to prevent loading state
      callback([])
    })
  }

  // Mark message as read
  static async markAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = ref(realtimeDb, `inbox/${messageId}`)
      await update(messageRef, { read: true })
    } catch (error) {
      console.error('Failed to mark message as read:', error)
      throw error
    }
  }

  // Delete message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = ref(realtimeDb, `inbox/${messageId}`)
      await set(messageRef, null) // Setting to null deletes the node
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error
    }
  }
}