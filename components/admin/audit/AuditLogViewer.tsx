'use client'

import { useEffect, useState } from 'react'

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit')
      const result = await response.json()
      if (result.success) {
        setLogs(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Admin</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {logs.map(log => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{log.adminName || log.adminEmail}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      log.action === 'create'
                        ? 'bg-green-100 text-green-700'
                        : log.action === 'update'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{log.resourceType}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{log.resourceTitle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
