import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import ResizeObserver from 'resize-observer-polyfill'

// Polyfills
global.ResizeObserver = ResizeObserver

// Automatically unmount React components after each test to prevent memory leaks and test pollution
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
