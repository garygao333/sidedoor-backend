'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import ChatInterface from '../components/ChatInterface'
import ChatSearchBar from '../components/ChatSearchBar'
import MediaPlayer from '../components/MediaPlayer'
import StarBorderButton from '../components/StarBorderButton'
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
  const [extractingVideo, setExtractingVideo] = useState(false)
  const { user, addSearchHistory, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Video extraction service
  const extractDirectVideoUrl = async (url: string): Promise<string | null> => {
    try {
      // Archive.org extraction
      if (url.includes('archive.org/details/')) {
        const match = url.match(/archive\.org\/details\/([^\/\?]+)/)
        if (!match) return null
        
        const identifier = match[1]
        
        const response = await fetch(`https://archive.org/metadata/${identifier}`)
        const data = await response.json()
        
        // Find the best video file (MP4 preferred)
        const videoFiles = data.files?.filter((file: any) => 
          file.format === 'h.264' || 
          file.format === 'MP4' || 
          file.name?.endsWith('.mp4') ||
          file.name?.endsWith('.webm')
        )
        
        if (videoFiles && videoFiles.length > 0) {
          const sortedVideos = videoFiles.sort((a: any, b: any) => {
            // Prefer MP4 format
            if (a.name?.endsWith('.mp4') && !b.name?.endsWith('.mp4')) return -1
            if (!a.name?.endsWith('.mp4') && b.name?.endsWith('.mp4')) return 1
            
            // Then sort by size (larger = higher quality)
            return parseInt(b.size || '0') - parseInt(a.size || '0')
          })
          
          const bestVideo = sortedVideos[0]
          return `https://archive.org/download/${identifier}/${bestVideo.name}`
        }
      }
      
      // Vimeo extraction (basic)
      if (url.includes('vimeo.com/')) {
        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
        if (videoId) {
          try {
            const response = await fetch(`https://vimeo.com/api/v2/video/${videoId}.json`)
            const data = await response.json()
            if (data[0]?.mp4) {
              // Try to get the highest quality
              return data[0].mp4.hd || data[0].mp4.sd || data[0].mp4.mobile
            }
          } catch (error) {
            console.error('Vimeo extraction failed:', error)
          }
        }
      }
      
      // Direct video file URLs
      if (url.match(/\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i)) {
        return url
      }
      
      return null
    } catch (error) {
      console.error('Failed to extract direct video URL:', error)
      return null
    }
  }

  // Agent function to process scraped video URLs
  const processVideoUrls = async (urls: string[]): Promise<{ originalUrl: string, directUrl: string | null, title?: string }[]> => {
    const results = []
    
    for (const url of urls) {
      try {
        setExtractingVideo(true)
        const directUrl = await extractDirectVideoUrl(url)
        
        // Try to get video title/metadata
        let title = 'Video'
        if (url.includes('archive.org')) {
          const identifier = url.match(/archive\.org\/details\/([^\/\?]+)/)?.[1]
          if (identifier) {
            try {
              const response = await fetch(`https://archive.org/metadata/${identifier}`)
              const data = await response.json()
              title = data.metadata?.title || identifier.replace(/[-_]/g, ' ')
            } catch (e) {
              title = identifier.replace(/[-_]/g, ' ')
            }
          }
        }
        
        results.push({
          originalUrl: url,
          directUrl,
          title
        })
      } catch (error) {
        console.error(`Failed to process video URL ${url}:`, error)
        results.push({
          originalUrl: url,
          directUrl: null
        })
      }
    }
    
    setExtractingVideo(false)
    return results
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSearchComplete = useCallback(() => setIsSearching(false), [])

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Check if the query is "test" or "archive" and show media player
    if (searchQuery.toLowerCase().trim() === 'test' || searchQuery.toLowerCase().trim() === 'archive') {
      setCurrentQuery(searchQuery)
      setShowMediaPlayer(true)
      
      // Test with archive.org video - extract direct URL
      const testUrl = 'https://archive.org/details/tearsofsteelblendervfxopenmovie800p'
      
      try {
        setExtractingVideo(true)
        const directUrl = await extractDirectVideoUrl(testUrl)
        if (directUrl) {
          console.log('Extracted direct video URL:', directUrl)
          setMediaUrl(directUrl)
        } else {
          // Fallback to original URL
          setMediaUrl(testUrl)
        }
      } catch (error) {
        console.error('Video extraction failed:', error)
        setMediaUrl(testUrl)
      } finally {
        setExtractingVideo(false)
      }
      
      return
    }

    // Check if query contains video search intent
    const videoKeywords = ['video', 'watch', 'movie', 'film', 'documentary', 'tutorial', 'stream']
    const isVideoSearch = videoKeywords.some(keyword => 
      searchQuery.toLowerCase().includes(keyword)
    )

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
        body: JSON.stringify({ 
          q: searchQuery,
          extractVideos: isVideoSearch // Tell backend to look for videos
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentJobId(data.job_id)
        
        // If the response contains video URLs, process them
        if (data.videoUrls && data.videoUrls.length > 0) {
          const processedVideos = await processVideoUrls(data.videoUrls)
          
          // If we found direct video URLs, show media player
          const playableVideos = processedVideos.filter(v => v.directUrl)
          if (playableVideos.length > 0) {
            setShowMediaPlayer(true)
            setMediaUrl(playableVideos[0].directUrl!)
          }
        }
        
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
    setExtractingVideo(false)
  }

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-black/95 flex items-center justify-center">
        <div className="text-purple-300 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black/95">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-purple-900/30 backdrop-blur-sm border-r border-purple-500/30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo and New Chat */}
          <div className="p-3 border-b border-purple-500/30">
            <Link href="/" className="flex items-center space-x-2 mb-3 px-2">
              <Image 
                src="/logo1.png" 
                alt="Merg Logo" 
                width={20} 
                height={20} 
                className="w-5 h-5"
              />
              <span className="text-lg font-semibold text-purple-300">
                Merg
              </span>
            </Link>
            
            <StarBorderButton
              onClick={handleNewChat}
              size="sm"
              className="w-full"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Search</span>
            </StarBorderButton>
          </div>

          {/* Recent Chats Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-2 px-2">
                Recent
              </div>
              {/* You can add recent chat history here */}
              <div className="space-y-1">
                <div className="px-2 py-2 text-sm text-purple-300 hover:bg-purple-800/20 rounded-md cursor-pointer">
                  Previous search media...
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and User Section */}
          <div className="border-t border-purple-500/30">
            <div className="p-3">
              <nav className="space-y-1 mb-3">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-2 py-2 text-sm text-purple-200 hover:bg-purple-800/20 rounded-md transition-colors"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/discover"
                  className="flex items-center space-x-3 px-2 py-2 text-sm text-purple-200 hover:bg-purple-800/20 rounded-md transition-colors"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Discover</span>
                </Link>
              </nav>
              
              {/* User Section */}
              <div className="border-t border-purple-500/30 pt-3">
                <div className="flex items-center space-x-3 px-2 py-2 mb-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-purple-200 truncate flex-1">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-purple-200 hover:bg-purple-800/20 rounded-md transition-colors"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg shadow-sm backdrop-blur-sm"
      >
        {sidebarOpen ? (
          <XMarkIcon className="h-5 w-5 text-purple-200" />
        ) : (
          <Bars3Icon className="h-5 w-5 text-purple-200" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {!isSearching && !currentJobId && !showMediaPlayer ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center p-8 bg-black/95">
              <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-medium text-purple-100 mb-2">
                    How can I help you today?
                  </h1>
                  <p className="text-purple-300">
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
                  <StarBorderButton
                    onClick={() => handleSearch("test")}
                    variant="secondary"
                    className="!bg-purple-900/20 !text-purple-200 !border-purple-500/40 hover:!bg-purple-800/30 hover:!border-purple-400/60 text-left p-4 h-auto flex-col items-start space-y-1"
                  >
                    <div className="font-medium text-purple-100">Try video extraction</div>
                    <div className="text-sm text-purple-400">Type "test" to see direct video playback</div>
                  </StarBorderButton>
                  <StarBorderButton
                    onClick={() => handleSearch("Find documentary videos about AI")}
                    variant="secondary"
                    className="!bg-purple-900/20 !text-purple-200 !border-purple-500/40 hover:!bg-purple-800/30 hover:!border-purple-400/60 text-left p-4 h-auto flex-col items-start space-y-1"
                  >
                    <div className="font-medium text-purple-100">Find AI documentaries</div>
                    <div className="text-sm text-purple-400">Search and watch videos directly</div>
                  </StarBorderButton>
                  <StarBorderButton
                    onClick={() => handleSearch("Tutorial videos for web development")}
                    variant="secondary"
                    className="!bg-purple-900/20 !text-purple-200 !border-purple-500/40 hover:!bg-purple-800/30 hover:!border-purple-400/60 text-left p-4 h-auto flex-col items-start space-y-1"
                  >
                    <div className="font-medium text-purple-100">Web dev tutorials</div>
                    <div className="text-sm text-purple-400">Find and stream tutorial videos</div>
                  </StarBorderButton>
                  <StarBorderButton
                    onClick={() => handleSearch("Open source movie downloads")}
                    variant="secondary"
                    className="!bg-purple-900/20 !text-purple-200 !border-purple-500/40 hover:!bg-purple-800/30 hover:!border-purple-400/60 text-left p-4 h-auto flex-col items-start space-y-1"
                  >
                    <div className="font-medium text-purple-100">Open source movies</div>
                    <div className="text-sm text-purple-400">Discover free-to-watch films</div>
                  </StarBorderButton>
                </div>
              </div>
            </div>
          ) : showMediaPlayer ? (
            /* Media Player Interface */
            <div className="flex-1 flex flex-col min-h-0 relative">
              <div className="flex-1 overflow-y-auto p-6 bg-black/95 pb-24">
                <div className="max-w-4xl mx-auto w-full">
                  {/* Chat message showing the query */}
                  <div className="mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {user.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 max-w-xs">
                        <p className="text-purple-100">{currentQuery}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Response with Media Player */}
                  <div className="flex items-start space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-300 text-sm">🤖</span>
                    </div>
                    <div className="flex-1">
                      {extractingVideo ? (
                        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-3">
                          <p className="text-purple-100">🔍 Extracting video for direct playback...</p>
                        </div>
                      ) : (
                        <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-3">
                          <p className="text-purple-100">I found a video and extracted it for direct playback! Here it is:</p>
                        </div>
                      )}
                      
                      {!extractingVideo && (
                        <MediaPlayer 
                          url={mediaUrl}
                          title="Extracted Video"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating search bar */}
              <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto">
                <div className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-lg p-2 shadow-2xl">
                  <ChatSearchBar 
                    onSearch={handleSearch}
                    isSearching={isSearching}
                    placeholder="Search for more videos..."
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col min-h-0 relative">
              <div className="flex-1 overflow-hidden pb-16">
                <ChatInterface
                  jobId={currentJobId}
                  query={currentQuery}
                  isSearching={isSearching}
                  onSearchComplete={handleSearchComplete}
                />
              </div>
              
              {/* Floating search bar */}
              <div className="absolute bottom-4 left-4 right-4 max-w-xl mx-auto">
                <div className="bg-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-lg p-2 shadow-2xl">
                  <ChatSearchBar 
                    onSearch={handleSearch}
                    isSearching={isSearching}
                    placeholder="Ask a follow-up..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
