'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatInterface from '../components/ChatInterface'
import ChatSearchBar from '../components/ChatSearchBar'
import MediaPlayer from '../components/MediaPlayer'
import Link from 'next/link'
import Image from 'next/image'
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  HomeIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function ChatPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [currentQuery, setCurrentQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMediaPlayer, setShowMediaPlayer] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const { user, addSearchHistory, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Check if the query is "test" and show media player
    if (searchQuery.toLowerCase().trim() === 'test') {
      setCurrentQuery(searchQuery)
      setShowMediaPlayer(true)
      setMediaUrl('https://www.youtube.com/watch?v=L0MK7qz13bU&list=RDL0MK7qz13bU&start_radio=1')
      return
    }

    setCurrentQuery(searchQuery)
    setIsSearching(true)
    setCurrentJobId(null)
    setShowMediaPlayer(false)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: searchQuery }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentJobId(data.job_id)
        
        // Save search to history
        try {
          await addSearchHistory(searchQuery, { job_id: data.job_id })
        } catch (error) {
          console.error('Failed to save search history:', error)
        }
      } else {
        console.error('Search failed')
        setIsSearching(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setIsSearching(false)
    }
  }, [addSearchHistory])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Handle query parameter from discover page
  useEffect(() => {
    const queryFromUrl = searchParams.get('q')
    if (queryFromUrl && user) {
      handleSearch(queryFromUrl)
    }
  }, [searchParams, user, handleSearch])

  const handleNewChat = () => {
    setCurrentQuery('')
    setCurrentJobId(null)
    setIsSearching(false)
    setShowMediaPlayer(false)
    setMediaUrl('')
  }

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-300 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo and New Chat */}
          <div className="p-3 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-2 mb-3 px-2">
              <Image 
                src="/logo1.png" 
                alt="Merg Logo" 
                width={20} 
                height={20} 
                className="w-5 h-5"
              />
              <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
                Merg
              </span>
            </Link>
            
            <button
              onClick={handleNewChat}
              className="flex items-center space-x-2 w-full px-3 py-2.5 text-sm text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Search</span>
            </button>
          </div>

          {/* Recent Chats Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">
                Recent
              </div>
              {/* You can add recent chat history here */}
              <div className="space-y-1">
                <div className="px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md cursor-pointer">
                  Previous search media...
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and User Section */}
          <div className="border-t border-gray-700">
            <div className="p-3">
              <nav className="space-y-1 mb-3">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/discover"
                  className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Discover</span>
                </Link>
              </nav>
              
              {/* User Section */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex items-center space-x-3 px-2 py-2 mb-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-200 truncate flex-1">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 border border-gray-600 rounded-lg shadow-sm"
      >
        {sidebarOpen ? (
          <XMarkIcon className="h-5 w-5 text-gray-200" />
        ) : (
          <Bars3Icon className="h-5 w-5 text-gray-200" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!isSearching && !currentJobId && !showMediaPlayer ? (
            /* Welcome Screen - Claude-like */
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
              <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-medium text-white mb-2">
                    How can I help you today?
                  </h1>
                  <p className="text-gray-300">
                    Ask me to search the hidden corners of the internet using AI-powered deep search
                  </p>
                </div>
                
                {/* Search Input */}
                <div className="w-full">
                  <ChatSearchBar 
                    onSearch={handleSearch}
                    isSearching={isSearching}
                    placeholder="Ask me anything..."
                  />
                </div>
                
                {/* Example prompts */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSearch("test")}
                    className="p-4 text-left border border-gray-600 bg-gray-800 rounded-lg hover:border-gray-500 hover:bg-gray-750 transition-all"
                  >
                    <div className="font-medium text-white mb-1">Try media player</div>
                    <div className="text-sm text-gray-400">Type "test" to see a demo video</div>
                  </button>
                  <button
                    onClick={() => handleSearch("Latest AI research papers")}
                    className="p-4 text-left border border-gray-600 bg-gray-800 rounded-lg hover:border-gray-500 hover:bg-gray-750 transition-all"
                  >
                    <div className="font-medium text-white mb-1">Latest AI research papers</div>
                    <div className="text-sm text-gray-400">Find cutting-edge research publications</div>
                  </button>
                  <button
                    onClick={() => handleSearch("Open source alternatives to popular software")}
                    className="p-4 text-left border border-gray-600 bg-gray-800 rounded-lg hover:border-gray-500 hover:bg-gray-750 transition-all"
                  >
                    <div className="font-medium text-white mb-1">Open source alternatives</div>
                    <div className="text-sm text-gray-400">Discover free software alternatives</div>
                  </button>
                  <button
                    onClick={() => handleSearch("Best practices for web development 2025")}
                    className="p-4 text-left border border-gray-600 bg-gray-800 rounded-lg hover:border-gray-500 hover:bg-gray-750 transition-all"
                  >
                    <div className="font-medium text-white mb-1">Web development best practices</div>
                    <div className="text-sm text-gray-400">Learn modern development techniques</div>
                  </button>
                </div>
              </div>
            </div>
          ) : showMediaPlayer ? (
            /* Media Player Interface */
            <div className="flex-1 flex flex-col p-6 bg-gray-900">
              <div className="max-w-4xl mx-auto w-full">
                {/* Chat message showing the query */}
                <div className="mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 max-w-xs">
                      <p className="text-white">{currentQuery}</p>
                    </div>
                  </div>
                </div>
                
                {/* AI Response with Media Player */}
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 text-sm">🤖</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg p-3 mb-3">
                      <p className="text-white">I found a great video for you! Here it is:</p>
                    </div>
                    <MediaPlayer 
                      url={mediaUrl}
                      title="Test Video"
                    />
                  </div>
                </div>
              </div>
              
              {/* Fixed bottom search bar for new messages */}
              <div className="border-t border-gray-700 bg-gray-900 mt-auto">
                <ChatSearchBar 
                  onSearch={handleSearch}
                  isSearching={isSearching}
                  placeholder="Ask a follow-up..."
                />
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <ChatInterface
                  jobId={currentJobId}
                  query={currentQuery}
                  isSearching={isSearching}
                  onSearchComplete={() => setIsSearching(false)}
                />
              </div>
              
              {/* Fixed bottom search bar for new messages */}
              <div className="border-t border-gray-700 bg-gray-900">
                <ChatSearchBar 
                  onSearch={handleSearch}
                  isSearching={isSearching}
                  placeholder="Ask a follow-up..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
