'use client'

import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/common/libs/cn'
import { IAdsBanner } from '@/common/types/ads'

interface AdsBannerProps {
  className?: string
  data: IAdsBanner
}

export default function AdsBanner({ className = 'h-full', data }: AdsBannerProps) {
  const fontSize = data.description.length < 40 ? 'text-xs md:text-sm' : 'text-[10px] md:text-xs'
  return (
    <Link
      href={data.url}
      className={cn(
        'glow-button text-neutral-800 after:bg-white dark:text-white dark:after:bg-dark',
        className,
        fontSize
      )}
      target="_blank"
    >
      <div className="flex items-center space-x-2 px-3 py-1">
        <Image src={data.image} alt="promote icon" width={30} height={30} style={{ width: 'auto', height: 'auto' }} />
        <p>{data.description || 'Iklan'}</p>
      </div>
    </Link>
  )
}
