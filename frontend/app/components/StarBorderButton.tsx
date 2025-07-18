'use client'

import { useState } from 'react'

interface StarBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function StarBorderButton({ 
  children, 
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: StarBorderButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const variantClasses = {
    primary: 'bg-transparent border-2 border-purple-500 text-purple-300 hover:border-purple-400 hover:text-purple-200 hover:bg-purple-900/20',
    secondary: 'bg-purple-900/10 text-purple-200 border-2 border-purple-500/50 hover:bg-purple-800/20 hover:border-purple-400'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-lg font-semibold
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105 active:scale-95
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Shimmer effect */}
      <div 
        className={`
          absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-300/20 to-transparent
          transition-transform duration-1000 ease-out
          ${isHovered && !disabled ? 'translate-x-full' : ''}
        `}
      />
    </button>
  )
}

