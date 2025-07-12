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
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-gray-700 shadow-lg">
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
                className="w-10 h-10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-3xl font-bold text-white group-hover:text-violet-300 transition-colors duration-300">
              Merg
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-violet-300 transition-colors duration-300"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>
            <Link
              href="/discover"
              className="flex items-center space-x-2 text-gray-300 hover:text-violet-300 transition-colors duration-300"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="font-medium">Discover</span>
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800/60 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-center w-8 h-8 bg-violet-600 rounded-full">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-200 font-medium hidden sm:inline">{user.email}</span>
                </div>
                <StarBorderButton
                  onClick={handleLogout}
                  variant="primary"
                  size="sm"
                  className="border-gray-500 text-gray-300 hover:border-red-400 hover:text-red-300"
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
                    className="border-gray-500 text-gray-300 hover:border-violet-400 hover:text-violet-300"
                  >
                    Sign In
                  </StarBorderButton>
                </Link>
                <Link href="/signup">
                  <StarBorderButton
                    variant="primary"
                    size="sm"
                    className="bg-violet-600 border-violet-600 text-white hover:bg-violet-700 hover:border-violet-700"
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

