import { Metadata } from 'next'

import Container from '@/components/elements/Container'
import PageHeading from '@/components/elements/PageHeading'
import { METADATA } from '@/common/constant/metadata'
import Projects from '@/modules/projects/components/Projects'
import { getProjects } from '@/services/codemaliq'

export const metadata: Metadata = {
  title: `Projects ${METADATA.exTitle}`,
  description: 'My projects collection',
  keywords: 'projects, portfolio, maliq al fathir, frontend developer, software engineer',
  alternates: {
    canonical: `${process.env.DOMAIN}/projects`
  }
}

const PAGE_TITLE = 'Projects'
const PAGE_DESCRIPTION = 'My projects collection'

export default async function ProjectsPage() {
  const projects = await getProjects()
  return (
    <Container data-aos="fade-up">
      <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
      <Projects projects={projects} />
    </Container>
  )
}