'use client'

import { Code, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ConfigEditor() {
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config')
      const result = await response.json()
      if (result.success) {
        setConfig(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch config')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const result = await response.json()
      if (result.success) {
        alert('Configuration saved successfully!')
        fetchConfig() // Refresh to ensure we have the latest data
      } else {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const updateRoadmap = (field: string, value: any) => {
    setConfig({
      ...config,
      roadmaps: {
        ...config.roadmaps,
        [field]: value
      }
    })
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Configuration</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'json' : 'form')}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            <Code size={20} />
            {viewMode === 'form' ? 'JSON Mode' : 'Form Mode'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {viewMode === 'form' ? (
        <div className="space-y-6">
          {/* Roadmap Settings */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Roadmap Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={config.roadmaps?.title || ''}
                  onChange={e => updateRoadmap('title', e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  value={config.roadmaps?.description || ''}
                  onChange={e => updateRoadmap('description', e.target.value)}
                  rows={3}
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Projects Summary */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Projects</h2>
            <p className="mb-2 text-sm text-gray-600">Total Projects: {config.projects?.length || 0}</p>
            <p className="text-sm text-gray-500">Manage projects in the Projects section</p>
          </div>

          {/* Services Summary */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Services</h2>
            <p className="mb-2 text-sm text-gray-600">Total Services: {config.services?.length || 0}</p>
            <p className="text-sm text-gray-500">Services are managed through the JSON editor or API</p>
          </div>

          {/* Ads/Promotions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Ads & Promotions</h2>
            <p className="mb-2 text-sm text-gray-600">Total Ads: {config.ads?.length || 0}</p>
            <p className="text-sm text-gray-500">Manage ads through the JSON editor</p>
          </div>

          {/* Quick Links / Social Media */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Social Links & Contact</h2>
            <p className="mb-4 text-sm text-gray-500">
              Social links are typically managed in environment variables or separate config files. Use JSON mode below
              to edit the full configuration including any social links stored here.
            </p>
            <button
              onClick={() => setViewMode('json')}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Switch to JSON Mode
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">JSON Configuration</h2>
          <textarea
            value={JSON.stringify(config, null, 2)}
            onChange={e => {
              try {
                setConfig(JSON.parse(e.target.value))
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            rows={25}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Edit the JSON configuration directly. Be careful with syntax! Invalid JSON will not be saved.
          </p>
        </div>
      )}
    </div>
  )
}
