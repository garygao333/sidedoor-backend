'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../contexts/AuthContext'
import { UserIcon, ArrowRightOnRectangleIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import StarBorderButton from './StarBorderButton'

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
    <header className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image 
                src="/logo1.png" 
                alt="Merg Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-purple-500 transition-all duration-300">
              Merg
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-purple-300 transition-all duration-300 group"
            >
              <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Home</span>
            </Link>
            <Link
              href="/discover"
              className="flex items-center space-x-2 text-gray-300 hover:text-purple-300 transition-all duration-300 group"
            >
              <MagnifyingGlassIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">Discover</span>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-200 font-medium hidden sm:inline">{user.email}</span>
                </div>
                <StarBorderButton
                  onClick={handleLogout}
                  variant="primary"
                  size="sm"
                  className="border-gray-600 text-gray-200 hover:border-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </StarBorderButton>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <StarBorderButton
                    variant="primary"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:border-purple-400 hover:text-purple-300"
                  >
                    Sign In
                  </StarBorderButton>
                </Link>
                <Link href="/signup">
                  <StarBorderButton
                    variant="secondary"
                    size="sm"
                  >
                    Sign Up
                  </StarBorderButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

