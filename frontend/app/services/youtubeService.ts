interface YouTubeVideo {
  id: string
  title: string
  channel: string
  views: string
  duration: string
  publishedAt: string
  thumbnail: string
  description: string
  channelId: string
  viewCount: number
  likeCount?: number
}

interface YouTubeApiResponse {
  items: any[]
  nextPageToken?: string
}

// Mock YouTube data for development
const mockYouTubeVideos: YouTubeVideo[] = [
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up (Official Video)",
    channel: "Rick Astley",
    views: "1.4B views",
    duration: "3:33",
    publishedAt: "2009-10-25",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    description: "The official video for Rick Astley's Never Gonna Give You Up",
    channelId: "UCuAXFkgsw1L7xaCfnd5JJOw",
    viewCount: 1400000000
  },
  {
    id: "9bZkp7q19f0",
    title: "PSY - GANGNAM STYLE(강남스타일) M/V",
    channel: "officialpsy",
    views: "4.9B views",
    duration: "4:13",
    publishedAt: "2012-07-15",
    thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
    description: "PSY - GANGNAM STYLE(강남스타일) M/V",
    channelId: "UCrDkAvF9ZM_-bf-fTSXaHeQ",
    viewCount: 4900000000
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Despacito ft. Daddy Yankee",
    channel: "Luis Fonsi",
    views: "8.2B views",
    duration: "4:42",
    publishedAt: "2017-01-12",
    thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    description: "Despacito ft. Daddy Yankee",
    channelId: "UCPh_95kWXJNVHKLdGIcQ-5w",
    viewCount: 8200000000
  },
  {
    id: "L_jWHffIx5E",
    title: "Smash Mouth - All Star",
    channel: "SmashMouthVEVO",
    views: "1.1B views",
    duration: "3:20",
    publishedAt: "2009-06-16",
    thumbnail: "https://img.youtube.com/vi/L_jWHffIx5E/maxresdefault.jpg",
    description: "Smash Mouth's official music video for All Star",
    channelId: "UCBINFWq52ShSgUFEoynuAzQ",
    viewCount: 1100000000
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Queen – Bohemian Rhapsody (Official Video Remastered)",
    channel: "Queen Official",
    views: "1.9B views",
    duration: "5:55",
    publishedAt: "2008-08-01",
    thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
    description: "Taken from A Night At The Opera, 1975",
    channelId: "UCiMhD4jzUqG-IgPzUmmytRQ",
    viewCount: 1900000000
  },
  {
    id: "2Vv-BfVoq4g",
    title: "Ed Sheeran - Perfect (Official Music Video)",
    channel: "Ed Sheeran",
    views: "3.5B views",
    duration: "4:23",
    publishedAt: "2017-11-09",
    thumbnail: "https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg",
    description: "The official music video for Ed Sheeran - Perfect",
    channelId: "UC0C-w0YjGpqDXGB8IHb662A",
    viewCount: 3500000000
  },
  {
    id: "YQHsXMglC9A",
    title: "Adele - Hello (Official Music Video)",
    channel: "Adele",
    views: "3.2B views",
    duration: "6:07",
    publishedAt: "2015-10-22",
    thumbnail: "https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg",
    description: "Hello by Adele from the album 25",
    channelId: "UCsRM0YB_dabtEPGPTKo-gcw",
    viewCount: 3200000000
  },
  {
    id: "hT_nvWreIhg",
    title: "The Weeknd - Blinding Lights (Official Music Video)",
    channel: "The Weeknd",
    views: "1.8B views",
    duration: "4:20",
    publishedAt: "2020-01-14",
    thumbnail: "https://img.youtube.com/vi/hT_nvWreIhg/maxresdefault.jpg",
    description: "The official music video for The Weeknd - Blinding Lights",
    channelId: "UC0WP5P-ufpRfjbNrmOWwLBQ",
    viewCount: 1800000000
  },
  {
    id: "RgKAFK5djSk",
    title: "Wiz Khalifa - See You Again ft. Charlie Puth [Official Video]",
    channel: "Wiz Khalifa",
    views: "6.1B views",
    duration: "3:57",
    publishedAt: "2015-04-06",
    thumbnail: "https://img.youtube.com/vi/RgKAFK5djSk/maxresdefault.jpg",
    description: "See You Again ft. Charlie Puth from Furious 7 Soundtrack",
    channelId: "UCBVjMGOIkavEAhyqpxJ73Dw",
    viewCount: 6100000000
  },
  {
    id: "3tmd-ClpJxA",
    title: "Gotye - Somebody That I Used To Know (feat. Kimbra)",
    channel: "Gotye",
    views: "2.1B views",
    duration: "4:04",
    publishedAt: "2011-07-05",
    thumbnail: "https://img.youtube.com/vi/3tmd-ClpJxA/maxresdefault.jpg",
    description: "Somebody That I Used To Know feat. Kimbra",
    channelId: "UCBVjMGOIkavEAhyqpxJ73Dw",
    viewCount: 2100000000
  },
  {
    id: "JGwWNGJdvx8",
    title: "Shape of You - Ed Sheeran",
    channel: "Ed Sheeran",
    views: "6.0B views",
    duration: "3:54",
    publishedAt: "2017-01-30",
    thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg",
    description: "The official music video for Ed Sheeran - Shape of You",
    channelId: "UC0C-w0YjGpqDXGB8IHb662A",
    viewCount: 6000000000
  },
  {
    id: "CevxZvSJLk8",
    title: "Katy Perry - Roar (Official)",
    channel: "Katy Perry",
    views: "3.8B views",
    duration: "3:43",
    publishedAt: "2013-09-05",
    thumbnail: "https://img.youtube.com/vi/CevxZvSJLk8/maxresdefault.jpg",
    description: "Get Katy Perry's new album 'Smile': https://katy.to/SmileID",
    channelId: "UC347w2ynYuNlNNEoGTO5Y7w",
    viewCount: 3800000000
  }
]

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'demo_key'
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

class YouTubeService {
  private baseURL = YOUTUBE_API_BASE_URL

  // Get trending videos
  async getTrendingVideos(maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      // Use real YouTube API if key is available
      if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'demo_key') {
        const response = await fetch(
          `${this.baseURL}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=${maxResults}&regionCode=US&key=${YOUTUBE_API_KEY}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch YouTube videos')
        }

        const data: YouTubeApiResponse = await response.json()
        return this.transformVideos(data.items)
      }

      // Fallback to mock data
      return mockYouTubeVideos.slice(0, maxResults)
    } catch (error) {
      console.warn('YouTube API failed, using mock data:', error)
      return mockYouTubeVideos.slice(0, maxResults)
    }
  }

  // Search videos
  async searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'demo_key') {
        // First search for video IDs
        const searchResponse = await fetch(
          `${this.baseURL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
        )
        
        if (!searchResponse.ok) {
          throw new Error('Failed to search YouTube videos')
        }

        const searchData: YouTubeApiResponse = await searchResponse.json()
        const videoIds = searchData.items.map(item => item.id.videoId).join(',')

        if (videoIds) {
          // Get detailed info for the videos
          const detailsResponse = await fetch(
            `${this.baseURL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
          )
          
          if (detailsResponse.ok) {
            const detailsData: YouTubeApiResponse = await detailsResponse.json()
            return this.transformVideos(detailsData.items)
          }
        }

        return this.transformSearchResults(searchData.items)
      }

      // Fallback to mock search
      return mockYouTubeVideos
        .filter(video => video.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, maxResults)
    } catch (error) {
      console.warn('YouTube search failed, using mock data:', error)
      return mockYouTubeVideos
        .filter(video => video.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, maxResults)
    }
  }

  // Get videos by category
  async getVideosByCategory(categoryId: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      if (YOUTUBE_API_KEY === 'demo_key') {
        return mockYouTubeVideos.slice(0, maxResults)
      }

      const response = await fetch(
        `${this.baseURL}/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=${categoryId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube videos by category')
      }

      const data: YouTubeApiResponse = await response.json()
      return this.transformVideos(data.items)
    } catch (error) {
      console.warn('YouTube category fetch failed, using mock data:', error)
      return mockYouTubeVideos.slice(0, maxResults)
    }
  }

  // Transform API response to our interface
  private transformVideos(items: any[]): YouTubeVideo[] {
    return items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      views: this.formatViewCount(item.statistics?.viewCount || 0),
      duration: this.formatDuration(item.contentDetails?.duration || 'PT0S'),
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.maxresdefault?.url || item.snippet.thumbnails.high?.url,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      viewCount: parseInt(item.statistics?.viewCount || '0'),
      likeCount: parseInt(item.statistics?.likeCount || '0')
    }))
  }

  // Transform search results
  private transformSearchResults(items: any[]): YouTubeVideo[] {
    return items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      views: 'N/A',
      duration: 'N/A',
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.high?.url,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      viewCount: 0
    }))
  }

  // Format view count
  private formatViewCount(count: number | string): string {
    const num = typeof count === 'string' ? parseInt(count) : count
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B views`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`
    } else {
      return `${num} views`
    }
  }

  // Format duration from ISO 8601 format
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return '0:00'

    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  // Get video embed URL
  getEmbedUrl(videoId: string, autoplay: boolean = false): string {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: '1',
      controls: '0',
      showinfo: '0',
      rel: '0',
      loop: '1',
      playlist: videoId
    })
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
  }

  // Get video thumbnail URL
  getThumbnailUrl(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'maxres'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
  }
}

export const youtubeService = new YouTubeService()
export type { YouTubeVideo }
