'use client'

import { useState } from 'react'
import { EnvelopeIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline'
import FadeContent from '../FadeContent'
import StarBorderButton from '../StarBorderButton'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubscribed(true)
    setIsLoading(false)
    setEmail('')
    
    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/20 via-gray-900 to-purple-900/20 border-b border-gray-800">
      <div className="container mx-auto px-4 py-16">
        <FadeContent>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <SparklesIcon className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated with Merg
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get notified about new AI search capabilities, exclusive features, and the latest in intelligent content discovery.
            </p>

            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <StarBorderButton
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isLoading || !email.trim()}
                    className="px-6"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Subscribe'
                    )}
                  </StarBorderButton>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-green-400 text-lg">
                <CheckIcon className="h-6 w-6" />
                <span>Successfully subscribed! Welcome to Merg.</span>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </FadeContent>
      </div>
    </div>
  )
}
