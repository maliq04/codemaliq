'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { sendDataLayer } from '@/common/libs/gtm'
import { IAdsBanner } from '@/common/types/ads'

import { useMenu } from '@/stores/menu'

import MarqueeElement from './MarqueeElement'

interface RunningTextProps {
  ads?: IAdsBanner
}

export default function RunningText({ ads }: RunningTextProps) {
  const { isOpen } = useMenu()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  function onRedirect() {
    if (!ads?.url) return

    sendDataLayer({
      event: 'running_text_clicked',
      page_path: pathname
    })
    window.open(ads.url, '_blank', 'noopener,noreferrer')
  }

  // Tunda render sampai komponen ter-mount di client untuk menghindari hydration error
  if (!isMounted || !ads || isOpen) {
    return null
  }

  return (
    <button
      onClick={onRedirect}
      className="absolute left-0 right-0 top-[70px] z-50 flex w-full animate-enter-left bg-emerald-200 text-neutral-800 opacity-100 shadow-md dark:bg-emerald-100 lg:fixed lg:left-auto lg:top-0 lg:max-w-lg lg:rounded-bl-full lg:pl-2"
    >
      <MarqueeElement withPadding={false}>
        <p className="flex space-x-2 py-[2px] text-[10px] md:py-1 md:text-xs">{ads?.title}</p>
      </MarqueeElement>
    </button>
  )
}
