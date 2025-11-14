import { api } from '../utils/api'

// Mock fetch for testing
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.Mock

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test('should fetch stats successfully', async () => {
    const mockStats = {
      totalTaps: 1000,
      activeUsers: 50,
      countries: { KR: 500, US: 300, JP: 200 }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    })

    const stats = await api.getStats()
    expect(stats).toEqual(mockStats)
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/stats', {
      headers: { 'Content-Type': 'application/json' }
    })
  })

  test('should record tap successfully', async () => {
    const mockResponse = {
      success: true,
      country: 'KR',
      countryTotal: 10,
      globalTotal: 100
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await api.recordTap()
    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
  })

  test('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    await expect(api.getStats()).rejects.toThrow('API Error: 500')
  })

  test('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(api.getStats()).rejects.toThrow('Network error')
  })
})