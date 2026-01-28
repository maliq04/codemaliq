'use client'

import { useState, useEffect } from 'react'
import { Save, Code } from 'lucide-react'

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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Configuration</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'form' ? 'json' : 'form')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Code size={20} />
            {viewMode === 'form' ? 'JSON Mode' : 'Form Mode'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {viewMode === 'form' ? (
        <div className="space-y-6">
          {/* Roadmap Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Roadmap Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={config.roadmaps?.title || ''}
                  onChange={(e) => updateRoadmap('title', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={config.roadmaps?.description || ''}
                  onChange={(e) => updateRoadmap('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Projects Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Projects</h2>
            <p className="text-sm text-gray-600 mb-2">
              Total Projects: {config.projects?.length || 0}
            </p>
            <p className="text-sm text-gray-500">
              Manage projects in the Projects section
            </p>
          </div>

          {/* Services Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Services</h2>
            <p className="text-sm text-gray-600 mb-2">
              Total Services: {config.services?.length || 0}
            </p>
            <p className="text-sm text-gray-500">
              Services are managed through the JSON editor or API
            </p>
          </div>

          {/* Ads/Promotions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Ads & Promotions</h2>
            <p className="text-sm text-gray-600 mb-2">
              Total Ads: {config.ads?.length || 0}
            </p>
            <p className="text-sm text-gray-500">
              Manage ads through the JSON editor
            </p>
          </div>

          {/* Quick Links / Social Media */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Social Links & Contact</h2>
            <p className="text-sm text-gray-500 mb-4">
              Social links are typically managed in environment variables or separate config files.
              Use JSON mode below to edit the full configuration including any social links stored here.
            </p>
            <button
              onClick={() => setViewMode('json')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Switch to JSON Mode
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">JSON Configuration</h2>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-2">
            Edit the JSON configuration directly. Be careful with syntax! Invalid JSON will not be saved.
          </p>
        </div>
      )}
    </div>
  )
}
