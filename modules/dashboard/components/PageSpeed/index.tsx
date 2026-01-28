'use client'

import Link from 'next/link'

import Breakline from '@/components/elements/Breakline'
import SectionHeading from '@/components/elements/SectionHeading'
import SectionSubHeading from '@/components/elements/SectionSubHeading'
import { fetcher } from '@/services/fetcher'
import { getMockPageSpeedData } from '@/services/pagespeed-mock'
import { useEffect, useState } from 'react'
import { MdSpeed } from 'react-icons/md'
import useSwr from 'swr'

import { PAGESPEED_CATEGORIES, PAGESPEED_URL } from '@/common/constant'

import BadgeSection from './BadgeSection'
import SpeedSection from './SpeedSection'

export default function PageSpeed() {
  const BASE_URL = process.env.NEXT_PUBLIC_PAGE_SPEED_API
  const [mockData, setMockData] = useState<any>(null)
  const [url, setUrl] = useState(BASE_URL ? BASE_URL + PAGESPEED_CATEGORIES : '')
  const [active, setActive] = useState('/')

  const { data, isLoading, mutate, error } = useSwr(url, fetcher)

  // Use mock data when API is not configured
  useEffect(() => {
    if (!BASE_URL) {
      setMockData(getMockPageSpeedData())
    }
  }, [BASE_URL])

  function refetch(path: string) {
    if (!BASE_URL) return
    setActive(path)
    setUrl(BASE_URL + path + PAGESPEED_CATEGORIES)
    mutate()
  }

  // Use mock data if API is not configured
  const displayData = mockData || data
  const displayLoading = !mockData && isLoading

  // Don't render if no data is available
  if (!displayData && !displayLoading) {
    return (
      <section>
        <SectionHeading title="Pagespeed Insight" icon={<MdSpeed className="mr-1" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">Unable to load PageSpeed data</p>
          <Link
            href={PAGESPEED_URL}
            target="_blank"
            passHref
            className="font-code text-sm text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 hover:dark:text-neutral-400"
          >
            PageSpeed
          </Link>
        </SectionSubHeading>
        <Breakline />
      </section>
    )
  }

  return (
    <section>
      <SectionHeading title="Pagespeed Insight" icon={<MdSpeed className="mr-1" />} />
      <SectionSubHeading>
        <p className="dark:text-neutral-400">
          {mockData ? 'Sample pagespeed metrics (demo data)' : 'My pagespeed index by google APIs'}
        </p>
        <Link
          href={PAGESPEED_URL}
          target="_blank"
          passHref
          className="font-code text-sm text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 hover:dark:text-neutral-400"
        >
          PageSpeed
        </Link>
      </SectionSubHeading>
      <BadgeSection active={active} refetch={refetch} />
      <SpeedSection data={displayData} isLoading={displayLoading} />

      <Breakline />
    </section>
  )
}
