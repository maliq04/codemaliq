'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import { useTheme } from 'next-themes'

import { BLOG_LINK } from '@/common/constant/menu'
import { cn } from '@/common/libs/cn'
import { useBranding } from '@/components/providers/BrandingProvider'
import DynamicLogo from '@/components/elements/DynamicLogo'

export default function BlogHeader() {
  const { resolvedTheme } = useTheme()
  const { branding } = useBranding()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24 3xl:h-40 3xl:w-40">
        <DynamicLogo
          width={96}
          height={96}
          className="rounded-full object-cover w-full h-full border-2 border-neutral-200 dark:border-neutral-700 shadow-lg"
          alt={branding.brandName}
        />
      </div>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-500 3xl:text-lg">
        {branding.brandDescription}
      </p>

      <nav className="my-6 flex w-full justify-between gap-4 border-y border-neutral-200 p-3 dark:border-neutral-800 md:w-max md:justify-center md:gap-10">
        {BLOG_LINK.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={cn(
              'text-sm 3xl:text-lg',
              activeCategory === link.value
                ? 'text-emerald-500 dark:text-emerald-300'
                : 'text-neutral-500 dark:text-neutral-300'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
