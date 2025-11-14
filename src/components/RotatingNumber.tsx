import React, { useState, useEffect } from 'react'

interface RotatingNumberProps {
  value: number
  className?: string
}

const RotatingNumber: React.FC<RotatingNumberProps> = ({ value, className = '' }) => {
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value > 0) {
      setIsAnimating(true)
      // Random rotation between -15 and 15 degrees
      const randomRotation = (Math.random() - 0.5) * 30
      // Random scale between 0.9 and 1.1
      const randomScale = 0.9 + Math.random() * 0.2
      
      setRotation(randomRotation)
      setScale(randomScale)
      
      // Return to straight position after animation
      setTimeout(() => {
        setRotation(0)
        setScale(1)
      }, 100)
      
      setTimeout(() => {
        setIsAnimating(false)
      }, 200)
    }
  }, [value])

  return (
    <span 
      className={`inline-block transition-all duration-200 ${className}`}
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}
    >
      {value.toLocaleString()}
    </span>
  )
}

export default RotatingNumber