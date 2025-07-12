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
  columns = 4
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
      default: return '🎯'
    }
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'movie': return 'bg-red-600'
      case 'tv': return 'bg-blue-600'
      case 'book': return 'bg-green-600'
      case 'article': return 'bg-purple-600'
      case 'anime': return 'bg-pink-600'
      case 'social': return 'bg-indigo-600'
      case 'instagram': return 'bg-gradient-to-br from-purple-600 to-pink-600'
      case 'tiktok': return 'bg-black'
      case 'twitter': return 'bg-blue-500'
      case 'youtube': return 'bg-red-600'
      case 'video': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div 
      ref={containerRef}
      className="px-4 lg:px-12"
      style={{ 
        columns: columns,
        columnGap: '1rem',
        columnFill: 'balance'
      }}
    >
      {items.map((item, index) => {
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
                  <div className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-bold">
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
                  <button className="bg-white text-black px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
                    View
                  </button>
                  <button className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors">
                    Save
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
