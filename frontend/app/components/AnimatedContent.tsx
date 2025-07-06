'use client'

import { useEffect, useRef, useState } from 'react'

type AnimationType = 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'bounce'

interface AnimatedContentProps {
  children: React.ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
}

export default function AnimatedContent({ 
  children, 
  animation = 'slideUp',
  delay = 0, 
  duration = 800, 
  className = '' 
}: AnimatedContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const getInitialTransform = () => {
    switch (animation) {
      case 'slideUp':
        return 'translateY(30px)'
      case 'slideDown':
        return 'translateY(-30px)'
      case 'slideLeft':
        return 'translateX(30px)'
      case 'slideRight':
        return 'translateX(-30px)'
      case 'scale':
        return 'scale(0.8)'
      case 'rotate':
        return 'rotate(-5deg) scale(0.9)'
      case 'bounce':
        return 'translateY(20px) scale(0.95)'
      default:
        return 'translateY(30px)'
    }
  }

  const getTransitionClass = () => {
    if (animation === 'bounce') {
      return 'transition-all ease-bounce'
    }
    return 'transition-all ease-out'
  }

  return (
    <div
      ref={elementRef}
      className={`${getTransitionClass()} ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) translateX(0) scale(1) rotate(0)' : getInitialTransform(),
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
