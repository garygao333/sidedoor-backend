'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
  disabled?: boolean
}

export default function SearchBar({ onSearch, isSearching, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (query.trim() && !isSearching && !disabled) {
      onSearch(query.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const isSearchDisabled = isSearching || !query.trim() || disabled

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative bg-dark-100 rounded-xl shadow-2xl border-2 border-gray-700 p-1 hover:border-purple-500 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-2xl group">
        <div className="flex items-center">
          <button
            onClick={handleSearch}
            disabled={isSearchDisabled}
            className={`
              ml-4 mr-3 p-1 rounded-full transition-all duration-200
              ${isSearchDisabled 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 hover:scale-110 active:scale-95'
              }
            `}
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your search query..."
            className="flex-1 py-4 px-2 text-lg bg-transparent border-none outline-none placeholder-gray-500 font-medium text-gray-200 focus:placeholder-gray-400 transition-colors duration-200"
            disabled={isSearching || disabled}
          />
          {isSearching && (
            <div className="mr-4">
              <div className="animate-spin h-5 w-5 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
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

