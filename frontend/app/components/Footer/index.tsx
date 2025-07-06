'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import SocialLinks from './SocialLinks'
import NewsletterSection from './NewsletterSection'
import FadeContent from '../FadeContent'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Newsletter/CTA Section */}
      <NewsletterSection />
      
      {/* Main Footer */}
      <div className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <FadeContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <Image 
                    src="/logo1.png" 
                    alt="Merg Logo" 
                    width={32} 
                    height={32} 
                    className="w-8 h-8"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    Merg
                  </span>
                </div>
                <p className="text-gray-400 text-lg mb-6 max-w-md leading-relaxed">
                  AI-powered deep search that finds content across hidden corners of the internet using intelligent agents.
                </p>
                <SocialLinks />
              </div>

              {/* Product Links */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                      AI Search
                    </Link>
                  </li>
                  <li>
                    <Link href="/discover" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Discover
                    </Link>
                  </li>
                  <li>
                    <Link href="/demo" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Components Demo
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                      API Access
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </FadeContent>

          {/* Bottom Bar */}
          <FadeContent delay={200}>
            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-400 text-sm">
                  © 2025 Merg. All rights reserved.
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>All systems operational</span>
                  </span>
                </div>
              </div>
            </div>
          </FadeContent>
        </div>
      </div>
    </footer>
  )
}
