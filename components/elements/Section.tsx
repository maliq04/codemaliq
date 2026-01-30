import { ReactNode } from 'react'

import { cn } from '@/common/libs/cn'

interface SectionProps {
  children: ReactNode
  className?: string
}

export default function Section({ children, className }: SectionProps) {
  return <section className={cn('py-8', className)}>{children}</section>
}
