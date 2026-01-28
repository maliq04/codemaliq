import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'

import BackButton from '@/components/elements/BackButton'
import Container from '@/components/elements/Container'
import PageHeading from '@/components/elements/PageHeading'
import { getLearnContentBySlug } from '@/services/learn'

import { METADATA } from '@/common/constant/metadata'

import ContentLists from '@/modules/learn/components/ContentLists'

interface LearnContentPage {
  params: { content: string }
}

type Props = {
  params: { content: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  noStore()
  const { content } = await getContent(params.content)
  return {
    title: `${content?.title} ${METADATA.exTitle}`,
    description: `${content?.description} on ${METADATA.openGraph.siteName}`,
    openGraph: {
      url: METADATA.openGraph.url,
      siteName: METADATA.openGraph.siteName,
      locale: METADATA.openGraph.locale,
      type: 'article',
      authors: METADATA.creator
    },
    keywords: content?.title,
    alternates: {
      canonical: `${METADATA.openGraph.url}/learn/${params.content}`
    }
  }
}

export default async function LearnContentPage({ params }: LearnContentPage) {
  const { content } = await getContent(params.content)
  if (!content) return null

  const { title, description } = content

  return (
    <>
      <Container data-aos="fade-left">
        <BackButton url="/learn" />
        <PageHeading title={title} description={description} />
        <ContentLists content={content} />
      </Container>
    </>
  )
}

async function getContent(contentSlug: string) {
  const content = await getLearnContentBySlug(contentSlug)

  if (!content) {
    return {
      redirect: {
        destination: '/404',
        permanent: false
      }
    }
  }
  return {
    content
  }
}
