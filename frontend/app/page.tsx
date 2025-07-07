'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import FadeContent from './components/FadeContent'
import AnimatedContent from './components/AnimatedContent'
import StarBorderButton from './components/StarBorderButton'
import Threads from './components/Threads'
import Footer from './components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

function HomePage() {
  const [showDescription, setShowDescription] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const titleText = "Merg"
  const subtitleText = "AI-Powered Deep Search"

  useEffect(() => {
    // Show description after a delay
    const timeout = setTimeout(() => {
      setShowDescription(true)
    }, 1500)

    return () => clearTimeout(timeout)
  }, [])

  const handleTryItNow = () => {
    if (user) {
      router.push('/chat')
    } else {
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-50 to-gray-800">
      <Header />
      
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen flex items-center justify-center px-4">
        {/* Threads Background */}
        <div className="absolute inset-0 opacity-30">
          <Threads
            color={[0.5, 0.3, 0.8]}
            amplitude={0.8}
            distance={0.3}
            enableMouseInteraction={true}
          />
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto max-w-4xl">
          <FadeContent className="text-center">
            {/* Main Title */}
            <AnimatedContent animation="scale" delay={200}>
              <div className="mb-12">
                {/* Enhanced Split Text Animation for Title */}
                <h1 className="text-6xl font-bold leading-tight mb-6 overflow-hidden">
                  {titleText.split('').map((char, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent opacity-0"
                      style={{
                        animation: `fadeInUp 0.8s ease-out ${index * 0.15}s forwards`,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </h1>
                
                {/* Subtitle without typing effect */}
                <div className="text-xl text-gray-300 h-8 flex items-center justify-center mb-6">
                  <span className="font-mono tracking-wide">
                    {subtitleText}
                  </span>
                </div>
                
                {/* Enhanced Animated Description */}
                <div className={`text-base text-gray-400 mt-4 max-w-2xl mx-auto transition-all duration-1000 ${
                  showDescription 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-8'
                }`}>
                  <p className="leading-relaxed text-lg">
                    Find content across{' '}
                    <span className="relative">
                      <span className="text-purple-300 font-semibold bg-purple-900/20 px-2 py-1 rounded animate-pulse">
                        hidden corners
                      </span>
                    </span>{' '}
                    of the internet using{' '}
                    <span className="relative">
                      <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-bold">
                        intelligent AI agents
                      </span>
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 animate-pulse"></span>
                    </span>{' '}
                    that navigate complex sites and verify quality.
                  </p>
                </div>
              </div>
            </AnimatedContent>
            
            {/* Try It Now Button */}
            <AnimatedContent animation="slideUp" delay={400}>
              <StarBorderButton
                onClick={handleTryItNow}
                variant="primary"
                size="lg"
                className="shadow-xl hover:shadow-2xl"
              >
                Try It Now
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </StarBorderButton>
            </AnimatedContent>
          </FadeContent>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  return (
    <HomePage />
  )
}



