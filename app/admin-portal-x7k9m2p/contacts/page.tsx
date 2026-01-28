import { Metadata } from 'next'
import ContactsList from '@/components/admin/contacts/ContactsList'

export const metadata: Metadata = {
  title: 'Contacts Management - Admin Portal',
  description: 'Manage contact messages and contact links'
}

export default function ContactsPage() {
  return <ContactsList />
}