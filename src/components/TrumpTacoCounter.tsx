import React, { useState, useEffect, useCallback } from 'react'
import { useCounterStore } from '../store/counterStore'
import { playTrumpTacoSound, playTransformationSound } from '../utils/trumpTacoSound'
import { api, RealtimeClient, Stats } from '../utils/api'
import Leaderboard from './Leaderboard'
import RotatingNumber from './RotatingNumber'
import AdSense from './AdSense'
import AdSenseTest from './AdSenseTest'

// Trump transformation stages
const TRUMP_STAGES = [
  '/images/trump-taco/trump-stage1.svg', // Normal Trump
  '/images/trump-taco/trump-stage2.svg', // Starting to transform
  '/images/trump-taco/trump-stage3.svg', // Half chicken
  '/images/trump-taco/trump-stage4.svg', // Almost chicken
  '/images/trump-taco/trump-stage5.svg'  // Full chicken
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
  const [trumpStage, setTrumpStage] = useState(0) // 0-4 stages
  const [consecutiveTaps, setConsecutiveTaps] = useState(0)
  const [hammerVisible, setHammerVisible] = useState(false)
  const [hammerPosition, setHammerPosition] = useState({ x: 0, y: 0 })

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

  // Handle tap/click with Trump transformation
  const handleTap = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (isMacroDetected) return

    // Get position for hammer effect
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    
    // Show hammer at tap position
    setHammerPosition({ x: clientX, y: clientY })
    setHammerVisible(true)
    setTimeout(() => setHammerVisible(false), 200)

    // Increment consecutive taps for transformation
    const newConsecutiveTaps = consecutiveTaps + 1
    setConsecutiveTaps(newConsecutiveTaps)

    // Determine Trump stage based on consecutive taps
    // Reset to 0 after reaching max stage, or reset after 3 seconds of no taps
    let newStage = Math.floor(newConsecutiveTaps / 10) % TRUMP_STAGES.length
    setTrumpStage(newStage)

    // Play sound
    playTrumpTacoSound()
    
    // Play transformation sound if reaching new stage
    if (newConsecutiveTaps % 10 === 0 && newStage > 0) {
      setTimeout(() => playTransformationSound(), 100)
    }

    // Add particle effect
    const newParticle = {
      id: Date.now(),
      x: Math.random() * 100,
      y: Math.random() * 100
    }
    setParticles(prev => [...prev.slice(-5), newParticle])

    // Optimistic update
    optimisticUpdate()

    // Record tap on server
    api.recordTap().catch(console.error)

    // Increment counter
    increment()
  }, [isMacroDetected, consecutiveTaps, increment, optimisticUpdate])

  // Reset consecutive taps after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setConsecutiveTaps(0)
      setTrumpStage(0)
    }, 3000)

    return () => clearTimeout(timer)
  }, [consecutiveTaps])

  // Remove old particles
  useEffect(() => {
    const timer = setTimeout(() => {
      setParticles(prev => prev.slice(-5))
    }, 1000)

    return () => clearTimeout(timer)
  }, [particles])

  return (
    <div className="min-h-screen bg-red-100 flex flex-col items-center justify-center p-4 select-none overflow-hidden relative">
      {/* Hammer effect */}
      {hammerVisible && (
        <div 
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: hammerPosition.x,
            top: hammerPosition.y,
            animation: 'hammer-hit 0.2s ease-out'
          }}
        >
          <img src="/images/trump-taco/hammer.svg" alt="Hammer" className="w-16 h-16" />
        </div>
      )}

      <style jsx>{`
        @keyframes hammer-hit {
          0% { transform: translate(-50%, -50%) scale(1.5) rotate(-20deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }
        @keyframes trump-shrink {
          0% { transform: scale(1); }
          100% { transform: scale(0.6); }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-4xl font-bold text-red-800 mb-2">Trump Taco Smash!</h1>
        <p className="text-red-600 text-lg">Click to transform Trump into chicken!</p>
        <p className="text-red-500 text-sm">Consecutive hits: {consecutiveTaps} | Stage: {trumpStage + 1}/5</p>
      </div>

      {/* Counter */}
      <div className="text-center mb-8 z-10">
        <RotatingNumber value={count} />
      </div>

      {/* Trump Transformation Area */}
      <div 
        className="relative mb-8 cursor-pointer select-none"
        onClick={handleTap}
        onTouchStart={handleTap}
        style={{
          animation: trumpStage === 4 ? 'trump-shrink 0.5s ease-out forwards' : 'none'
        }}
      >
        <img 
          src={TRUMP_STAGES[trumpStage]} 
          alt={`Trump stage ${trumpStage + 1}`}
          className={`w-48 h-48 object-contain transition-all duration-300 ${
            isAnimating ? 'scale-95' : 'scale-100'
          } ${
            trumpStage >= 3 ? 'animate-bounce' : ''
          }`}
          draggable={false}
        />
        
        {/* Particle effects */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute text-2xl animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 5)]
            }}
          >
            💥
          </div>
        ))}
      </div>

      {/* Macro detection warning */}
      {isMacroDetected && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ⚠️ Macro detected! Slow down!
        </div>
      )}

      {/* Stats */}
      <div className="text-center mb-8 z-10">
        <div className="bg-white bg-opacity-80 rounded-lg p-4 shadow-lg">
          <div className="text-sm text-gray-600 mb-2">Your Country: {country}</div>
          <div className="text-lg font-semibold text-gray-800">
            Your Taps: {globalStats.countries[country]?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-600">
            Global Total: {globalStats.totalTaps.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Active Users: {globalStats.activeUsers}
          </div>
        </div>
      </div>

      {/* Ads */}
      <div className="w-full max-w-md mb-8">
        <AdSenseTest />
      </div>

      {/* Leaderboard */}
      <Leaderboard globalStats={globalStats} userCountry={country} />

      {/* Footer */}
      <div className="text-center mt-8 text-red-500 text-sm z-10">
        <p>Keep tapping to see Trump transform! 🐔</p>
        <p className="text-xs mt-1">10 taps per transformation stage</p>
      </div>
    </div>
  )
}

export default TapCounter