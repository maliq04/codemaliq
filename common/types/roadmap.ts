interface RoadmapItem {
  title: string
  icon: string
  category: string
  linkIndonesia?: string
  linkEnglish?: string
}

export interface IRoadmap {
  title: string
  description: string
  list: RoadmapItem[]
}

export interface CourseCardProps {
  title: string
  icon: string
  category: string
  linkIndonesia?: string
  linkEnglish?: string
}
