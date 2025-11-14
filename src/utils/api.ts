// API client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface Stats {
  totalTaps: number
  activeUsers: number
  countries: { [country: string]: number }
}

export interface TapResponse {
  success: boolean
  country: string
  countryTotal: number
  globalTotal: number
}

export interface CountryStats {
  country: string
  total: number
  percentage: number
}

export interface CountryRanking {
  country: string
  count: number
  percentage: number
}

// Simple fetch wrapper with error handling
async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// API functions
export const api = {
  // Get global stats
  getStats: (): Promise<Stats> => fetchAPI('/stats'),

  // Record a tap
  recordTap: (): Promise<TapResponse> => fetchAPI('/tap', {
    method: 'POST',
    body: JSON.stringify({}),
  }),

  // Get country stats
  getCountryStats: (country: string): Promise<CountryStats> => 
    fetchAPI(`/country/${country}`),

  // Get leaderboard data
  getLeaderboard: (): Promise<{ totalTaps: number; countries: CountryRanking[] }> => 
    fetchAPI('/leaderboard'),

  // Health check
  healthCheck: (): Promise<{ status: string; timestamp: string }> => 
    fetchAPI('/health'),
}

// Real-time SSE connection
export class RealtimeClient {
  private eventSource: EventSource | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectDelay = 1000

  constructor(private onMessage: (data: Stats) => void) {}

  connect() {
    if (this.eventSource) {
      this.disconnect()
    }

    try {
      this.eventSource = new EventSource(`${API_BASE_URL}/realtime`)

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.onMessage(data)
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error)
        this.scheduleReconnect()
      }

      this.eventSource.onopen = () => {
        console.log('SSE connection established')
        this.reconnectDelay = 1000 // Reset reconnect delay on successful connection
      }
    } catch (error) {
      console.error('Failed to establish SSE connection:', error)
      this.scheduleReconnect()
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect in ${this.reconnectDelay}ms...`)
      this.connect()
    }, this.reconnectDelay)

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
  }
}