'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

export default function ProjectsList() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/projects')
      const result = await response.json()

      if (result.success) {
        setProjects(result.data)
      } else {
        setError(result.error || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setProjects(projects.filter(p => p.id !== id))
        setDeleteConfirm(null)
      } else {
        alert(result.error || 'Failed to delete project')
      }
    } catch (err) {
      alert('Failed to delete project')
    }
  }

  const toggleVisibility = async (id: number, currentStatus: boolean) => {
    try {
      const project = projects.find(p => p.id === id)
      if (!project) return

      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          is_show: !currentStatus
        })
      })

      const result = await response.json()

      if (result.success) {
        setProjects(projects.map(p => (p.id === id ? result.data : p)))
      } else {
        alert(result.error || 'Failed to update project')
      }
    } catch (err) {
      alert('Failed to update project')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-12 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-gray-600">{projects.length} total projects</p>
        </div>
        <Link
          href="/admin-portal-x7k9m2p/projects/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Create New Project
        </Link>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">No projects found</div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
              <div className="flex gap-4">
                {project.image && (
                  <div className="relative h-28 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={project.image} alt={project.title} fill sizes="160px" className="object-cover" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                        {project.is_featured && (
                          <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                            Featured
                          </span>
                        )}
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            project.is_show ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {project.is_show ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">{project.description}</p>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {project.stacks?.map((stack: string) => (
                          <span key={stack} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            {stack}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        {project.link_demo && (
                          <a
                            href={project.link_demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            🔗 Demo
                          </a>
                        )}
                        {project.link_github && (
                          <a
                            href={project.link_github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            📦 GitHub
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleVisibility(project.id, project.is_show)}
                        className="rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        title={project.is_show ? 'Hide' : 'Show'}
                      >
                        {project.is_show ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button
                        onClick={() => router.push(`/admin-portal-x7k9m2p/projects/${project.id}`)}
                        className="rounded px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      {deleteConfirm === project.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(project.id)}
                          className="rounded px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
