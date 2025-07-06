'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../contexts/AuthContext'
import { UserIcon, ArrowRightOnRectangleIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-dark-100/80 backdrop-blur-md border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
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
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/discover"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Discover</span>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm hidden sm:inline">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
