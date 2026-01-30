// Fallback system for contact links when Firestore is unavailable
export interface ContactLink {
  id: string
  title: string
  description: string
  url: string
  icon: string
  category: 'social' | 'professional' | 'community' | 'other'
  isActive: boolean
  order: number
  bgColor?: string
  buttonText?: string
  createdAt?: string
  updatedAt?: string
}

const STORAGE_KEY = 'contact_links_fallback'

// Default contact links for fallback
const defaultContactLinks: ContactLink[] = [
  {
    id: 'github-link',
    title: 'Explore the code',
    description: 'Explore the source code for all my projects on GitHub.',
    url: 'https://github.com/maliqalfathir',
    icon: 'github',
    category: 'professional',
    isActive: true,
    order: 1,
    bgColor: 'bg-slate-900',
    buttonText: 'Go to GitHub',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'linkedin-link',
    title: "Let's connect",
    description: 'Connect for collaboration or explore my professional experience.',
    url: 'https://linkedin.com/in/maliqalfathir',
    icon: 'linkedin',
    category: 'professional',
    isActive: true,
    order: 2,
    bgColor: 'bg-blue-600',
    buttonText: 'Go to LinkedIn',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'npm-link',
    title: 'Open source',
    description: 'Install and contribute to my open-source projects.',
    url: 'https://npmjs.com/~maliqalfathir',
    icon: 'npm',
    category: 'professional',
    isActive: true,
    order: 3,
    bgColor: 'bg-red-600',
    buttonText: 'Go to NPM',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'discord-link',
    title: 'Chat with the community',
    description: 'Join over 1,000+ others developers on The Maliq Al Fathir Discord.',
    url: 'https://discord.gg/maliqalfathir',
    icon: 'discord',
    category: 'community',
    isActive: true,
    order: 4,
    bgColor: 'bg-purple-600',
    buttonText: 'Go to Discord',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Fallback functions for local storage
export class ContactLinksFallback {
  static getAll(): ContactLink[] {
    if (typeof window === 'undefined') return defaultContactLinks

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }

      // Initialize with default links
      this.setAll(defaultContactLinks)
      return defaultContactLinks
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultContactLinks
    }
  }

  static getActive(): ContactLink[] {
    return this.getAll()
      .filter(link => link.isActive)
      .sort((a, b) => a.order - b.order)
  }

  static setAll(links: ContactLink[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  static add(link: Omit<ContactLink, 'id' | 'createdAt' | 'updatedAt'>): ContactLink {
    const newLink: ContactLink = {
      ...link,
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const links = this.getAll()
    links.push(newLink)
    this.setAll(links)

    return newLink
  }

  static update(id: string, updates: Partial<ContactLink>): ContactLink | null {
    const links = this.getAll()
    const index = links.findIndex(link => link.id === id)

    if (index === -1) return null

    links[index] = {
      ...links[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.setAll(links)
    return links[index]
  }

  static delete(id: string): boolean {
    const links = this.getAll()
    const filteredLinks = links.filter(link => link.id !== id)

    if (filteredLinks.length === links.length) return false

    this.setAll(filteredLinks)
    return true
  }

  static clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }
}
