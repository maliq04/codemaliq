import { Metadata } from 'next'

import { getCareers, getPromotions } from '@/services/codemaliq'

import { METADATA } from '@/common/constant/metadata'
import { IAdsBanner } from '@/common/types/ads'

import MeSection from '@/modules/me'

export const metadata: Metadata = {
  title: `Hi! ${METADATA.exTitle}`,
  description: 'Programming tips for software developer',
  keywords: 'frontend developer, software engineer, react js, javascript, typescript',
  alternates: {
    canonical: `${process.env.DOMAIN}/me`
  }
}

// Force dynamic rendering to avoid serialization issues
export const dynamic = 'force-dynamic'

export default async function MePage() {
  try {
    const [careers, promotions] = await Promise.all([
      getCareers().catch(() => []), // Fallback to empty array on error
      getPromotions().catch(() => []) // Fallback to empty array on error
    ])

    const promotion = promotions.filter((item: IAdsBanner) => item.showingOn && item.showingOn.includes('/me'))

    return <MeSection careers={careers} promotions={promotion} />
  } catch (error) {
    console.error('Error in MePage:', error)
    // Return a fallback component with empty data
    return <MeSection careers={[]} promotions={[]} />
  }
}
