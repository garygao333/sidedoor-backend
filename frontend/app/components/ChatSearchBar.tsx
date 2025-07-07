'use client'

import { useState } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface ChatSearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
  disabled?: boolean
  placeholder?: string
}

export default function ChatSearchBar({ 
  onSearch, 
  isSearching, 
  disabled = false,
  placeholder = "Message Merg..."
}: ChatSearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (query.trim() && !isSearching && !disabled) {
      onSearch(query.trim())
      setQuery('') // Clear input after sending
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  const isSearchDisabled = isSearching || !query.trim() || disabled

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <div className="relative bg-gray-800 border border-gray-600 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
        <div className="flex items-end p-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none placeholder-gray-400 text-white resize-none min-h-[24px] max-h-32 leading-6"
            disabled={isSearching || disabled}
            style={{
              height: 'auto',
              minHeight: '24px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearchDisabled}
            className={`
              ml-2 p-2 rounded-lg transition-all duration-200 flex-shrink-0
              ${isSearchDisabled 
                ? 'text-gray-500 cursor-not-allowed bg-gray-700' 
                : 'text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95 shadow-sm'
              }
            `}
          >
            {isSearching ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 text-center mt-2">
        Merg can make mistakes. Please verify important information.
      </div>
    </div>
  )
}
