'use client'

import { useEffect, useRef, useState } from 'react'

interface VariableProximityProps {
  children: React.ReactNode
  maxDistance?: number
  maxScale?: number
  className?: string
}

export default function VariableProximity({ 
  children, 
  maxDistance = 100,
  maxScale = 1.1,
  className = '' 
}: VariableProximityProps) {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      )

      if (distance < maxDistance) {
        const proximity = 1 - distance / maxDistance
        const scale = 1 + (maxScale - 1) * proximity
        const offsetMultiplier = 10 * proximity
        
        const deltaX = (e.clientX - centerX) / maxDistance * offsetMultiplier
        const deltaY = (e.clientY - centerY) / maxDistance * offsetMultiplier

        setTransform({
          scale,
          x: deltaX,
          y: deltaY
        })
      } else {
        setTransform({ scale: 1, x: 0, y: 0 })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [maxDistance, maxScale])

  return (
    <div
      ref={elementRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      }}
    >
      {children}
    </div>
  )
}
