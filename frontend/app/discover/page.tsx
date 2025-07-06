'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MagnifyingGlassIcon, PlayIcon, BookOpenIcon, DocumentTextIcon, FireIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, HandThumbUpIcon, SparklesIcon, FunnelIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import Header from '../components/Header'
import FadeContent from '../components/FadeContent'
import AnimatedContent from '../components/AnimatedContent'
import StarBorderButton from '../components/StarBorderButton'

interface MediaItem {
  id: string
  title: string
  type: 'movie' | 'tv' | 'book' | 'article'
  year?: number
  rating?: number
  poster?: string
  description: string
  trending?: boolean
  category?: string
  backdrop?: string
  genre_ids?: number[]
}

interface SearchFilters {
  type: 'all' | 'movie' | 'tv' | 'book' | 'article'
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

// Mock data for books and articles (TMDB doesn't have these)
const mockBooksAndArticles: MediaItem[] = [
  {
    id: 'book-1',
    title: 'The Three-Body Problem',
    type: 'book',
    year: 2023,
    rating: 8.5,
    description: 'A hard science fiction novel that explores first contact with an alien civilization.',
    trending: true,
    category: 'Science Fiction'
  },
  {
    id: 'book-2',
    title: 'Project Hail Mary',
    type: 'book',
    year: 2023,
    rating: 8.7,
    description: 'A lone astronaut must save humanity in this thrilling science fiction novel.',
    trending: false,
    category: 'Science Fiction'
  },
  {
    id: 'book-3',
    title: 'Atomic Habits',
    type: 'book',
    year: 2023,
    rating: 8.4,
    description: 'An easy & proven way to build good habits & break bad ones.',
    trending: false,
    category: 'Self-Help'
  },
  {
    id: 'article-1',
    title: 'GPT-4 Technical Report',
    type: 'article',
    year: 2023,
    rating: 9.1,
    description: 'Technical report detailing the architecture and capabilities of GPT-4.',
    trending: true,
    category: 'Technology'
  },
  {
    id: 'article-2',
    title: 'The Future of AI Research',
    type: 'article',
    year: 2024,
    rating: 8.3,
    description: 'An in-depth look at emerging trends in artificial intelligence research.',
    trending: false,
    category: 'Technology'
  }
]

// Search Books and Articles function
const searchBooksAndArticles = (query: string, filters: SearchFilters): MediaItem[] => {
  if (!query.trim()) return []
  
  let results = mockBooksAndArticles.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category?.toLowerCase().includes(query.toLowerCase())
  )
  
  // Apply filters
  if (filters.type !== 'all') {
    results = results.filter(item => item.type === filters.type)
  }
  
  if (filters.rating) {
    results = results.filter(item => item.rating && item.rating >= filters.rating!)
  }
  
  if (filters.year) {
    results = results.filter(item => item.year === filters.year)
  }
  
  if (filters.genre) {
    results = results.filter(item => item.category?.toLowerCase().includes(filters.genre!.toLowerCase()))
  }
  
  // Sort results
  switch (filters.sortBy) {
    case 'rating':
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'year':
      results.sort((a, b) => (b.year || 0) - (a.year || 0))
      break
    default:
      break
  }
  
  return results
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
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                    ⭐ {item.rating}
                  </div>
                )}

                {/* Trending badge */}
                {item.trending && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <FireIcon className="h-3 w-3" />
                    HOT
                  </div>
                )}
              </div>

              {/* Content info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    {getIcon(item.type)}
                    <span className="capitalize">{item.type}</span>
                  </div>
                  {item.year && (
                    <span className="text-gray-400 text-xs">{item.year}</span>
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
  const [bookItems] = useState<MediaItem[]>(mockBooksAndArticles.filter(item => item.type === 'book'))
  const [articleItems] = useState<MediaItem[]>(mockBooksAndArticles.filter(item => item.type === 'article'))
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
      const [tmdbResults, bookResults, suggestions] = await Promise.all([
        tmdbService.searchMulti(query, filters),
        searchBooksAndArticles(query, filters),
        tmdbService.getSearchSuggestions(query)
      ])

      const allResults = [...tmdbResults, ...bookResults]
      setSearchResults(allResults)
      setSearchSuggestions(suggestions)
    } catch (error) {
      console.error('Search error:', error)
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
        const [trending, movies, tv] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTVShows()
        ])
        
        setTrendingItems(trending)
        setMovieItems(movies)
        setTvItems(tv)
      } catch (error) {
        console.error('Error fetching TMDB data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (item: MediaItem) => {
    const searchTerm = `${item.title} ${item.year || ''} ${item.type === 'movie' ? '1080p' : ''}`
    window.location.href = `/?q=${encodeURIComponent(searchTerm)}`
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchSuggestions([])
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Netflix-style Hero Section */}
      {featuredItem && !searchQuery && (
        <section className="relative h-screen flex items-center">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            {featuredItem.backdrop ? (
              <img
                src={featuredItem.backdrop}
                alt={featuredItem.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-gray-900 to-black flex items-center justify-center">
                <div className="text-9xl opacity-10">
                  {featuredItem.type === 'movie' && '🎬'}
                  {featuredItem.type === 'tv' && '📺'}
                  {featuredItem.type === 'book' && '📚'}
                  {featuredItem.type === 'article' && '📄'}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 lg:px-12 max-w-4xl">
            <FadeContent>
              <AnimatedContent animation="slideUp" delay={200}>
                {/* Category badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                    SIDEDOOR ORIGINAL
                  </div>
                  {featuredItem.trending && (
                    <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                      <FireIcon className="h-4 w-4" />
                      TRENDING NOW
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                  {featuredItem.title}
                </h1>

                {/* Meta info */}
                <div className="flex items-center gap-4 mb-6 text-white">
                  {featuredItem.rating && (
                    <div className="flex items-center gap-1 text-green-400 font-semibold">
                      <span>⭐</span>
                      <span>{featuredItem.rating}</span>
                    </div>
                  )}
                  {featuredItem.year && (
                    <span className="text-gray-300">{featuredItem.year}</span>
                  )}
                  <span className="capitalize text-gray-300">{featuredItem.type}</span>
                  {featuredItem.category && (
                    <span className="text-gray-300">{featuredItem.category}</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed">
                  {featuredItem.description}
                </p>

                {/* Action buttons */}
                <div className="flex gap-4">
                  <StarBorderButton
                    onClick={() => handleSearch(featuredItem)}
                    size="lg"
                    variant="primary"
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <PlayIcon className="h-6 w-6 mr-3" />
                    Search Now
                  </StarBorderButton>
                  
                  <button className="bg-gray-700/70 hover:bg-gray-600/70 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 flex items-center gap-3">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    More Info
                  </button>
                </div>
              </AnimatedContent>
            </FadeContent>
          </div>
        </section>
      )}

      {/* Loading state for hero section */}
      {loading && !featuredItem && !searchQuery && (
        <section className="relative h-screen flex items-center">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-black"></div>
          <div className="relative z-10 px-4 lg:px-12 max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
              <div className="h-20 bg-gray-700 rounded w-96 mb-6"></div>
              <div className="h-4 bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-72 mb-8"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-700 rounded w-32"></div>
                <div className="h-12 bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Search Section */}
      <div className={`relative z-20 px-4 lg:px-12 mb-12 ${searchQuery ? 'pt-8' : '-mt-20'}`}>
        <FadeContent delay={600}>
          <div className="max-w-4xl">
            {/* Search Bar */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search for movies, TV shows, books, articles..."
                className="w-full pl-14 pr-20 py-4 text-lg bg-gray-900/90 border border-gray-700 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm"
              />
              
              {/* Search actions */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 hover:bg-gray-700 rounded-lg transition-colors ${showFilters ? 'bg-gray-700' : ''}`}
                >
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && searchQuery && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        handleSearchSubmit(suggestion)
                      }}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors duration-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search History */}
            {!searchQuery && searchHistory.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Recent searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(item)
                        handleSearchSubmit(item)
                      }}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors duration-300"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-gray-900/90 border border-gray-700 rounded-xl p-6 mb-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Advanced Filters</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange({ type: e.target.value as SearchFilters['type'] })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="movie">Movies</option>
                      <option value="tv">TV Shows</option>
                      <option value="book">Books</option>
                      <option value="article">Articles</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="popularity">Popularity</option>
                      <option value="rating">Rating</option>
                      <option value="year">Year</option>
                    </select>
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min Rating</label>
                    <select
                      value={filters.rating || ''}
                      onChange={(e) => handleFilterChange({ rating: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="">Any Rating</option>
                      <option value="7">7+ Stars</option>
                      <option value="8">8+ Stars</option>
                      <option value="9">9+ Stars</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                    <input
                      type="number"
                      placeholder="e.g., 2024"
                      value={filters.year || ''}
                      onChange={(e) => handleFilterChange({ year: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-400"
                      min="1900"
                      max="2030"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeContent>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="px-4 lg:px-12 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Search Results for "{searchQuery}"
              {searchResults.length > 0 && (
                <span className="text-lg font-normal text-gray-400 ml-2">
                  ({searchResults.length} results)
                </span>
              )}
            </h2>
            {searchLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                <span className="text-sm">Searching...</span>
              </div>
            )}
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer group transform transition-all duration-300 hover:scale-105"
                  onClick={() => handleSearch(item)}
                >
                  <div className="relative aspect-[2/3] bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
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
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <PlayIcon className="h-8 w-8 text-white" />
                    </div>

                    {item.rating && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                        ⭐ {item.rating}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="capitalize">{item.type}</span>
                      {item.year && <span>{item.year}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !searchLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-30">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={clearSearch}
                className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Content Carousels - Only show when not searching */}
      {!searchQuery && (
        <main className="relative z-10">
          <FadeContent delay={800}>
            <Carousel
              title="Trending Now"
              items={trendingItems}
              onItemClick={handleSearch}
              loading={loading}
            />
          </FadeContent>

          <FadeContent delay={1000}>
            <Carousel
              title="Popular Movies"
              items={movieItems}
              onItemClick={handleSearch}
              loading={loading}
            />
          </FadeContent>

          <FadeContent delay={1200}>
            <Carousel
              title="Popular TV Shows"
              items={tvItems}
              onItemClick={handleSearch}
              loading={loading}
            />
          </FadeContent>

          <FadeContent delay={1400}>
            <Carousel
              title="Books"
              items={bookItems}
              onItemClick={handleSearch}
            />
          </FadeContent>

          <FadeContent delay={1600}>
            <Carousel
              title="Articles & Research"
              items={articleItems}
              onItemClick={handleSearch}
            />
          </FadeContent>

          {/* Popular Searches */}
          <FadeContent delay={1800}>
            <div className="px-4 lg:px-12 mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Popular Searches</h2>
              <div className="flex flex-wrap gap-3">
                {['Sci-Fi Movies', 'AI Research', 'Best Sellers 2024', 'Tech Articles', 'Drama Series', 'Space Documentaries'].map((tag) => (
                  <button
                    key={tag}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm transition-colors duration-300"
                    onClick={() => {
                      setSearchQuery(tag)
                      handleSearchSubmit(tag)
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </FadeContent>

          {/* Footer CTA */}
          <FadeContent delay={2000}>
            <div className="px-4 lg:px-12 pb-20">
              <div className="bg-gradient-to-r from-purple-900/50 to-gray-900/50 rounded-2xl p-12 text-center backdrop-blur-sm border border-gray-800">
                <h3 className="text-3xl font-bold text-white mb-4">Ready to find your next favorite?</h3>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Use our AI-powered search to discover exactly what you're looking for across movies, books, articles, and more.
                </p>
                <StarBorderButton
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = '/'}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
                  Start Searching
                </StarBorderButton>
              </div>
            </div>
          </FadeContent>
        </main>
      )}

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
