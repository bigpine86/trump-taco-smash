import React, { useState, useEffect, useCallback } from 'react'
import { useCounterStore } from '../store/counterStore'
import { playTrumpHitSound } from '../utils/trumpHitSound'
import { api, RealtimeClient, Stats } from '../utils/api'
import Leaderboard from './Leaderboard'
import RotatingNumber from './RotatingNumber'
import AdSense from './AdSense'
import AdSenseTest from './AdSenseTest'

// Trump real images - keep original Popcat design
const TRUMP_IMAGES = {
  normal: '/images/trump-real/trump-normal.png',
  punched1: '/images/trump-real/trump-punched1.png',
  punched2: '/images/trump-real/trump-punched2.png'
}

const TapCounter: React.FC = () => {
  const { 
    count, 
    country, 
    isAnimating, 
    isMacroDetected,
    increment, 
    setCountry
  } = useCounterStore()

  const [globalStats, setGlobalStats] = useState<Stats>({ totalTaps: 0, activeUsers: 0, countries: {} })
  const [currentTrumpImage, setCurrentTrumpImage] = useState(TRUMP_IMAGES.normal)
  const [consecutiveTaps, setConsecutiveTaps] = useState(0)
  const [isPunched, setIsPunched] = useState(false)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [isMouseDown, setIsMouseDown] = useState(false)

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

  // Handle tap/click with Trump hit effect
  const handleTap = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (isMacroDetected) return

    // Get position for future effects (currently unused)
    let clientX: number, clientY: number
    if ('touches' in event) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    // Mobile vibration feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // 50ms 진동
    }

    // Check if taps are consecutive (within 0.5 seconds)
    const currentTime = Date.now()
    const timeSinceLastTap = currentTime - lastTapTime
    
    // Reset consecutive taps if too much time passed (0.5초)
    if (timeSinceLastTap > 500) {
      setConsecutiveTaps(1)
    } else {
      setConsecutiveTaps(prev => prev + 1)
    }
    setLastTapTime(currentTime)

    // Determine which punched image to show based on click frequency
    let punchedImage = TRUMP_IMAGES.punched1
    const currentConsecutive = timeSinceLastTap > 500 ? 1 : consecutiveTaps + 1
    
    // Alternate between punched1 and punched2 based on click patterns
    if (currentConsecutive > 8 && currentConsecutive % 2 === 0) {
      punchedImage = TRUMP_IMAGES.punched2
    }

    // Show punched image immediately
    setCurrentTrumpImage(punchedImage)
    setIsPunched(true)

    // Play Trump hit sound
    playTrumpHitSound()

    // Optimistic update for immediate feedback
    optimisticUpdate()

    // Increment counter and sync with backend
    increment()
    api.recordTap().catch(console.error)

    // Return to normal image after delay (200ms)
    setTimeout(() => {
      // 마우스를 누르고 있지 않을 때만 원래 이미지로 돌아가기
      if (!isMouseDown) {
        setCurrentTrumpImage(TRUMP_IMAGES.normal)
        setIsPunched(false)
      }
    }, 200)
  }, [consecutiveTaps, increment, isMacroDetected, optimisticUpdate, lastTapTime, isMouseDown])

  // Handle mouse down - keep punched image while holding
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsMouseDown(true)
    handleTap(event)
  }, [handleTap])

  // Handle mouse up - return to normal image
  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false)
    setCurrentTrumpImage(TRUMP_IMAGES.normal)
    setIsPunched(false)
  }, [])

  // Handle mouse leave - return to normal image
  const handleMouseLeave = useCallback(() => {
    setIsMouseDown(false)
    setCurrentTrumpImage(TRUMP_IMAGES.normal)
    setIsPunched(false)
  }, [])

  // Prevent default touch behavior for better mobile experience
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    handleTap(event)
  }, [handleTap])

  // Use test ads during development, real AdSense in production
  const isDevelopment = import.meta.env.DEV
  const AdComponent = isDevelopment ? AdSenseTest : AdSense

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4 select-none overflow-hidden relative">

      {/* Counter Display - Positioned at top like Popcat */}
      <div className="text-center mb-4 z-20 absolute top-8">
        <div className="text-8xl font-black text-gray-800">
          <RotatingNumber value={count} />
        </div>
      </div>

      {/* Trump Character - Full screen immersive like Popcat */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div
          className={`relative transition-transform duration-150 ${
            isAnimating ? 'scale-105' : 'scale-100'
          } ${isMacroDetected ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleTap}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={currentTrumpImage}
            alt={isPunched ? "Trump punched" : "Trump normal"}
            className="w-screen h-screen object-contain max-w-none max-h-none"
            draggable={false}
            style={{ maxWidth: '100vw', maxHeight: '80vh' }}
          />
          
          {/* Hit effect overlay when punched */}
          {isPunched && (
            <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full animate-ping" />
          )}
          
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

      {/* Leaderboard - Positioned at bottom like Popcat */}
      <div className="z-20 absolute bottom-32 w-full max-w-4xl mx-auto">
        <Leaderboard globalStats={globalStats} userCountry={country} />
      </div>

      {/* Bottom Ad - Moved to very bottom */}
      <div className="w-full max-w-4xl mx-auto absolute bottom-0">
        <AdComponent slot="0987654321" className="w-full h-32" />
      </div>
    </div>
  )
}

export default TapCounter