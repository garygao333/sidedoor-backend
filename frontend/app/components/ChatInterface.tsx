'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import FeedbackModal from './FeedbackModal'

interface ChatInterfaceProps {
  jobId: string | null
  query: string
  isSearching: boolean
  onSearchComplete: () => void
}

interface SearchResult {
  title: string
  type: string
  file_id: string
  size: number
  quality: string
  verified: boolean
}

interface JobStatus {
  job_id: string
  status: string
  query: string
  results: SearchResult[]
  created_at: string
  completed_at?: string
}

export default function ChatInterface({ jobId, query, isSearching, onSearchComplete }: ChatInterfaceProps) {
  // Base URL for backend API (set NEXT_PUBLIC_API_URL env variable in .env.local for production)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

  // Helper to build correct endpoint (uses '/api' proxy when API_BASE is blank)
  const buildUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : `/api${path}`)
  const [messages, setMessages] = useState<string[]>([])
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!jobId) return

    // Start with initial message
    setMessages([`🔍 Starting search for: **${query}**`])

    // Set up EventSource for real-time updates
    const eventSource = new EventSource(buildUrl(`/stream/${jobId}`))

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.status === 'complete') {
          eventSource.close()
          onSearchComplete()
          fetchJobStatus()
        } else if (data.message) {
          setMessages(prev => [...prev, `🤖 ${data.message}`])
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error)
      eventSource.close()
      onSearchComplete()
      fetchJobStatus()
    }

    // Cleanup
    return () => {
      eventSource.close()
    }
  }, [jobId, query, onSearchComplete])

  const fetchJobStatus = async () => {
    if (!jobId) return

    try {
      const response = await fetch(buildUrl(`/poll/${jobId}`))
      if (response.ok) {
        const status = await response.json()
        setJobStatus(status)
        
        if (status.results && status.results.length > 0) {
          setMessages(prev => [
            ...prev,
            `✅ **Search Complete!** Found ${status.results.length} result(s):`
          ])
        } else {
          setMessages(prev => [
            ...prev,
            `❌ **No results found** for "${query}". Try a different search term.`
          ])
        }
      }
    } catch (error) {
      console.error('Error fetching job status:', error)
    }
  }

  const handleDownload = (result: SearchResult) => {
    // Open download in new tab
    window.open(buildUrl(`/proxy?file_id=${result.file_id}`), '_blank')
    setSelectedResult(result)
    setShowFeedback(true)
  }

  const handleFeedback = async (verdict: string, reason?: string) => {
    if (!jobId) return

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          verdict,
          reason,
        }),
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }

    setShowFeedback(false)
    setSelectedResult(null)
  }

  return (
    <div className="card max-w-4xl mx-auto">
      {/* Chat Messages */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {message.startsWith('🔍') || message.startsWith('🤖') ? (
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
              ) : (
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 bg-dark-700 rounded-lg p-3">
              <ReactMarkdown className="text-sm prose prose-invert max-w-none">
                {message}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex-1 bg-dark-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-400">AI agents are searching...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Results */}
      {jobStatus?.results && jobStatus.results.length > 0 && (
        <div className="border-t border-dark-700 pt-6">
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="space-y-3">
            {jobStatus.results.map((result, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{result.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="capitalize">{result.type}</span>
                    <span>{result.quality}</span>
                    <span>{(result.size / 1024 / 1024).toFixed(1)} MB</span>
                    {result.verified && (
                      <span className="flex items-center space-x-1 text-green-400">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(result)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && selectedResult && (
        <FeedbackModal
          result={selectedResult}
          onSubmit={handleFeedback}
          onClose={() => {
            setShowFeedback(false)
            setSelectedResult(null)
          }}
        />
      )}
    </div>
  )
}
