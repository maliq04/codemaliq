'use client'

import { useState } from 'react'
import ContactLinksManager from './ContactLinksManager'
import SocialLinksManager from './SocialLinksManager'
import ContactInboxManager from './ContactInboxManager'

export default function ContactsList() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'links' | 'social'>('inbox')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inbox'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📧 Inbox
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'social'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔗 Social Links
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'links'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
