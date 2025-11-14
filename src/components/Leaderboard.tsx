import React, { useState, useEffect } from 'react'
import { api, Stats, CountryRanking } from '../utils/api'

interface LeaderboardProps {
  globalStats: Stats
  userCountry: string
}

const COUNTRY_DATA: { [key: string]: { name: string; flag: string } } = {
  'KR': { name: 'South Korea', flag: '🇰🇷' },
  'US': { name: 'United States', flag: '🇺🇸' },
  'JP': { name: 'Japan', flag: '🇯🇵' },
  'CN': { name: 'China', flag: '🇨🇳' },
  'TW': { name: 'Taiwan', flag: '🇹🇼' },
  'TH': { name: 'Thailand', flag: '🇹🇭' },
  'HK': { name: 'Hong Kong', flag: '🇭🇰' },
  'MY': { name: 'Malaysia', flag: '🇲🇾' },
  'SG': { name: 'Singapore', flag: '🇸🇬' },
  'VN': { name: 'Vietnam', flag: '🇻🇳' },
  'PH': { name: 'Philippines', flag: '🇵🇭' },
  'ID': { name: 'Indonesia', flag: '🇮🇩' },
  'IN': { name: 'India', flag: '🇮🇳' },
  'BR': { name: 'Brazil', flag: '🇧🇷' },
  'DE': { name: 'Germany', flag: '🇩🇪' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧' },
  'FR': { name: 'France', flag: '🇫🇷' },
  'IT': { name: 'Italy', flag: '🇮🇹' },
  'ES': { name: 'Spain', flag: '🇪🇸' },
  'AU': { name: 'Australia', flag: '🇦🇺' },
  'CA': { name: 'Canada', flag: '🇨🇦' },
  'SA': { name: 'Saudi Arabia', flag: '🇸🇦' },
  'FI': { name: 'Finland', flag: '🇫🇮' },
  'SE': { name: 'Sweden', flag: '🇸🇪' },
  'PL': { name: 'Poland', flag: '🇵🇱' },
  'AE': { name: 'United Arab Emirates', flag: '🇦🇪' },
  'DK': { name: 'Denmark', flag: '🇩🇰' }
}

const Leaderboard: React.FC<LeaderboardProps> = ({ globalStats, userCountry }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [rankings, setRankings] = useState<CountryRanking[]>([])
  const [worldwidePPS, setWorldwidePPS] = useState(0)

  useEffect(() => {
    api.getLeaderboard()
      .then(data => {
        // Get all countries, not just top 10
        const allRankings = Object.entries(globalStats.countries)
          .map(([country, count]) => ({
            country,
            count,
            percentage: globalStats.totalTaps > 0 ? (count / globalStats.totalTaps) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count)
        
        setRankings(allRankings)
        
        // Calculate PPS (Pops Per Second) - simplified calculation
        setWorldwidePPS(allRankings.length > 0 ? Math.round(globalStats.totalTaps / 3600) : 0) // Rough estimate
      })
      .catch(console.error)
  }, [globalStats])

  const getMedalIcon = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈' 
    if (index === 2) return '🥉'
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {/* Collapsed View - Exactly like Popcat */}
      <div 
        className="bg-white bg-opacity-95 rounded-lg cursor-pointer hover:bg-opacity-100 transition-all duration-200 border border-gray-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Trophy + #1 Country */}
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏆</span>
            {rankings.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">#1</span>
                <span className="text-lg">
                  {COUNTRY_DATA[rankings[0].country]?.flag || '🏳️'}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {rankings[0].count.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Center: Ellipsis */}
          <div className="flex-1 text-center">
            <span className="text-gray-500 text-lg">⋯</span>
          </div>

          {/* Right: User's Country */}
          <div className="flex items-center space-x-2">
            {rankings.length > 0 && (
              <>
                <span className="text-lg">
                  {COUNTRY_DATA[userCountry]?.flag || '🏳️'}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {globalStats.countries[userCountry]?.toLocaleString() || '0'}
                </span>
              </>
            )}
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded View - Exactly like Popcat */}
      {isExpanded && (
        <div className="mt-2 bg-white bg-opacity-95 rounded-lg border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌍</span>
              <span className="text-lg font-medium text-gray-800">Leaderboard</span>
            </div>
            <div className="text-sm text-gray-600">
              {worldwidePPS} PPS
            </div>
          </div>

          {/* Worldwide Section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🌍</span>
                <span className="text-sm font-medium text-gray-800">Worldwide</span>
                <span className="text-xs text-green-600 font-medium">{worldwidePPS} PPS</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {globalStats.totalTaps.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Country Rankings */}
          <div className="p-4">
            <div className="space-y-3">
              {rankings.map((ranking, index) => {
                const countryInfo = COUNTRY_DATA[ranking.country] || { name: ranking.country, flag: '🏳️' }
                const isUserCountry = ranking.country === userCountry
                const medalIcon = getMedalIcon(index)
                
                return (
                  <div 
                    key={ranking.country} 
                    className={`flex items-center justify-between py-2 px-3 rounded transition-colors duration-150 ${
                      isUserCountry ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 text-center">
                        {medalIcon ? (
                          <span className="text-lg">{medalIcon}</span>
                        ) : (
                          <span className={`text-sm font-bold text-gray-600`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <span className="text-lg">
                        {countryInfo.flag}
                      </span>
                      <span className={`text-sm font-medium ${
                        isUserCountry ? 'text-blue-700 font-bold' : 'text-gray-800'
                      }`}>
                        {countryInfo.name}
                      </span>
                      {isUserCountry && <span className="text-xs text-blue-600">(You)</span>}
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        isUserCountry ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {ranking.count.toLocaleString()}
                      </div>
                      {index === 7 && ranking.country === 'US' && (
                        <div className="text-xs text-green-600 font-medium">
                          {worldwidePPS} PPS
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {rankings.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">No data available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard