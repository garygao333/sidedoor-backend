'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline'
import ChatInterface from './components/ChatInterface'
import Header from './components/Header'
import FadeContent from './components/FadeContent'
import AnimatedContent from './components/AnimatedContent'
import StarBorderButton from './components/StarBorderButton'
import Threads from './components/Threads'
import Footer from './components/Footer'

function HomePage() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [showDescription, setShowDescription] = useState(false)

  const titleText = "Merg"
  const subtitleText = "AI-Powered Deep Search"

  useEffect(() => {
    // Show description after a delay
    const timeout = setTimeout(() => {
      setShowDescription(true)
    }, 1500)

    return () => clearTimeout(timeout)
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setCurrentJobId(null)

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
      } else {
        console.error('Search failed')
        setIsSearching(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-50 to-gray-800">
      <Header />
      
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen flex items-center justify-center px-4">
        {/* Threads Background */}
        <div className="absolute inset-0 opacity-30">
          <Threads
            color={[0.5, 0.3, 0.8]}
            amplitude={0.8}
            distance={0.3}
            enableMouseInteraction={true}
          />
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto max-w-4xl">
          <FadeContent className="text-center">
            {/* Main Title */}
            <AnimatedContent animation="scale" delay={200}>
              <div className="mb-12">
                {/* Enhanced Split Text Animation for Title */}
                <h1 className="text-6xl font-bold leading-tight mb-6 overflow-hidden">
                  {titleText.split('').map((char, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent opacity-0"
                      style={{
                        animation: `fadeInUp 0.8s ease-out ${index * 0.15}s forwards`,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </h1>
                
                {/* Subtitle without typing effect */}
                <div className="text-xl text-gray-300 h-8 flex items-center justify-center mb-6">
                  <span className="font-mono tracking-wide">
                    {subtitleText}
                  </span>
                </div>
                
                {/* Enhanced Animated Description */}
                <div className={`text-base text-gray-400 mt-4 max-w-2xl mx-auto transition-all duration-1000 ${
                  showDescription 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-8'
                }`}>
                  <p className="leading-relaxed text-lg">
                    Find content across{' '}
                    <span className="relative">
                      <span className="text-purple-300 font-semibold bg-purple-900/20 px-2 py-1 rounded animate-pulse">
                        hidden corners
                      </span>
                    </span>{' '}
                    of the internet using{' '}
                    <span className="relative">
                      <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-bold">
                        intelligent AI agents
                      </span>
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 animate-pulse"></span>
                    </span>{' '}
                    that navigate complex sites and verify quality.
                  </p>
                </div>
              </div>
            </AnimatedContent>
            
            {/* Enhanced Search Bar */}
            <AnimatedContent animation="slideUp" delay={400}>
              <div className="max-w-2xl mx-auto">
                <div className="relative bg-dark-100 rounded-xl shadow-2xl border-2 border-gray-700 p-1 hover:border-purple-500 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-2xl group">
                  <div className="flex items-center">
                    <MagnifyingGlassIcon className="h-6 w-6 text-purple-400 ml-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                      placeholder="Enter your search query..."
                      className="flex-1 py-4 px-2 text-lg bg-transparent border-none outline-none placeholder-gray-500 font-medium text-gray-200 focus:placeholder-gray-400 transition-colors duration-200"
                      disabled={isSearching}
                    />
                    <button
                      onClick={() => handleSearch(query)}
                      disabled={isSearching || !query.trim()}
                      className={`
                        relative mr-1 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 overflow-hidden
                        ${isSearching || !query.trim() 
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95'
                        }
                      `}
                    >
                      {/* Glowing effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 transition-opacity duration-300 ${
                        !(isSearching || !query.trim()) ? 'hover:opacity-20' : ''
                      }`}></div>
                      
                      {/* Button content */}
                      <div className="relative flex items-center">
                        {isSearching ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            <span className="animate-pulse">Searching</span>
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="h-4 w-4 mr-2 animate-pulse" />
                            <span>Search</span>
                          </>
                        )}
                      </div>
                      
                      {/* Shimmer effect */}
                      {!(isSearching || !query.trim()) && (
                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedContent>
          </FadeContent>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Chat Interface */}
      {(isSearching || currentJobId) && (
        <section className="py-12 bg-dark-100">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <ChatInterface
                jobId={currentJobId}
                query={query}
                isSearching={isSearching}
                onSearchComplete={() => setIsSearching(false)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Footer - Only show when not searching */}
      {!isSearching && !currentJobId && <Footer />}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  return (
    <HomePage />
  )
}



