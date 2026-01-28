import { Metadata } from 'next'

import Container from '@/components/elements/Container'
import PageHeading from '@/components/elements/PageHeading'
import { getCodewarsServices } from '@/services/codewars'
import { getGithubData } from '@/services/github'
import { getMockGithubData } from '@/services/github-mock'

import { METADATA } from '@/common/constant/metadata'
import { CodewarsData } from '@/common/types/codewars'

import Dashboard from '@/modules/dashboard'

export const metadata: Metadata = {
  title: `Dashboard ${METADATA.exTitle}`,
  description: 'My activity dashboard as software engineer',
  alternates: {
    canonical: `${process.env.DOMAIN}/dashboard`
  }
}

const PAGE_TITLE = 'Dashboard'
const PAGE_DESCRIPTION =
  'This is my personal dashboard, built with Next.js API routes deployed as serverless functions.'

export default async function DahboardPage() {
  let githubData = null
  let codewarsData: CodewarsData | null = null

  try {
    githubData = await getGithubData()
  } catch (error) {
    console.error('Failed to fetch GitHub data:', error)
    // Use mock data for demonstration when real API fails
    githubData = getMockGithubData()
  }

  try {
    codewarsData = await getCodewarsServices()
  } catch (error) {
    console.error('Failed to fetch Codewars data:', error)
    // Use mock data for demonstration
    codewarsData = {
      id: 'mock-user',
      username: 'mockuser',
      name: 'Mock User',
      ranks: {
        overall: {
          rank: -5,
          name: '5 kyu',
          color: 'yellow',
          score: 0
        },
        languages: {}
      },
      honor: 476,
      clan: '',
      leaderboardPosition: 134447,
      skills: [],
      codeChallenges: {
        totalAuthored: 0,
        totalCompleted: 61
      }
    }
  }

  return (
    <>
      <Container data-aos="fade-left">
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <Dashboard githubData={githubData} codewarsData={codewarsData} />
      </Container>
    </>
  )
}
