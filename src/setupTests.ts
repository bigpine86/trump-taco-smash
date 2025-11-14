// Jest setup file
import '@testing-library/jest-dom'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
  root = null
  rootMargin = ''
  thresholds = []
} as unknown as typeof IntersectionObserver

// Mock AudioContext
global.AudioContext = class AudioContext {
  constructor() {}
  close() {}
  createBuffer() {}
  createBufferSource() {}
  destination = {} as AudioDestinationNode
  currentTime = 0
  sampleRate = 44100
  baseLatency = 0
  outputLatency = 0
  createMediaElementSource = () => ({}) as unknown
  createMediaStreamDestination = () => ({}) as unknown
  createAnalyser = () => ({}) as unknown
  createBiquadFilter = () => ({}) as unknown
  createChannelMerger = () => ({}) as unknown
  createChannelSplitter = () => ({}) as unknown
  createConstantSource = () => ({}) as unknown
  createConvolver = () => ({}) as unknown
  createDelay = () => ({}) as unknown
  createDynamicsCompressor = () => ({}) as unknown
  createGain = () => ({}) as unknown
  createIIRFilter = () => ({}) as unknown
  createOscillator = () => ({}) as unknown
  createPanner = () => ({}) as unknown
  createPeriodicWave = () => ({}) as unknown
  createScriptProcessor = () => ({}) as unknown
  createStereoPanner = () => ({}) as unknown
  createWaveShaper = () => ({}) as unknown
  decodeAudioData = () => Promise.resolve({}) as unknown
  resume = () => Promise.resolve() as unknown
  suspend = () => Promise.resolve() as unknown
  getOutputTimestamp = () => ({}) as unknown
  listener = {} as AudioListener
  state = 'running' as AudioContextState
  onstatechange = null
} as unknown as typeof AudioContext