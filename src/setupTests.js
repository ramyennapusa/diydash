import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

jest.mock('./services/api')

// Polyfills for React Router compatibility
globalThis.TextEncoder = TextEncoder
globalThis.TextDecoder = TextDecoder

afterEach(() => {
  sessionStorage.clear()
  jest.clearAllMocks()
})

// Mock window.matchMedia for responsive design tests
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