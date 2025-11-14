import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage for simplicity (in production, use a database)
interface CountryData {
  [country: string]: number
}

interface GlobalStats {
  totalTaps: number
  activeUsers: number
  countries: CountryData
}

const stats: GlobalStats = {
  totalTaps: 0,
  activeUsers: 0,
  countries: {}
}

// Get client country from IP (simplified)
const getCountryFromIP = (req: express.Request): string => {
  // In a real app, you'd use a service like ipapi.co or similar
  // For now, we'll use a default or check headers
  const cfCountry = req.headers['cf-ipcountry'] as string
  // const xForwardedFor = req.headers['x-forwarded-for'] as string
  
  // Default to KR for Korean users, or use CF header if available
  return cfCountry || 'KR'
}

// API Routes
app.get('/api/stats', (req, res) => {
  res.json(stats)
})

app.post('/api/tap', (req, res) => {
  const country = getCountryFromIP(req)
  
  // Update stats
  stats.totalTaps++
  stats.countries[country] = (stats.countries[country] || 0) + 1
  
  res.json({
    success: true,
    country,
    countryTotal: stats.countries[country],
    globalTotal: stats.totalTaps
  })
})

app.get('/api/country/:country', (req, res) => {
  const { country } = req.params
  const countryTotal = stats.countries[country] || 0
  
  res.json({
    country,
    total: countryTotal,
    percentage: stats.totalTaps > 0 ? (countryTotal / stats.totalTaps) * 100 : 0
  })
})

// SSE endpoint for real-time updates
app.get('/api/realtime', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  // Send initial data
  res.write(`data: ${JSON.stringify(stats)}\n\n`)

  // Send updates every 500ms for ultra-responsive feel
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify(stats)}\n\n`)
  }, 500)

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(interval)
  })
})

// Get leaderboard data
app.get('/api/leaderboard', (req, res) => {
  const countryRankings = Object.entries(stats.countries)
    .map(([country, count]) => ({
      country,
      count,
      percentage: stats.totalTaps > 0 ? (count / stats.totalTaps) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  res.json({
    totalTaps: stats.totalTaps,
    countries: countryRankings
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(port, () => {
  console.log(`🐧 Penguin Tap Game API running on port ${port}`)
  console.log(`📊 Stats endpoint: http://localhost:${port}/api/stats`)
  console.log(`🔄 Real-time updates: http://localhost:${port}/api/realtime`)
})