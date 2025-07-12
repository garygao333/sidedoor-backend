'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { YouTubeVideoCard } from './YouTubeVideoCard'
import { YouTubeVideo } from '../services/youtubeService'

interface MasonryItem {
  id: string
  img?: string
  url?: string
  height: number
  title?: string
  type?: string
  rating?: number
  year?: number
  description?: string
  platform?: string
  // YouTube specific properties
  videoId?: string
  channel?: string
  views?: string
  duration?: string
  publishedAt?: string
  youtubeData?: YouTubeVideo
}

interface MasonryProps {
  items: MasonryItem[]
  ease?: string
  duration?: number
  stagger?: number
  animateFrom?: 'bottom' | 'top' | 'left' | 'right'
  scaleOnHover?: boolean
  hoverScale?: number
  blurToFocus?: boolean
  colorShiftOnHover?: boolean
  columns?: number
  onItemClick?: (item: MasonryItem) => void
}

export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  columns = 4,
  onItemClick
}: MasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const items = container.querySelectorAll('.masonry-item')
    
    // Animate items in
    gsap.fromTo(items, 
      {
        y: animateFrom === 'bottom' ? 100 : animateFrom === 'top' ? -100 : 0,
        x: animateFrom === 'left' ? -100 : animateFrom === 'right' ? 100 : 0,
        opacity: 0,
        scale: 0.8
      },
      {
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        duration,
        ease,
        stagger
      }
    )
  }, [items, ease, duration, stagger, animateFrom])

  const handleItemClick = (item: MasonryItem) => {
    console.log('Masonry handleItemClick called with item:', item)
    
    // Use the provided onItemClick handler if available
    if (onItemClick) {
      console.log('Using provided onItemClick handler')
      onItemClick(item)
      return
    }

    console.log('Using fallback behavior')
    // Fallback to default behavior
    if (item.url) {
      window.open(item.url, '_blank')
    } else if (item.videoId) {
      window.open(`https://www.youtube.com/watch?v=${item.videoId}`, '_blank')
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'movie': return '🎬'
      case 'tv': return '📺'
      case 'book': return '📚'
      case 'article': return '📄'
      case 'anime': return '🎌'
      case 'social': return '💬'
      case 'instagram': return '📸'
      case 'tiktok': return '🎵'
      case 'twitter': return '🐦'
      case 'youtube': return '📺'
      case 'video': return '📺'
      case 'text-search': return '🔍'
      default: return '🎯'
    }
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'movie': return 'bg-red-600/30 backdrop-blur-sm border border-red-400/30'
      case 'tv': return 'bg-blue-600/30 backdrop-blur-sm border border-blue-400/30'
      case 'book': return 'bg-green-600/30 backdrop-blur-sm border border-green-400/30'
      case 'article': return 'bg-purple-600/30 backdrop-blur-sm border border-purple-400/30'
      case 'anime': return 'bg-pink-600/30 backdrop-blur-sm border border-pink-400/30'
      case 'social': return 'bg-indigo-600/30 backdrop-blur-sm border border-indigo-400/30'
      case 'instagram': return 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-purple-400/30'
      case 'tiktok': return 'bg-black/30 backdrop-blur-sm border border-gray-400/30'
      case 'twitter': return 'bg-blue-500/30 backdrop-blur-sm border border-blue-400/30'
      case 'youtube': return 'bg-red-600/30 backdrop-blur-sm border border-red-400/30'
      case 'video': return 'bg-red-600/30 backdrop-blur-sm border border-red-400/30'
      case 'text-search': return 'bg-purple-600/30 backdrop-blur-sm border border-purple-400/30'
      default: return 'bg-gray-600/30 backdrop-blur-sm border border-gray-400/30'
    }
  }

  return (
    <div 
      ref={containerRef}
      className="px-4 lg:px-12"
      style={{ 
        columns: 5, // Increased from 4 to 6 for smaller cards
        columnGap: '0.6rem', // Smaller gap
        columnFill: 'balance'
      }}
    >
      {items.map((item, index) => {
        // Handle text-search items with special layout
        if (item.type === 'text-search') {
          return (
            <div
              key={item.id}
              className="masonry-item relative rounded-xl overflow-hidden cursor-pointer group transform transition-all duration-300 mb-4 break-inside-avoid hover:scale-[0.98] bg-black/20 backdrop-blur-md border border-white/20"
              style={{ 
                height: `${item.height}px`,
                display: 'inline-block',
                width: '100%'
              }}
              onClick={() => handleItemClick(item)}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full transform -translate-x-8 translate-y-8"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center">
                {/* AI Search Icon */}
                <div className="mb-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Search Text */}
                <h3 className="text-white font-bold text-lg leading-tight mb-3 px-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-200 text-sm opacity-80 mb-4">
                  {item.description}
                </p>

                {/* Search Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleItemClick(item)
                  }}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 border border-white/30"
                >
                  🔍 Search with AI
                </button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )
        }

        // Render YouTube video card if it's a YouTube video
        if (item.type === 'youtube' || item.type === 'video' || item.youtubeData) {
          const videoData: YouTubeVideo = item.youtubeData || {
            id: item.videoId || item.id,
            title: item.title || 'Unknown Video',
            channel: item.channel || 'Unknown Channel',
            views: item.views || '0 views',
            duration: item.duration || '0:00',
            publishedAt: item.publishedAt || new Date().toISOString(),
            thumbnail: item.img || '',
            description: item.description || '',
            channelId: '',
            viewCount: 0
          }

          return (
            <div
              key={item.id}
              className="masonry-item mb-4 break-inside-avoid"
              style={{ display: 'inline-block', width: '100%' }}
            >
              <YouTubeVideoCard 
                video={videoData}
                height={item.height}
                onHover={(isHovered) => {
                  if (scaleOnHover && isHovered) {
                    gsap.to(`.masonry-item:not(:hover)`, {
                      scale: hoverScale,
                      duration: 0.3,
                      ease: "power2.out"
                    })
                  } else if (scaleOnHover && !isHovered) {
                    gsap.to(`.masonry-item`, {
                      scale: 1,
                      duration: 0.3,
                      ease: "power2.out"
                    })
                  }
                }}
              />
            </div>
          )
        }

        // Regular masonry item for non-YouTube content
        return (
          <div
            key={item.id}
            className={`masonry-item relative rounded-xl overflow-hidden cursor-pointer group transform transition-all duration-300 mb-4 break-inside-avoid ${
              scaleOnHover ? 'hover:scale-[0.98]' : ''
            } ${blurToFocus ? 'hover:shadow-2xl' : ''}`}
            style={{ 
              height: `${item.height}px`,
              display: 'inline-block',
              width: '100%'
            }}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => {
              if (scaleOnHover) {
                gsap.to(`.masonry-item:not(:hover)`, {
                  scale: hoverScale,
                  duration: 0.3,
                  ease: "power2.out"
                })
              }
            }}
            onMouseLeave={() => {
              if (scaleOnHover) {
                gsap.to(`.masonry-item`, {
                  scale: 1,
                  duration: 0.3,
                  ease: "power2.out"
                })
              }
            }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={item.img}
                alt={item.title || 'Media item'}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  blurToFocus ? 'group-hover:scale-110' : ''
                } ${colorShiftOnHover ? 'group-hover:saturate-110 group-hover:brightness-110' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              {/* Top badges */}
              <div className="flex justify-between items-start">
                {item.type && (
                  <div className={`${getTypeColor(item.type)} text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1`}>
                    <span>{getTypeIcon(item.type)}</span>
                    <span className="capitalize">{item.type}</span>
                  </div>
                )}
                
                {item.rating && (
                  <div className="bg-black/30 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold border border-white/20">
                    ⭐ {item.rating}
                  </div>
                )}
              </div>

              {/* Bottom content */}
              <div className="space-y-2">
                {item.title && (
                  <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                    {item.title}
                  </h3>
                )}
                
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  {item.year && <span>{item.year}</span>}
                  {item.platform && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{item.platform}</span>
                    </>
                  )}
                </div>

                {item.description && (
                  <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.description}
                  </p>
                )}

                {/* Hover actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemClick(item)
                    }}
                    className="bg-white text-black px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    🔍 Search
                  </button>
                </div>
              </div>
            </div>

            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )
      })}
    </div>
  )
}
