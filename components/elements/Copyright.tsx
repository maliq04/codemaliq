'use client'

import { useEffect, useState } from 'react'

export default function Copyright({ isHover }: { isHover: boolean }) {
  const [currentYear, setCurrentYear] = useState(2024) // Default fallback year

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <div className="font-sora flex items-center gap-1 px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 3xl:text-lg">
      {isHover ? (
        <>
          <span>©</span>
          <span>{currentYear}</span>
          <span>with</span>
          <span data-testid="love" className="animate-pulse text-red-500">
            ❤
          </span>
          <span>by</span>
          <span className="cursor-pointer hover:dark:text-neutral-400">codemaliq</span>
        </>
      ) : (
        <span data-testid="love" className="animate-pulse text-red-500">
          ❤
        </span>
      )}
    </div>
  )
}
