'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { CheckCircleIcon, ArrowDownTrayIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import FeedbackModal from './FeedbackModal'

interface ChatInterfaceProps {
  jobId: string | null
  query: string
  isSearching: boolean
  onSearchComplete: () => void
}

interface MediaPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

interface MovieResult {
  title: string;
  year: string | number;
  why: string;
  url: string;
  type?: string;
  quality?: string;
}

interface JobStatus {
  job_id: string;
  status: string;
  query: string;
  result?: {
    title: string;
    year?: string | number;
    why?: string;
    url: string;
  };
  results?: Array<{
    title: string;
    year?: string | number;
    why?: string;
    type?: string;
    quality?: string;
    file_id?: string;
    size?: number;
    verified?: boolean;
    url?: string;
  }>;
  created_at: string;
  completed_at?: string;
  logs?: Array<{type: string, message: string, timestamp: string}>;
  error?: string;
  data?: {
    result?: MovieResult;
  };
}

export default function ChatInterface({ jobId, query, isSearching, onSearchComplete }: ChatInterfaceProps) {
  // Base URL for backend API (set NEXT_PUBLIC_API_URL env variable in .env.local for production)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

  // Helper to build correct endpoint (uses '/api' proxy when API_BASE is blank)
  const buildUrl = (path: string) => (API_BASE ? `${API_BASE}${path}` : `/api${path}`)
  
  const [messages, setMessages] = useState<string[]>([])
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [showPlayer, setShowPlayer] = useState(false)
  const [playerUrl, setPlayerUrl] = useState('')
  const [playerTitle, setPlayerTitle] = useState('')

  // Enhanced MediaPlayer component for various video sources
  const EnhancedMediaPlayer = ({ url, title = "Media Player", onClose }: MediaPlayerProps) => {
    // Check if it's a YouTube URL
    const getYouTubeId = (url: string): string | null => {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = url.match(regex)
      return match ? match[1] : null
    }
    
    // Check if it's a Plex URL
    const isPlexUrl = (url: string): boolean => {
      return url.includes('plex.tv') || url.includes('watch.plex.tv')
    }
    
    // Check if it's a direct video file
    const isDirectVideo = (url: string): boolean => {
      return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url)
    }
    
    const videoId = getYouTubeId(url)
    
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mt-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          {videoId ? (
            // YouTube embed
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirectVideo(url) ? (
            // Direct video file
            <video
              className="absolute top-0 left-0 w-full h-full"
              controls
              preload="metadata"
            >
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : isPlexUrl(url) ? (
            // Plex or other streaming service - open in new tab
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <PlayIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <p className="text-white mb-4">This content is available on an external platform</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Watch on External Site</span>
                </a>
              </div>
            </div>
          ) : (
            // Generic iframe attempt
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={url}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        
        <div className="p-4 bg-gray-750">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              {videoId ? 'YouTube Player' : isDirectVideo(url) ? 'Direct Video' : isPlexUrl(url) ? 'External Stream' : 'Web Player'}
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle playing video
  const handlePlayVideo = (result: MovieResult) => {
    setPlayerUrl(result.url);
    setPlayerTitle(`${result.title} (${result.year})`);
    setShowPlayer(true);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!jobId) return

    // Reset messages for new search
    setMessages([`🔍 Starting search for: **${query}**`])

    // Build WebSocket URL (support relative + absolute backend URLs)
    const httpUrl = buildUrl(`/ws/${jobId}`) // returns e.g. "/api/ws/123" or "https://backend/ws/123"
    const wsUrl = httpUrl.replace(/^http/, 'ws') // http->ws, https->wss

    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('🔧 Debug - WebSocket message received:', data) // Debug log
        
        if (data.type === 'log' && data.message) {
          // live reasoning / search steps
          setMessages(prev => [...prev, `🤖 ${data.message}`])
        } else if (data.type === 'result' && data.result) {
          // Set the result directly from WebSocket
          console.log('🔧 Debug - Received result via WebSocket:', data.result) // Debug log
          setJobStatus(prev => ({
            ...prev, 
            result: data.result, 
            status: 'completed',
            job_id: jobId || '',
            query: query,
            created_at: new Date().toISOString()
          }))
          setMessages(prev => [
            ...prev, 
            `✅ **Search Complete!** Found playable movie: **${data.result.title}**`
          ])
          ws.close()
          onSearchComplete()
        } else if (data.type === 'status' && data.status === 'completed') {
          // Legacy completion - still call fetchJobStatus as fallback
          console.log('🔧 Debug - Received legacy completion status') // Debug log
          ws.close()
          onSearchComplete()
          fetchJobStatus()
        } else if (data.type === 'error' && data.message) {
          setMessages(prev => [...prev, `❌ ${data.message}`])
          ws.close()
          onSearchComplete()
        }
      } catch (err) {
        console.error('Error parsing WS data:', err)
      }
    }

    ws.onerror = (e) => {
      console.error('WebSocket error:', e)
      ws.close()
      onSearchComplete()
      fetchJobStatus()
    }

    return () => {
      ws.close()
    }
  }, [jobId, query, onSearchComplete])

  const fetchJobStatus = async () => {
    if (!jobId) return

    try {
      // Ensure we always hit the /api/poll endpoint regardless of API_BASE format
      const pollUrl = API_BASE ? `${API_BASE}/api/poll/${jobId}` : `/api/poll/${jobId}`
      console.log('🔧 Debug - Fetching job status from:', pollUrl) // Debug log
      const response = await fetch(pollUrl)
      if (response.ok) {
        const status = await response.json()
        console.log('🔧 Debug - Full status response:', status) // Debug log
        setJobStatus(status)
        
        // Handle movie result format - check multiple possible paths
        const movieResult = getMovieResult(status)
        console.log('🔧 Debug - Extracted movie result:', movieResult) // Debug log
        
        if (movieResult && movieResult.url) {
          console.log('🔧 Debug - Found movie result:', movieResult) // Debug log
          setMessages(prev => [
            ...prev,
            `✅ **Search Complete!** Found playable movie: **${movieResult.title}**`
          ])
        } else if (status.status === 'completed' && !movieResult) {
          console.log('🔧 Debug - Completed but no movie result found') // Debug log
          setMessages(prev => [
            ...prev,
            `❌ **No results found** for "${query}". Try a different search term.`
          ])
        } else if (status.status === 'error') {
          setMessages(prev => [
            ...prev,
            `❌ **Search failed:** ${status.error || 'Unknown error occurred'}`
          ])
        }
      } else {
        console.log('🔧 Debug - Response not OK:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching job status:', error)
    }
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
  }

  // Extract the movie result from various possible response structures
  const getMovieResult = (status: JobStatus): MovieResult | null => {
    console.log('🔧 Debug - getMovieResult called with:', status);
    
    // Check the result field first
    if (status.result?.url && status.result.title) {
      return {
        title: status.result.title,
        year: status.result.year || 'Unknown',
        why: status.result.why || '',
        url: status.result.url,
        type: 'video',
        quality: 'HD'
      };
    }
    
    // Check data.result for backward compatibility
    if (status.data?.result?.url && status.data.result.title) {
      return {
        title: status.data.result.title,
        year: status.data.result.year || 'Unknown',
        why: status.data.result.why || '',
        url: status.data.result.url,
        type: 'video',
        quality: 'HD'
      };
    }
    
    // Fallback: check if there's a results array with valid data
    if (status.results && status.results.length > 0) {
      const firstResult = status.results[0];
      if (firstResult.url && firstResult.title) {
        return {
          title: firstResult.title,
          year: firstResult.year || 'Unknown',
          why: firstResult.why || firstResult.type || '',
          url: firstResult.url,
          type: firstResult.type || 'video',
          quality: firstResult.quality || 'HD'
        };
      }
    }
    
    return null;
  }

  const movieResult = jobStatus ? getMovieResult(jobStatus) : null

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

      {/* Debug Info (remove this in production) */}
      {process.env.NODE_ENV === 'development' && jobStatus && (
        <div className="border border-yellow-500 rounded p-4 mb-4 bg-yellow-50 text-black">
          <h4 className="font-bold mb-2">🔧 Debug Info:</h4>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(jobStatus, null, 2)}
          </pre>
        </div>
      )}

      {/* Movie Result */}
      {movieResult && (
        <div className="border-t border-dark-700 pt-6">
          <h3 className="text-lg font-semibold mb-4">Found Movie</h3>
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">
                  {movieResult.title} {movieResult.year && `(${movieResult.year})`}
                </h4>
                {movieResult.why && (
                  <p className="text-sm text-gray-400 mb-2">
                    {movieResult.why}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center space-x-1 text-green-400">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Playable Link Found</span>
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePlayVideo(movieResult)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Watch Now</span>
                </button>
                <a
                  href={movieResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>Open Link</span>
                </a>
              </div>
            </div>
            
            {/* Display the found URL */}
            <div className="mt-3 p-3 bg-gray-800 rounded text-sm">
              <span className="text-gray-400">Playable URL: </span>
              <a 
                href={movieResult.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 break-all"
              >
                {movieResult.url}
              </a>
            </div>
          </div>
          
          {/* Video Player */}
          {showPlayer && (
            <EnhancedMediaPlayer
              url={playerUrl}
              title={playerTitle}
              onClose={() => setShowPlayer(false)}
            />
          )}
        </div>
      )}

      {/* No Results Message */}
      {jobStatus && jobStatus.status === 'completed' && !movieResult && !isSearching && (
        <div className="border-t border-dark-700 pt-6">
          <div className="bg-dark-700 rounded-lg p-6 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.35 0-4.438-.896-6-2.364" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Movies Found</h3>
            <p className="text-gray-400">
              We couldn't find any playable movies for "{query}". Try searching with different keywords or movie titles.
            </p>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && movieResult && (
        <FeedbackModal
          result={{
            title: movieResult.title || 'Unknown',
            type: movieResult.type || 'video',
            quality: movieResult.quality || 'HD'
          }}
          onSubmit={handleFeedback}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}