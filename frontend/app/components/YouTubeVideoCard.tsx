import React, { useState, useRef, useEffect } from 'react'
import { YouTubeVideo } from '../services/youtubeService'

interface YouTubeVideoCardProps {
  video: YouTubeVideo
  height: number
  onHover?: (isHovered: boolean) => void
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ 
  video, 
  height, 
  onHover 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.(true)
    
    // Start preview immediately on hover
    setShowIframe(true)
    setIsPlaying(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPlaying(false)
    setShowIframe(false)
    onHover?.(false)
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${video.id}&start=10`

  return (
    <div 
      className="relative overflow-hidden rounded-xl cursor-pointer group transition-all duration-300 hover:scale-[1.02] shadow-lg"
      style={{ height: `${height}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ 
          backgroundImage: `url(${video.thumbnail})`,
          filter: isHovered ? 'brightness(0.7)' : 'brightness(1)'
        }}
      />

      {/* Video Preview Iframe */}
      {showIframe && isPlaying && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ 
            opacity: isPlaying ? 1 : 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Play Button Overlay */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered && !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-red-600 rounded-full p-4 shadow-2xl transform hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {/* Duration Badge */}
        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold">
          {video.duration}
        </div>

        {/* Video Type Badge */}
        <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-xs font-bold">
          📺 Video
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm mb-1 line-clamp-2 leading-tight">
          {video.title}
        </h3>

        {/* Channel and Views */}
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span className="truncate mr-2">{video.channel}</span>
          <span className="flex-shrink-0">{video.views}</span>
        </div>

        {/* Published Date */}
        <div className="text-xs text-gray-400 mt-1">
          {new Date(video.publishedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Hover Effects */}
      <div className={`absolute inset-0 ring-2 ring-red-500/50 rounded-xl transition-all duration-300 ${isHovered ? 'ring-opacity-100' : 'ring-opacity-0'}`} />
    </div>
  )
}
