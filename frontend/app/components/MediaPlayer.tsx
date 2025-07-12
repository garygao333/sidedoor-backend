'use client'

import { useState } from 'react'
import { XMarkIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

interface MediaPlayerProps {
  url: string
  title?: string
  onClose?: () => void
}

export default function MediaPlayer({ url, title = "Media Player", onClose }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  
  // Check if it's a direct video file
  const isDirectVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|avi|mov)(\?|$)/i) || 
           url.includes('archive.org/download/')
  }
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getEmbedUrl = (url: string) => {
    // If it's a direct video file, return as-is
    if (isDirectVideo(url)) {
      return url
    }

    // Handle YouTube URLs
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url
    }

    // Handle archive.org embed URLs
    if (url.includes('archive.org/details/')) {
      const videoId = url.split('/details/')[1].split('/')[0]
      return `https://archive.org/embed/${videoId}`
    }

    return url
  }

  const embedUrl = getEmbedUrl(url)
  const videoId = getYouTubeId(url)

  const handleVideoError = () => {
    setVideoError(true)
  }

  // For invalid URLs or errors
  if (videoError || (!isDirectVideo(url) && !videoId && !url.includes('archive.org'))) {
    return (
      <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-100">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="text-center p-4">
          <p className="text-purple-200 mb-2">Unable to play this video</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg overflow-hidden">
      {title && (
        <div className="flex justify-between items-center p-4 border-b border-purple-500/30">
          <h3 className="text-lg font-semibold text-purple-100">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
      
      <div className="relative aspect-video">
        {isDirectVideo(embedUrl) ? (
          // Direct video file - use HTML5 video player
          <video
            src={embedUrl}
            controls
            className="w-full h-full bg-black"
            onError={handleVideoError}
            preload="metadata"
            autoPlay
          >
            <source src={embedUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Embedded video (YouTube, archive.org, etc.)
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={handleVideoError}
          />
        )}
        
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/50">
            <div className="text-center p-4">
              <p className="text-purple-200 mb-2">Failed to load video</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
              >
                Open in new tab
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="text-sm text-purple-300">
            {isDirectVideo(embedUrl) ? 'Direct Video Player' : 
             url.includes('youtube.com') ? 'YouTube Video Player' : 
             url.includes('archive.org') ? 'Archive.org Player' : 'Video Player'}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-purple-400 hover:text-purple-200 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
