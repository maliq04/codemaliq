'use client'

import { Input } from '@/components/ui/input'

export default function SearchInput() {
  return (
    <div>
      <Input type="search" placeholder="Search for articles..." className="w-full" />
    </div>
  )
}
