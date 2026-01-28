import { Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'

import Container from '@/components/elements/Container'
import PageHeading from '@/components/elements/PageHeading'
import StructuredData from '@/components/elements/StructuredData'
import { Person, WithContext } from 'schema-dts'

import { METADATA } from '@/common/constant/metadata'
import { ICareer } from '@/common/types/careers'

import About from '@/modules/about'

export const metadata: Metadata = {
  title: `About Maliq Al Fathir`,
  description: `A short story of Maliq Al Fathir`,
  alternates: {
    canonical: `${process.env.DOMAIN}/about`
  }
}

function generateStructuredData(): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Maliq Al Fathir',
    url: METADATA.authors.url,
    image: METADATA.profile,
    jobTitle: 'Software Engineer',
    gender: 'Male'
  }
}

const PAGE_TITLE = `About ${METADATA.creator}`
const PAGE_DESCRIPTION = `A short story of ${METADATA.creator}`

export default async function AboutPage() {
  noStore()
  const careers = await getCareers()
  return (
    <>
      <StructuredData data={generateStructuredData()} />
      <Container data-aos="fade-left">
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <About careers={careers} />
      </Container>
    </>
  )
}

async function getCareers(): Promise<ICareer[]> {
  // Menghapus panggilan ke service eksternal dan mengembalikan array kosong
  // untuk menghilangkan ketergantungan.
  return []
}
