import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'

import { getLearns, getPromotions, getServices } from '@/services/codemaliq'
import Container from '@/components/elements/Container'
import StructuredData from '@/components/elements/StructuredData'
import { Person, WithContext } from 'schema-dts'

import { METADATA } from '@/common/constant/metadata'
import { IAdsBanner } from '@/common/types/ads'
import { ILearn } from '@/common/types/codemaliq'
import { IServices } from '@/common/types/services'

import Home from '@/modules/home'
import { getBlogData } from '@/services/blog'

export const metadata: Metadata = {
  title: `Maliq Al Fathir | Personal Website`,
  alternates: {
    canonical: process.env.DOMAIN
  }
}

function generateStructuredData(): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Maliq Al Fathir',
    url: process.env.DOMAIN || '',
    image: METADATA.profile,
    jobTitle: 'Software Engineer',
    gender: 'Male'
  }
}

export default async function HomePage() {
  noStore()

  const [learnsData, pageServices, promotions, blogs] = await Promise.all([
    getLearns(),
    getServices(),
    getPromotions(),
    getBlogData()
  ])

  // Transform learnsData to match the type expected by the Home component
  const learns: ILearn[] = learnsData.map((item, index) => {
    // Use linkEnglish as primary href, fallback to linkIndonesia
    const primaryHref = item.linkEnglish || item.linkIndonesia || ''
    
    let finalHref = primaryHref
    // Automatically convert youtube shorts/watch link to embeddable format
    if (primaryHref.includes('youtube.com')) {
      const videoId = primaryHref.split('/').pop()?.split('?')[0]
      finalHref = `https://www.youtube.com/embed/${videoId}`
    }
    
    return {
      title: item.title,
      description: `Learn ${item.title} - Essential skills for web development`,
      href: finalHref,
      icon: item.icon,
      category: item.category,
      linkIndonesia: item.linkIndonesia,
      linkEnglish: item.linkEnglish,
      type: primaryHref.includes('youtube.com') ? 'video' : 'link'
    }
  })

  // Transform pageServices to match the type expected by the Home component
  const services: IServices[] = (pageServices || []).map(item => ({
    ...item,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  }))

  const promotion = promotions.find((item: IAdsBanner) => item.showingOn?.includes('/'))
  const about = {
    title: 'About Maliq Al Fathir',
    subtitle: 'A short story of Maliq Al Fathir',
    description: [
      "Hi! I am Maliq Al Fathir, a seasoned software engineer with a deep passion for creating elegant and efficient solutions through code. With a strong foundation in JavaScript and TypeScript, along with a comprehensive understanding of various frontend libraries and frameworks, I have been navigating the ever-evolving landscape of web development with enthusiasm and dedication. Currently, I reside in Jakarta, Indonesia 🇮🇩.",
      "As a fast learner and adaptive thinker, I thrive in dynamic environments where innovation is the driving force. My collaborative nature allows me to seamlessly integrate with teams, contributing not only my technical prowess but also a humble attitude that values every member's input.",
      "This blog is my platform to share insights, experiences, and discoveries from my journey as a software engineer. Join me as we delve into the ever-exciting realm of technology, where each line of code has the potential to shape the digital landscape in remarkable ways.",
      "Thank you for visiting, and I look forward to embarking on this knowledge-sharing adventure."
    ]
  };

  return (
    <>
      <StructuredData data={generateStructuredData()} />
      <Container data-aos="fade-left">
        <Home learns={learns} services={services} blogs={blogs} promotion={promotion || undefined} />
      </Container>
    </>
  )
}
