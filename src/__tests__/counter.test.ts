import { useCounterStore } from '../store/counterStore'

describe('Counter Store - Macro Prevention', () => {
  let store: ReturnType<typeof useCounterStore.getState>

  beforeEach(() => {
    // Reset store before each test
    useCounterStore.setState({
      count: 0,
      totalCount: 0,
      country: 'KR',
      isAnimating: false,
      currentImageIndex: 0,
      tapHistory: [],
      lastTapTime: 0,
      isMacroDetected: false
    })
    store = useCounterStore.getState()
  })

  test('should increment counter normally', () => {
    expect(store.count).toBe(0)
    store.increment()
    expect(store.count).toBe(1)
  })

  test('should detect macro when tapping too fast', () => {
    // Simulate rapid tapping (more than 15 taps per second)
    for (let i = 0; i < 20; i++) {
      store.increment()
    }
    
    // After macro detection, increment should be blocked
    const countBefore = store.count
    store.increment()
    expect(store.count).toBe(countBefore) // Should not increment
    expect(store.isMacroDetected).toBe(true)
  })

  test('should reset macro detection after timeout', (done) => {
    // Trigger macro detection
    for (let i = 0; i < 20; i++) {
      store.increment()
    }
    
    expect(store.isMacroDetected).toBe(true)
    
    // Wait for macro detection to reset (5 seconds)
    setTimeout(() => {
      store.resetMacroDetection()
      expect(store.isMacroDetected).toBe(false)
      expect(store.tapHistory).toEqual([])
      done()
    }, 100)
  })

  test('should change image after certain number of taps', () => {
    const initialImageIndex = store.currentImageIndex
    
    // Simulate many taps to trigger image change
    for (let i = 0; i < 100; i++) {
      store.increment()
    }
    
    // Image should change at some point (50-200 taps)
    expect(store.currentImageIndex).not.toBe(initialImageIndex)
  })

  test('should handle animation state correctly', (done) => {
    expect(store.isAnimating).toBe(false)
    
    store.increment()
    expect(store.isAnimating).toBe(true)
    
    // Animation should reset after 300ms
    setTimeout(() => {
      expect(store.isAnimating).toBe(false)
      done()
    }, 350)
  })
})