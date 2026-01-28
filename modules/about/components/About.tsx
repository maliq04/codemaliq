'use client'

import Image from 'next/image'

import { METADATA } from '@/common/constant/metadata'
import { SOCIAL_MEDIA } from '@/common/constant/menu'
import { ICareer } from '@/common/types/careers'
import Breakline from '@/components/elements/Breakline'
import SocialMedia from '@/components/elements/SocialMedia'
import CVDownloadButton from '@/components/elements/CVDownloadButton'

import CareerList from './CareerList'
import SkillList from './SkillList'
import Summary from './Summary'

interface AboutProps {
  careers: ICareer[]
}

export default function About({ careers }: AboutProps) {
  const githubUsername = SOCIAL_MEDIA.find(item => item.id === 'GitHub')?.href.split('/').pop()
  const profileName = METADATA.creator

  return (
    <div className="flex flex-col-reverse lg:flex-row lg:gap-12">
      <div data-aos="fade-left" className="flex-1 space-y-6" suppressHydrationWarning={true}>
        <Summary />
        <Breakline />
        <CareerList careers={careers} />
        <CVDownloadButton />
        <Breakline />
        <SkillList />
      </div>
      <div data-aos="fade-right" className="mb-10 w-full flex-col items-center space-y-4 lg:mb-0 lg:w-4/12" suppressHydrationWarning={true}>
        <div className="flex flex-col items-center space-y-2">
          <Image
            src={METADATA.profile}
            width={150}
            height={150}
            alt="profile"
            className="rounded-full"
            style={{ objectFit: 'cover', width: 'auto', height: 'auto' }}
          />
          <div className="flex flex-col items-center">
            <h3 className="font-sora font-medium">{profileName}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">@{githubUsername}</p>
          </div>
        </div>
        <SocialMedia items={SOCIAL_MEDIA} />
      </div>
    </div>
  )
}
