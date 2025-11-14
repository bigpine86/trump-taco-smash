import React, { useState, useEffect, useCallback } from 'react'
import { useCounterStore } from '../store/counterStore'
import { playRandomTapSound } from '../utils/sound'
import { api, RealtimeClient, Stats } from '../utils/api'
import Leaderboard from './Leaderboard'
import RotatingNumber from './RotatingNumber'
import AdSense from './AdSense'
import AdSenseTest from './AdSenseTest'

const PENGUIN_IMAGES = [
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20penguin%20character%20with%20big%20eyes%20and%20round%20body%2C%20kawaii%20style%2C%20white%20and%20black%20colors%2C%20happy%20expression%2C%20simple%20design%2C%20cartoon%20style&image_size=square',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20penguin%20character%20with%20blinking%20eyes%20and%20round%20body%2C%20kawaii%20style%2C%20white%20and%20black%20colors%2C%20surprised%20expression%2C%20simple%20design%2C%20cartoon%20style&image_size=square'
]

const TapCounter: React.FC = () => {
  const { 
    count, 
    country, 
    isAnimating, 
    currentImageIndex, 
    isMacroDetected,
    increment, 
    setImageIndex,
    setCountry
  } = useCounterStore()

  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])
  const [globalStats, setGlobalStats] = useState<Stats>({ totalTaps: 0, activeUsers: 0, countries: {} })

  // Initialize real-time connection and fetch initial stats
  useEffect(() => {
    // Fetch initial stats
    api.getStats().then(setGlobalStats).catch(console.error)
    
    // Set up real-time connection
    const realtimeClient = new RealtimeClient(setGlobalStats)
    realtimeClient.connect()

    // Get user's country
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_code || 'KR'))
      .catch(() => setCountry('KR'))

    return () => {
      realtimeClient.disconnect()
    }
  }, [setCountry])

  // Optimistic update for immediate feedback
  const optimisticUpdate = useCallback(() => {
    setGlobalStats(prev => ({
      ...prev,
      totalTaps: prev.totalTaps + 1,
      countries: {
        ...prev.countries,
        [country]: (prev.countries[country] || 0) + 1
      }
    }))
  }, [country])

  // Handle tap/click with sound and animation
  const handleTap = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (isMacroDetected) return

    // Get position for particle effect
    let clientX: number, clientY: number
    if ('touches' in event) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    // Play sound
    playRandomTapSound()

    // Optimistic update for immediate feedback
    optimisticUpdate()

    // Increment counter and sync with backend
    increment()
    api.recordTap().catch(console.error)

    // Add particle effect
    const newParticle = {
      id: Date.now(),
      x: clientX,
      y: clientY
    }
    setParticles(prev => [...prev, newParticle])

    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id))
    }, 1000)

    // Change image randomly every 50-200 taps
    if (count > 0 && count % (Math.floor(Math.random() * 150) + 50) === 0) {
      const newIndex = Math.floor(Math.random() * PENGUIN_IMAGES.length)
      setImageIndex(newIndex)
    }
  }, [count, increment, setImageIndex, isMacroDetected])

  // Prevent default touch behavior for better mobile experience
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    handleTap(event)
  }, [handleTap])

  // Use test ads during development, real AdSense in production
  const isDevelopment = import.meta.env.DEV
  const AdComponent = isDevelopment ? AdSenseTest : AdSense

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4 select-none overflow-hidden">
      {/* Counter Display */}
      <div className="text-center mb-8 z-10">
        <div className="text-8xl font-black text-gray-800 mb-2">
          <RotatingNumber value={count} />
        </div>
      </div>

      {/* Penguin Character */}
      <div className="relative mb-8 z-10">
        <div
          className={`relative cursor-pointer transition-transform duration-150 ${
            isAnimating ? 'scale-105' : 'scale-100'
          } ${isMacroDetected ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleTap}
          onTouchStart={handleTouchStart}
        >
          <img
            src={PENGUIN_IMAGES[currentImageIndex]}
            alt="Cute Penguin"
            className="w-80 h-80 object-contain drop-shadow-lg"
            draggable={false}
          />
          
          {/* Simple tap animation */}
          {isAnimating && (
            <div className="absolute inset-0 bg-white opacity-10 rounded-full animate-ping" />
          )}
        </div>

        {/* Macro detection warning */}
        {isMacroDetected && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
            ⚠️ Too fast!
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <Leaderboard globalStats={globalStats} userCountry={country} />

      {/* Bottom Ad - Only at bottom like Popcat */}
      <div className="w-full max-w-4xl mx-auto mt-8">
        <AdComponent slot="0987654321" className="w-full h-32" />
      </div>

      {/* Particle Effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: particle.x,
            top: particle.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="text-xl animate-ping">
            ❄️
          </div>
        </div>
      ))}
    </div>
  )
}

export default TapCounter