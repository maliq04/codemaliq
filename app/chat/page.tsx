import { Metadata } from 'next'

import Container from '@/components/elements/Container'
import PageHeading from '@/components/elements/PageHeading'
import { User } from 'next-auth'
import { getServerSession } from 'next-auth/next'

import { METADATA } from '@/common/constant/metadata'
import { options } from '@/app/api/auth/[...nextauth]/options'

import ChatRoom from '@/modules/chat'

export const metadata: Metadata = {
  title: `Chat Room ${METADATA.exTitle}`,
  description: 'The community chat room for codemaliq.com',
  keywords: 'chat room, codemaliq, community',
  alternates: {
    canonical: `${process.env.DOMAIN}/chat`
  }
}

const PAGE_TITLE = 'Chat Room'
const PAGE_DESCRIPTION = 'Leave your impression or suggestion about this website here'

export default async function ChatRoomPage() {
  const session = await getServerSession(options)
  return (
    <>
      <Container data-aos="fade-left">
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <ChatRoom user={session?.user as User} />
      </Container>
    </>
  )
}
