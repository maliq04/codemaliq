'use client'

import { motion } from 'framer-motion'

import { IProjectsItemProps } from '@/common/types/projects'

import ProjectCard from './ProjectCard'

export default function Projects({ projects }: IProjectsItemProps) {
  // Guard clause untuk menangani jika 'projects' undefined atau bukan array
  if (!Array.isArray(projects)) {
    return 'no data'
  }

  // Data dari GitHub tidak memiliki 'is_show', jadi kita tampilkan semua.
  const filteredProjects = projects

  if (filteredProjects.length === 0) {
    return 'no data'
  }
  return (
    <section className="grid gap-5 pt-2 sm:grid-cols-2 3xl:grid-cols-3">
      {filteredProjects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <ProjectCard {...project} />
        </motion.div>
      ))}
    </section>
  )
}
