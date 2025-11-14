import { create } from 'zustand'

interface CounterState {
  count: number
  totalCount: number
  country: string
  isAnimating: boolean
  currentImageIndex: number
  tapHistory: number[]
  lastTapTime: number
  isMacroDetected: boolean
  
  // Actions
  increment: () => void
  setCountry: (country: string) => void
  setAnimating: (animating: boolean) => void
  setImageIndex: (index: number) => void
  checkMacro: () => boolean
  resetMacroDetection: () => void
}

const MACRO_THRESHOLD = 15 // Maximum taps per second
const MACRO_WINDOW = 1000 // 1 second window

export const useCounterStore = create<CounterState>((set, get) => ({
  count: 0,
  totalCount: 0,
  country: 'KR',
  isAnimating: false,
  currentImageIndex: 0,
  tapHistory: [],
  lastTapTime: 0,
  isMacroDetected: false,

  increment: () => {
    const state = get()
    
    // Check for macro before incrementing
    if (state.checkMacro()) {
      return
    }
    
    const now = Date.now()
    const newTapHistory = [...state.tapHistory, now].filter(
      timestamp => now - timestamp < MACRO_WINDOW
    )
    
    set({
      count: state.count + 1,
      totalCount: state.totalCount + 1,
      tapHistory: newTapHistory,
      lastTapTime: now,
      isAnimating: true
    })

    // Reset animation after 300ms
    setTimeout(() => {
      set({ isAnimating: false })
    }, 300)
  },

  setCountry: (country) => set({ country }),
  setAnimating: (animating) => set({ isAnimating: animating }),
  setImageIndex: (index) => set({ currentImageIndex: index }),

  checkMacro: () => {
    const state = get()
    const now = Date.now()
    const recentTaps = state.tapHistory.filter(
      timestamp => now - timestamp < MACRO_WINDOW
    )
    
    const isMacro = recentTaps.length >= MACRO_THRESHOLD
    if (isMacro) {
      set({ isMacroDetected: true })
      setTimeout(() => {
        set({ isMacroDetected: false })
      }, 5000) // Block for 5 seconds
    }
    
    return isMacro
  },

  resetMacroDetection: () => {
    set({ 
      tapHistory: [], 
      isMacroDetected: false,
      lastTapTime: 0
    })
  }
}))