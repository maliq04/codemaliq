'use client'

import SectionHeading from '@/components/elements/SectionHeading'
import SectionSubHeading from '@/components/elements/SectionSubHeading'
import Skeleton from '@/components/elements/Skeleton'
import VideoPlayer from '@/components/elements/VideoPlayer'
import { fetcher } from '@/services/fetcher'
import { useEffect, useState } from 'react'
import { FaPhotoVideo } from 'react-icons/fa'
import useSWR from 'swr'

export default function Unwrapped() {
  const { data, isLoading } = useSWR('/api/unwrapped', fetcher)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  // Ambil data unwrapped dengan aman, pastikan data dan array tidak kosong.
  const unwrappedData = data?.data?.[0]

  return (
    <section>
      <div data-testid="unwrapped-section-heading" className="space-y-2">
        <SectionHeading title="Github Unwrapped" icon={<FaPhotoVideo className="mr-1" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">
            My coding journey on {isMounted && !isLoading && unwrappedData ? unwrappedData.years : '2023'}
          </p>
        </SectionSubHeading>
      </div>
      <div data-testid="unwrapped-video" className="mt-6 flex aspect-video flex-row items-center justify-center">
        {/* Tampilkan Skeleton sampai komponen ter-mount dan loading selesai */}
        {!isMounted || isLoading ? <Skeleton /> : <VideoPlayer url={unwrappedData?.url} />}
      </div>
    </section>
  )
}
