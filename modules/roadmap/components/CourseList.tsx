'use client'

import { useSearchParams } from 'next/navigation'

import { IRoadmap } from '@/common/types/roadmap'

import CourseCard from './CourseCard'

/* eslint-disable react-hooks/exhaustive-deps */

export default function CourseList({ roadmaps }: { roadmaps: IRoadmap }) {
  const searchParams = useSearchParams()
  const tribe = searchParams.get('tribe')

  // Filter courses based on selected tribe/category
  const filteredCourses = tribe ? roadmaps.list.filter(course => course.category === tribe) : roadmaps.list

  return (
    <div className="mt-6 flex flex-col space-y-2">
      {filteredCourses.map((course, index) => (
        <CourseCard key={index} {...course} />
      ))}
    </div>
  )
}
