'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, PlayIcon, BookOpenIcon, DocumentTextIcon, FireIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, HandThumbUpIcon, SparklesIcon, FunnelIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header'
import FadeContent from '../components/FadeContent'
import AnimatedContent from '../components/AnimatedContent'
import StarBorderButton from '../components/StarBorderButton'
import Masonry from '../components/Masonry'
import { youtubeService, YouTubeVideo } from '../services/youtubeService'

interface MediaItem {
  id: string
  title: string
  type: 'movie' | 'tv' | 'book' | 'article' | 'anime' | 'social' | 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'video' | 'text-search'
  year?: number
  rating?: number
  poster?: string
  description: string
  trending?: boolean
  category?: string
  backdrop?: string
  genre_ids?: number[]
  platform?: string
  height?: number
  // YouTube specific properties
  videoId?: string
  channel?: string
  views?: string
  duration?: string
  publishedAt?: string
  youtubeData?: YouTubeVideo
}

interface SearchFilters {
  type: 'all' | 'movie' | 'tv' | 'book' | 'article' | 'anime' | 'social'
  year?: number
  rating?: number
  genre?: string
  sortBy: 'relevance' | 'rating' | 'year' | 'popularity'
}

// TMDB API service
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

// Genre mapping
const MOVIE_GENRES: { [key: number]: string } = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
}

const TV_GENRES: { [key: number]: string } = {
  10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids', 9648: 'Mystery',
  10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
  10767: 'Talk', 10768: 'War & Politics', 37: 'Western'
}

const tmdbService = {
  async getTrending(): Promise<MediaItem[]> {
    const response = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}`)
    const data = await response.json()
    return data.results.slice(0, 10).map((item: any) => ({
      id: item.id.toString(),
      title: item.title || item.name,
      type: item.media_type as 'movie' | 'tv',
      year: item.release_date ? new Date(item.release_date).getFullYear() : 
            item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
      rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
      poster: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : undefined,
      description: item.overview || 'No description available.',
      trending: true,
      category: item.genre_ids?.[0] ? (item.media_type === 'movie' ? MOVIE_GENRES[item.genre_ids[0]] : TV_GENRES[item.genre_ids[0]]) : undefined,
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1920${item.backdrop_path}` : undefined,
      genre_ids: item.genre_ids
    }))
  },

  async getPopularMovies(): Promise<MediaItem[]> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`)
    const data = await response.json()
    return data.results.slice(0, 10).map((item: any) => ({
      id: item.id.toString(),
      title: item.title,
      type: 'movie' as const,
      year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
      rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
      poster: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : undefined,
      description: item.overview || 'No description available.',
      trending: false,
      category: item.genre_ids?.[0] ? MOVIE_GENRES[item.genre_ids[0]] : 'Movie',
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1920${item.backdrop_path}` : undefined,
      genre_ids: item.genre_ids
    }))
  },

  async getPopularTVShows(): Promise<MediaItem[]> {
    const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}`)
    const data = await response.json()
    return data.results.slice(0, 10).map((item: any) => ({
      id: item.id.toString(),
      title: item.name,
      type: 'tv' as const,
      year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
      rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
      poster: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : undefined,
      description: item.overview || 'No description available.',
      trending: false,
      category: item.genre_ids?.[0] ? TV_GENRES[item.genre_ids[0]] : 'TV Show',
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1920${item.backdrop_path}` : undefined,
      genre_ids: item.genre_ids
    }))
  },

  async searchMulti(query: string, filters: SearchFilters): Promise<MediaItem[]> {
    if (!query.trim()) return []
    
    let url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    
    if (filters.year) {
      url += `&year=${filters.year}`
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    let results = data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => ({
        id: item.id.toString(),
        title: item.title || item.name,
        type: item.media_type as 'movie' | 'tv',
        year: item.release_date ? new Date(item.release_date).getFullYear() : 
              item.first_air_date ? new Date(item.first_air_date).getFullYear() : undefined,
        rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
        poster: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : undefined,
        description: item.overview || 'No description available.',
        trending: false,
        category: item.genre_ids?.[0] ? (item.media_type === 'movie' ? MOVIE_GENRES[item.genre_ids[0]] : TV_GENRES[item.genre_ids[0]]) : undefined,
        backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1920${item.backdrop_path}` : undefined,
        genre_ids: item.genre_ids
      }))

    // Apply filters
    if (filters.type !== 'all') {
      results = results.filter((item: MediaItem) => item.type === filters.type)
    }
    
    if (filters.rating) {
      results = results.filter((item: MediaItem) => item.rating && item.rating >= filters.rating!)
    }
    
    if (filters.genre) {
      results = results.filter((item: MediaItem) => item.category?.toLowerCase().includes(filters.genre!.toLowerCase()))
    }
    
    // Sort results
    switch (filters.sortBy) {
      case 'rating':
        results.sort((a: MediaItem, b: MediaItem) => (b.rating || 0) - (a.rating || 0))
        break
      case 'year':
        results.sort((a: MediaItem, b: MediaItem) => (b.year || 0) - (a.year || 0))
        break
      case 'popularity':
        // Already sorted by popularity from API
        break
      default:
        // relevance (default API order)
        break
    }
    
    return results
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query.trim() || query.length < 2) return []
    
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`)
    const data = await response.json()
    
    return data.results
      .slice(0, 5)
      .map((item: any) => item.title || item.name)
      .filter((title: string) => title.toLowerCase().includes(query.toLowerCase()))
  }
}

// Google Books API service
const GOOGLE_BOOKS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
const booksService = {
  async getTrendingBooks(): Promise<MediaItem[]> {
    try {
      const queries = ['bestseller 2024', 'trending fiction', 'popular non-fiction']
      const allBooks: MediaItem[] = []
      
      for (const query of queries) {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&orderBy=relevance`)
        const data = await response.json()
        
        if (data.items) {
          const books = data.items.map((book: any, index: number) => ({
            id: `book-${book.id}`,
            title: book.volumeInfo.title,
            type: 'book' as const,
            poster: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || `https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=${encodeURIComponent(book.volumeInfo.title)}`,
            description: book.volumeInfo.description?.substring(0, 200) + '...' || 'No description available.',
            year: book.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : undefined,
            rating: book.volumeInfo.averageRating ? Math.round(book.volumeInfo.averageRating * 10) / 10 : undefined,
            category: book.volumeInfo.categories?.[0] || 'General',
            trending: Math.random() > 0.7,
            height: 300 + Math.floor(Math.random() * 200) // Random height for masonry
          }))
          allBooks.push(...books)
        }
      }
      
      return allBooks.slice(0, 15)
    } catch (error) {
      console.error('Error fetching books:', error)
      return []
    }
  },

  async searchBooks(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return []
    
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`)
      const data = await response.json()
      
      return data.items?.map((book: any) => ({
        id: `book-${book.id}`,
        title: book.volumeInfo.title,
        type: 'book' as const,
        poster: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || `https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=${encodeURIComponent(book.volumeInfo.title)}`,
        description: book.volumeInfo.description?.substring(0, 200) + '...' || 'No description available.',
        year: book.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : undefined,
        rating: book.volumeInfo.averageRating ? Math.round(book.volumeInfo.averageRating * 10) / 10 : undefined,
        category: book.volumeInfo.categories?.[0] || 'General',
        height: 300 + Math.floor(Math.random() * 200)
      })) || []
    } catch (error) {
      console.error('Error searching books:', error)
      return []
    }
  }
}

// Guardian News API service
const GUARDIAN_API_KEY = process.env.NEXT_PUBLIC_GUARDIAN_API_KEY
const articlesService = {
  async getTrendingArticles(): Promise<MediaItem[]> {
    try {
      const sections = ['technology', 'film', 'books', 'culture', 'science']
      const allArticles: MediaItem[] = []
      
      for (const section of sections) {
        const response = await fetch(`https://content.guardianapis.com/search?section=${section}&show-fields=thumbnail,trailText&page-size=4&api-key=${GUARDIAN_API_KEY}`)
        const data = await response.json()
        
        if (data.response?.results) {
          const articles = data.response.results.map((article: any) => ({
            id: `article-${article.id}`,
            title: article.webTitle,
            type: 'article' as const,
            poster: article.fields?.thumbnail || `https://via.placeholder.com/400x300/10B981/FFFFFF?text=${encodeURIComponent(section.toUpperCase())}`,
            description: article.fields?.trailText || 'Read the full article...',
            year: new Date(article.webPublicationDate).getFullYear(),
            category: section.charAt(0).toUpperCase() + section.slice(1),
            trending: Math.random() > 0.6,
            height: 250 + Math.floor(Math.random() * 150)
          }))
          allArticles.push(...articles)
        }
      }
      
      return allArticles.slice(0, 20)
    } catch (error) {
      console.error('Error fetching articles:', error)
      return []
    }
  },

  async searchArticles(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return []
    
    try {
      const response = await fetch(`https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&show-fields=thumbnail,trailText&page-size=20&api-key=${GUARDIAN_API_KEY}`)
      const data = await response.json()
      
      return data.response?.results?.map((article: any) => ({
        id: `article-${article.id}`,
        title: article.webTitle,
        type: 'article' as const,
        poster: article.fields?.thumbnail || `https://via.placeholder.com/400x300/10B981/FFFFFF?text=NEWS`,
        description: article.fields?.trailText || 'Read the full article...',
        year: new Date(article.webPublicationDate).getFullYear(),
        category: article.sectionName,
        height: 250 + Math.floor(Math.random() * 150)
      })) || []
    } catch (error) {
      console.error('Error searching articles:', error)
      return []
    }
  }
}

// Jikan Anime API service
const animeService = {
  async getTrendingAnime(): Promise<MediaItem[]> {
    try {
      const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=25')
      const data = await response.json()
      
      return data.data?.map((anime: any) => ({
        id: `anime-${anime.mal_id}`,
        title: anime.title,
        type: 'anime' as const,
        poster: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
        description: anime.synopsis?.substring(0, 200) + '...' || 'No description available.',
        year: anime.year,
        rating: anime.score ? Math.round(anime.score * 10) / 10 : undefined,
        category: anime.genres?.[0]?.name || 'Anime',
        trending: anime.rank <= 10,
        height: 350 + Math.floor(Math.random() * 200)
      })) || []
    } catch (error) {
      console.error('Error fetching anime:', error)
      return []
    }
  },

  async searchAnime(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return []
    
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`)
      const data = await response.json()
      
      return data.data?.map((anime: any) => ({
        id: `anime-${anime.mal_id}`,
        title: anime.title,
        type: 'anime' as const,
        poster: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
        description: anime.synopsis?.substring(0, 200) + '...' || 'No description available.',
        year: anime.year,
        rating: anime.score ? Math.round(anime.score * 10) / 10 : undefined,
        category: anime.genres?.[0]?.name || 'Anime',
        height: 350 + Math.floor(Math.random() * 200)
      })) || []
    } catch (error) {
      console.error('Error searching anime:', error)
      return []
    }
  }
}



interface CarouselProps {
  title: string
  items: MediaItem[]
  onItemClick: (item: MediaItem) => void
  loading?: boolean
}

function Carousel({ title, items, onItemClick, loading = false }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons)
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons)
    }
  }, [items])

  const getIcon = (type: string) => {
    switch (type) {
      case 'movie':
      case 'tv':
        return <PlayIcon className="h-4 w-4" />
      case 'book':
        return <BookOpenIcon className="h-4 w-4" />
      case 'article':
        return <DocumentTextIcon className="h-4 w-4" />
      default:
        return <PlayIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4 px-4 lg:px-12">{title}</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 lg:px-12 pb-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-none w-64 bg-gray-800 rounded-lg overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <div className="mb-12 group">
      <h2 className="text-2xl font-bold text-white mb-4 px-4 lg:px-12">{title}</h2>
      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
        )}
        
        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        )}

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 lg:px-12 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-none w-64 bg-gray-900 rounded-lg overflow-hidden cursor-pointer group/item transform transition-all duration-300 hover:scale-105 hover:z-10"
              onClick={() => onItemClick(item)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl opacity-30">
                    {item.type === 'movie' && '🎬'}
                    {item.type === 'tv' && '📺'}
                    {item.type === 'book' && '📚'}
                    {item.type === 'article' && '📄'}
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <PlayIcon className="h-12 w-12 text-white" />
                </div>

                {/* Rating badge */}
                {item.rating && (
                  <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold border border-white/20">
                    ⭐ {item.rating}
                  </div>
                )}

                {/* Trending badge */}
                {item.trending && (
                  <div className="absolute top-2 left-2 bg-red-500/30 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-red-400/30">
                    <FireIcon className="h-3 w-3" />
                    HOT
                  </div>
                )}

                {/* Category badge */}
                {item.category && (
                  <div className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium border border-white/30">
                    {item.category}
                  </div>
                )}
              </div>

              {/* Content info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 bg-gray-500/20 backdrop-blur-sm text-gray-200 text-xs px-2 py-1 rounded border border-gray-400/30">
                    {getIcon(item.type)}
                    <span className="capitalize">{item.type}</span>
                  </div>
                  {item.year && (
                    <span className="bg-blue-500/20 backdrop-blur-sm text-blue-200 text-xs px-2 py-1 rounded border border-blue-400/30">{item.year}</span>
                  )}
                </div>
                
                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">
                  {item.title}
                </h3>
                
                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Action buttons - shown on hover */}
                <div className="flex gap-2 mt-3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                  <button className="bg-white text-black px-3 py-1 rounded text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1">
                    <PlayIcon className="h-3 w-3" />
                    Search
                  </button>
                  <button className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600 transition-colors">
                    <PlusIcon className="h-3 w-3" />
                  </button>
                  <button className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600 transition-colors">
                    <HandThumbUpIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const [trendingItems, setTrendingItems] = useState<MediaItem[]>([])
  const [movieItems, setMovieItems] = useState<MediaItem[]>([])
  const [tvItems, setTvItems] = useState<MediaItem[]>([])
  const [bookItems, setBookItems] = useState<MediaItem[]>([])
  const [articleItems, setArticleItems] = useState<MediaItem[]>([])
  const [animeItems, setAnimeItems] = useState<MediaItem[]>([])
  const [socialItems, setSocialItems] = useState<MediaItem[]>([])
  const [youtubeItems, setYoutubeItems] = useState<MediaItem[]>([])
  const [allMasonryItems, setAllMasonryItems] = useState<MediaItem[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<MediaItem[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sortBy: 'relevance'
  })

  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const router = useRouter()

  // Featured item (first trending item)
  const featuredItem = trendingItems[0] || null

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Save search history to localStorage
  const saveSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  // Debounced search
  const debouncedSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchSuggestions([])
      return
    }

    setSearchLoading(true)
    try {
      const [tmdbResults, bookResults, animeResults, articleResults, socialResults, suggestions] = await Promise.all([
        tmdbService.searchMulti(query, filters),
        booksService.searchBooks(query),
        animeService.searchAnime(query),
        articlesService.searchArticles(query),
        Promise.resolve(socialMediaService.searchSocial(query)),
        tmdbService.getSearchSuggestions(query)
      ])

      const allResults = [
        ...tmdbResults,
        ...bookResults.slice(0, 10),
        ...animeResults.slice(0, 10),
        ...articleResults.slice(0, 10),
        ...socialResults
      ]
      
      setSearchResults(allResults)
      setSearchSuggestions(suggestions)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [filters])

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value)
    }, 300)
  }

  // Handle search submission
  const handleSearchSubmit = (query: string = searchQuery) => {
    if (query.trim()) {
      saveSearchHistory(query.trim())
      debouncedSearch(query.trim())
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery)
    }
  }

  // Initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [trending, movies, tv, books, articles, anime, social, youtube] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTVShows(),
          booksService.getTrendingBooks(),
          articlesService.getTrendingArticles(),
          animeService.getTrendingAnime(),
          Promise.resolve(socialMediaService.getTrendingSocial()),
          youtubeService.getTrendingVideos(20)
        ])
        
        setTrendingItems(trending)
        setMovieItems(movies)
        setTvItems(tv)
        setBookItems(books)
        setArticleItems(articles)
        setAnimeItems(anime)
        setSocialItems(social)

        // Transform YouTube videos to MediaItem format
        const youtubeMediaItems: MediaItem[] = youtube.map((video: YouTubeVideo) => ({
          id: `youtube-${video.id}`,
          title: video.title,
          type: 'youtube' as const,
          description: video.description,
          poster: video.thumbnail,
          videoId: video.id,
          channel: video.channel,
          views: video.views,
          duration: video.duration,
          publishedAt: video.publishedAt,
          youtubeData: video,
          platform: 'YouTube'
        }))
        setYoutubeItems(youtubeMediaItems)

        // Helper function to generate balanced heights for masonry (smaller sizes)
        const generateHeight = (type: string, index: number) => {
          const baseHeights = {
            movie: [200, 250, 300, 350], // Smaller portrait movie posters
            tv: [220, 270, 320, 370],    // Smaller TV show posters
            book: [250, 300, 350, 400], // Smaller book covers
            article: [180, 220, 260, 300], // Smaller article cards
            anime: [240, 290, 340, 390], // Smaller anime posters
            social: [160, 200, 240, 280], // Smaller social posts
            twitter: [140, 180, 220, 260], // Smaller tweets
            youtube: [200, 250, 300, 350], // Smaller YouTube videos
            video: [200, 250, 300, 350], // Smaller video content
            'text-search': [180, 220, 260, 300] // Text search boxes
          }
          
          const heights = baseHeights[type as keyof typeof baseHeights] || [200, 250, 300, 350]
          return heights[index % heights.length] + Math.floor(Math.random() * 30) - 15 // Smaller randomness
        }

        // Text-only search query boxes for AI agent
        const textSearchQueries = [
          {
            id: 'text-search-1',
            title: 'FIND ME THE #1 MOST TRENDING OPEN SOURCE FILM',
            description: 'AI-powered search for trending open source movies',
            type: 'text-search' as const,
            height: generateHeight('text-search', 0)
          },
          {
            id: 'text-search-2',
            title: 'FIND ME A BOOK FOR MY AFTERNOON READ BASED ON MY PREFERENCES',
            description: 'Personalized book recommendations',
            type: 'text-search' as const,
            height: generateHeight('text-search', 1)
          },
          {
            id: 'text-search-3',
            title: 'DISCOVER HIDDEN GEM INDIE FILMS FROM THE LAST 5 YEARS',
            description: 'Uncover indie cinema treasures',
            type: 'text-search' as const,
            height: generateHeight('text-search', 2)
          },
          {
            id: 'text-search-4',
            title: 'RECOMMEND ME DOCUMENTARIES ABOUT AI AND TECHNOLOGY',
            description: 'Deep dive into tech documentaries',
            type: 'text-search' as const,
            height: generateHeight('text-search', 3)
          },
          {
            id: 'text-search-5',
            title: 'FIND ANIME SIMILAR TO STUDIO GHIBLI BUT LESSER KNOWN',
            description: 'Discover hidden anime gems',
            type: 'text-search' as const,
            height: generateHeight('text-search', 4)
          },
          {
            id: 'text-search-6',
            title: 'SEARCH FOR VIRAL TIKTOK VIDEOS ABOUT COOKING HACKS',
            description: 'Trending culinary content',
            type: 'text-search' as const,
            height: generateHeight('text-search', 5)
          }
        ]

        // Combine all items for masonry layout with optimized heights
        const allItems = [
          ...trending.map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `trending-${item.id}`,
            height: generateHeight(item.type, index)
          })),
          ...movies.map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `movie-${item.id}`,
            height: generateHeight('movie', index)
          })),
          ...tv.map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `tv-${item.id}`,
            height: generateHeight('tv', index)
          })),
          ...books.slice(0, 12).map((item: MediaItem, index: number) => ({ // More books for variety
            ...item, 
            id: `books-${item.id}-${index}`,
            height: generateHeight('book', index)
          })),
          ...articles.slice(0, 8).map((item: MediaItem, index: number) => ({ // More articles
            ...item, 
            id: `articles-${item.id}-${index}`,
            height: generateHeight('article', index)
          })),
          ...anime.slice(0, 10).map((item: MediaItem, index: number) => ({ // More anime
            ...item, 
            id: `anime-main-${item.id}-${index}`,
            height: generateHeight('anime', index)
          })),
          ...social.map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `social-${item.id}-${index}`,
            height: generateHeight('social', index)
          })),
          ...youtubeMediaItems.map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `youtube-${item.id}-${index}`,
            height: generateHeight('youtube', index)
          })),
          ...trendingPosts.map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `trending-post-${item.id}-${index}`,
            height: generateHeight('twitter', index)
          })),
          ...textSearchQueries
        ]
        
        // Shuffle array for more interesting layout
        const shuffledItems = allItems.sort(() => Math.random() - 0.5)
        setAllMasonryItems(shuffledItems)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback to mock data if APIs fail
        setSocialItems(socialMediaService.getTrendingSocial())
        
        // Create fallback masonry items with unique IDs
        const fallbackItems = [
          ...socialMediaService.getTrendingSocial().map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `fallback-social-${item.id}-${index}` 
          })),
          ...trendingPosts.map((item: MediaItem, index: number) => ({ 
            ...item, 
            id: `fallback-trending-${item.id}-${index}` 
          }))
        ]
        setAllMasonryItems(fallbackItems)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (item: MediaItem | { title: string; description: string; type: 'text-search' }) => {
    console.log('handleSearch called with item:', item)
    let searchTerm: string
    
    if (item.type === 'text-search') {
      // For text-only search boxes, use the title as the search query
      searchTerm = item.title
    } else {
      // For media items, create a descriptive search query
      const mediaItem = item as MediaItem
      searchTerm = `Find me ${mediaItem.title}${mediaItem.year ? ` from ${mediaItem.year}` : ''}${mediaItem.type === 'movie' ? ' movie' : mediaItem.type === 'tv' ? ' TV show' : ` ${mediaItem.type}`}`
    }
    
    console.log('Navigating to chat with search term:', searchTerm)
    // Navigate to chat page with the search query as URL parameter
    router.push(`/chat?q=${encodeURIComponent(searchTerm)}`)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchSuggestions([])
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Main Masonry Content - Full Screen */}
      <main className="relative z-10 pt-8">
        <FadeContent delay={200}>
          <div className="mb-12">
            <div className="flex items-center justify-between px-4 lg:px-12 mb-8">
              <h2 className="text-4xl font-bold text-white">
                Discover Everything
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-gray-400 text-sm">
                  {loading ? 'Loading content...' : `${allMasonryItems.length} items`}
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="px-4 lg:px-12">
                <div style={{ 
                  columns: 6,
                  columnGap: '0.75rem',
                  columnFill: 'balance'
                }}>
                  {[...Array(24)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 rounded-xl animate-pulse mb-3 break-inside-avoid"
                      style={{ 
                        height: `${200 + Math.floor(Math.random() * 150)}px`,
                        display: 'inline-block',
                        width: '100%'
                      }}
                    >
                      <div className="w-full h-full bg-gray-700 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Masonry
                items={allMasonryItems.map(item => ({
                  id: item.id,
                  img: item.poster || `https://via.placeholder.com/400x${item.height || 400}/6B7280/FFFFFF?text=${encodeURIComponent(item.title)}`,
                  height: item.height || 400,
                  title: item.title,
                  type: item.type,
                  rating: item.rating,
                  year: item.year,
                  description: item.description,
                  platform: item.platform,
                  videoId: item.videoId,
                  channel: item.channel,
                  views: item.views,
                  duration: item.duration,
                  publishedAt: item.publishedAt,
                  youtubeData: item.youtubeData
                }))}
                ease="power3.out"
                duration={0.6}
                stagger={0.02}
                animateFrom="bottom"
                scaleOnHover={true}
                hoverScale={0.95}
                blurToFocus={true}
                colorShiftOnHover={false}
                columns={6}
                onItemClick={(item) => {
                  // Convert MasonryItem back to MediaItem for handleSearch
                  const mediaItem = {
                    id: item.id,
                    title: item.title || '',
                    type: item.type as any,
                    description: item.description || '',
                    year: item.year,
                    rating: item.rating,
                    poster: item.img,
                    platform: item.platform,
                    videoId: item.videoId,
                    channel: item.channel,
                    views: item.views,
                    duration: item.duration,
                    publishedAt: item.publishedAt,
                    youtubeData: item.youtubeData
                  }
                  handleSearch(mediaItem)
                }}
              />
            )}
          </div>
        </FadeContent>
      </main>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

// Mock Social Media Content (since APIs are restricted)
const socialMediaService = {
  getTrendingSocial(): MediaItem[] {
    return [
      {
        id: 'social-1',
        title: '#OpenSourceFilm trending: "Elephant Dreams"',
        type: 'social',
        poster: 'https://picsum.photos/400/300?random=1',
        description: 'The community is buzzing about this groundbreaking open-source animated film. A must-watch for tech enthusiasts!',
        platform: 'twitter',
        trending: true,
        category: 'Film',
        height: 280
      },
      {
        id: 'social-2',
        title: 'Behind the scenes: Marvel CGI breakdown',
        type: 'instagram',
        poster: 'https://picsum.photos/400/500?random=2',
        description: 'Instagram reel showing incredible VFX work behind the latest superhero blockbuster.',
        platform: 'instagram',
        trending: true,
        category: 'Movies',
        height: 450
      },
      {
        id: 'social-3',
        title: 'BookTok recommendations going viral',
        type: 'tiktok',
        poster: 'https://picsum.photos/400/600?random=3',
        description: 'TikTok users are sharing their favorite fantasy books. The comment section is gold!',
        platform: 'tiktok',
        trending: true,
        category: 'Books',
        height: 500
      },
      {
        id: 'social-4',
        title: 'AI Film Analysis Thread',
        type: 'twitter',
        poster: 'https://picsum.photos/400/320?random=4',
        description: 'Fascinating Twitter thread analyzing cinematography techniques in modern sci-fi films.',
        platform: 'twitter',
        category: 'Film Theory',
        height: 300
      },
      {
        id: 'social-5',
        title: 'Anime studio tour on Instagram',
        type: 'instagram',
        poster: 'https://picsum.photos/400/450?random=5',
        description: 'Rare behind-the-scenes look at how your favorite anime characters come to life.',
        platform: 'instagram',
        category: 'Anime',
        height: 400
      },
      {
        id: 'social-6',
        title: 'Reading aesthetic setup',
        type: 'tiktok',
        poster: 'https://picsum.photos/400/550?random=6',
        description: 'Cozy reading corner inspiration that will make you want to pick up a book right now.',
        platform: 'tiktok',
        category: 'Books',
        height: 480
      }
    ]
  },

  searchSocial(query: string): MediaItem[] {
    const all = this.getTrendingSocial()
    if (!query.trim()) return all
    
    return all.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase())
    )
  }
}

// Mock trending X posts (hardcoded since Twitter API is expensive)
const trendingPosts: MediaItem[] = [
  {
    id: 'tweet-1',
    title: 'BREAKING: New AI model beats humans at film criticism',
    type: 'twitter',
    poster: 'https://picsum.photos/400/250?random=10',
    description: 'Researchers develop AI that can analyze movies better than professional critics. Thread with examples ↓',
    platform: 'twitter',
    trending: true,
    category: 'AI & Film',
    year: 2024,
    height: 250
  },
  {
    id: 'tweet-2',
    title: 'Studio Ghibli releases hand-drawn animation tutorial',
    type: 'twitter',
    poster: 'https://picsum.photos/400/280?random=11',
    description: 'Master animators share their secrets in this comprehensive guide. The attention to detail is incredible!',
    platform: 'twitter',
    trending: true,
    category: 'Animation',
    year: 2024,
    height: 280
  },
  {
    id: 'tweet-3',
    title: 'BookTuber creates 1000+ book review database',
    type: 'twitter',
    poster: 'https://picsum.photos/400/300?random=12',
    description: 'Comprehensive database with ratings, summaries, and reading recommendations. Game changer for book lovers!',
    platform: 'twitter',
    category: 'Books',
    year: 2024,
    height: 300
  }
]
