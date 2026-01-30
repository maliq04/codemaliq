import { Metadata } from 'next'

import ChatModeration from '@/components/admin/chat/ChatModeration'

export const metadata: Metadata = {
  title: 'Chat Moderation - Admin',
  robots: 'noindex, nofollow'
}

export default function ChatModerationPage() {
  return <ChatModeration />
}
