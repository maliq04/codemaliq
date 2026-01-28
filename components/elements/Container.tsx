'use client'

import { useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState, Suspense } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  [propName: string]: ReactNode | string | undefined
  withMarginTop?: boolean
}

function ContainerContent({ children, className = '', withMarginTop = true, ...others }: ContainerProps) {
  const searchParams = useSearchParams()
  const readMode = searchParams?.get('read-mode')

  return (
    <div
      data-testid="container"
      className={`mb-10 ${(readMode !== 'true' || withMarginTop) && 'mt-6'} p-4 md:p-8 lg:pr-0 ${className}`}
      suppressHydrationWarning={true}
      {...others}
    >
      {children}
    </div>
  )
}

export default function Container(props: ContainerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a basic container without search params during SSR
    return (
      <div
        data-testid="container"
        className={`mb-10 mt-6 p-4 md:p-8 lg:pr-0 ${props.className || ''}`}
        suppressHydrationWarning={true}
      >
        {props.children}
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div
        data-testid="container"
        className={`mb-10 mt-6 p-4 md:p-8 lg:pr-0 ${props.className || ''}`}
        suppressHydrationWarning={true}
      >
        {props.children}
      </div>
    }>
      <ContainerContent {...props} />
    </Suspense>
  )
}
