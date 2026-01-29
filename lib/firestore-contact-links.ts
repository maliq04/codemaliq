import { db } from '@/firebase'
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore'

import { ContactLinksFallback } from './contact-links-fallback'

export interface ContactLink {
  id?: string
  title: string
  description: string
  url: string
  icon: string
  category: 'social' | 'professional' | 'community' | 'other'
  isActive: boolean
  order: number
  bgColor?: string // Background color for the card
  buttonText?: string // Custom button text
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

const COLLECTION_NAME = 'contact-links'

// Check if Firestore is available
async function isFirestoreAvailable(): Promise<boolean> {
  try {
    const testQuery = query(collection(db, 'test'))
    await getDocs(testQuery)
    return true
  } catch (error) {
    console.warn('Firestore unavailable, using fallback mode:', error)
    return false
  }
}

// Get all contact links (admin)
export const getAllContactLinks = async (): Promise<ContactLink[]> => {
  try {
    const firestoreAvailable = await isFirestoreAvailable()

    if (!firestoreAvailable) {
      console.log('Using fallback storage for contact links')
      return ContactLinksFallback.getAll().map(link => ({
        ...link,
        createdAt: link.createdAt ? Timestamp.fromDate(new Date(link.createdAt)) : undefined,
        updatedAt: link.updatedAt ? Timestamp.fromDate(new Date(link.updatedAt)) : undefined
      }))
    }

    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as ContactLink
    )
  } catch (error) {
    console.error('Error fetching contact links, using fallback:', error)
    return ContactLinksFallback.getAll().map(link => ({
      ...link,
      createdAt: link.createdAt ? Timestamp.fromDate(new Date(link.createdAt)) : undefined,
      updatedAt: link.updatedAt ? Timestamp.fromDate(new Date(link.updatedAt)) : undefined
    }))
  }
}

// Get active contact links only (public)
export const getActiveContactLinks = async (): Promise<ContactLink[]> => {
  try {
    const firestoreAvailable = await isFirestoreAvailable()

    if (!firestoreAvailable) {
      console.log('Using fallback storage for active contact links')
      return ContactLinksFallback.getActive().map(link => ({
        ...link,
        createdAt: link.createdAt ? Timestamp.fromDate(new Date(link.createdAt)) : undefined,
        updatedAt: link.updatedAt ? Timestamp.fromDate(new Date(link.updatedAt)) : undefined
      }))
    }

    const q = query(collection(db, COLLECTION_NAME), where('isActive', '==', true), orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as ContactLink
    )
  } catch (error) {
    console.error('Error fetching active contact links, using fallback:', error)
    return ContactLinksFallback.getActive().map(link => ({
      ...link,
      createdAt: link.createdAt ? Timestamp.fromDate(new Date(link.createdAt)) : undefined,
      updatedAt: link.updatedAt ? Timestamp.fromDate(new Date(link.updatedAt)) : undefined
    }))
  }
}

// Add new contact link
export const addContactLink = async (
  linkData: Omit<ContactLink, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    // Validate required fields
    if (!linkData.title || !linkData.url) {
      throw new Error('Title and URL are required')
    }

    // Validate URL format
    if (!linkData.url.startsWith('http://') && !linkData.url.startsWith('https://')) {
      throw new Error('URL must start with http:// or https://')
    }

    const firestoreAvailable = await isFirestoreAvailable()

    if (!firestoreAvailable) {
      console.log('Using fallback storage to add contact link')
      const newLink = ContactLinksFallback.add(linkData)
      return newLink.id
    }

    const docData = {
      ...linkData,
      order: Number(linkData.order), // Ensure order is a number
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData)
    return docRef.id
  } catch (error) {
    console.error('Error adding contact link:', error)
    throw error
  }
}

// Update contact link
export const updateContactLink = async (id: string, updateData: Partial<ContactLink>): Promise<void> => {
  try {
    const firestoreAvailable = await isFirestoreAvailable()

    if (!firestoreAvailable) {
      console.log('Using fallback storage to update contact link')
      
      // Convert Firestore types to fallback types
      const fallbackUpdateData: Partial<import('./contact-links-fallback').ContactLink> = {
        ...updateData,
        createdAt: updateData.createdAt instanceof Timestamp ? updateData.createdAt.toDate().toISOString() : updateData.createdAt,
        updatedAt: updateData.updatedAt instanceof Timestamp ? updateData.updatedAt.toDate().toISOString() : updateData.updatedAt
      }
      
      const updated = ContactLinksFallback.update(id, fallbackUpdateData)
      if (!updated) {
        throw new Error('Contact link not found')
      }
      return
    }

    const docRef = doc(db, COLLECTION_NAME, id)

    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp()
    }

    // Ensure order is a number if provided
    if (updateData.order !== undefined) {
      dataToUpdate.order = Number(updateData.order)
    }

    // Validate URL format if provided
    if (updateData.url && !updateData.url.startsWith('http://') && !updateData.url.startsWith('https://')) {
      throw new Error('URL must start with http:// or https://')
    }

    await updateDoc(docRef, dataToUpdate)
  } catch (error) {
    console.error('Error updating contact link:', error)
    throw error
  }
}

// Delete contact link
export const deleteContactLink = async (id: string): Promise<void> => {
  try {
    const firestoreAvailable = await isFirestoreAvailable()

    if (!firestoreAvailable) {
      console.log('Using fallback storage to delete contact link')
      const deleted = ContactLinksFallback.delete(id)
      if (!deleted) {
        throw new Error('Contact link not found')
      }
      return
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting contact link:', error)
    throw error
  }
}

// Initialize default contact links
export const initializeDefaultContactLinks = async (): Promise<ContactLink[]> => {
  try {
    // Check if any links already exist
    const existingLinks = await getAllContactLinks()
    if (existingLinks.length > 0) {
      return existingLinks
    }

    const defaultLinks: Omit<ContactLink, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'Explore the code',
        description: 'Explore the source code for all my projects on GitHub.',
        url: 'https://github.com/maliqalfathir',
        icon: 'github',
        category: 'professional',
        isActive: true,
        order: 1,
        bgColor: 'bg-slate-900',
        buttonText: 'Go to GitHub'
      },
      {
        title: "Let's connect",
        description: 'Connect for collaboration or explore my professional experience.',
        url: 'https://linkedin.com/in/maliqalfathir',
        icon: 'linkedin',
        category: 'professional',
        isActive: true,
        order: 2,
        bgColor: 'bg-blue-600',
        buttonText: 'Go to LinkedIn'
      },
      {
        title: 'Open source',
        description: 'Install and contribute to my open-source projects.',
        url: 'https://npmjs.com/~maliqalfathir',
        icon: 'npm',
        category: 'professional',
        isActive: true,
        order: 3,
        bgColor: 'bg-red-600',
        buttonText: 'Go to NPM'
      },
      {
        title: 'Chat with the community',
        description: 'Join over 1,000+ others developers on The Maliq Al Fathir Discord.',
        url: 'https://discord.gg/maliqalfathir',
        icon: 'discord',
        category: 'community',
        isActive: true,
        order: 4,
        bgColor: 'bg-purple-600',
        buttonText: 'Go to Discord'
      }
    ]

    const initializedLinks: ContactLink[] = []

    for (const link of defaultLinks) {
      const id = await addContactLink(link)
      initializedLinks.push({
        id,
        ...link,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }

    return initializedLinks
  } catch (error) {
    console.error('Error initializing default contact links:', error)
    throw error
  }
}
