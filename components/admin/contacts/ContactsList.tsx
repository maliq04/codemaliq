'use client'

import { useState } from 'react'

import ContactInboxManager from './ContactInboxManager'
import ContactLinksManager from './ContactLinksManager'
import SocialLinksManager from './SocialLinksManager'

export default function ContactsList() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'links' | 'social'>('inbox')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'inbox'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            📧 Inbox
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'social'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            🔗 Social Links
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'links'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            📋 Contact Links
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inbox' ? (
        <ContactInboxManager />
      ) : activeTab === 'social' ? (
        <SocialLinksManager />
      ) : (
        <ContactLinksManager />
      )}
    </div>
  )
}
