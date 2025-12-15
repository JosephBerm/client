/**
 * Vitest Setup File
 * 
 * MAANG-Level: Comprehensive test environment setup with all necessary mocks and globals.
 * This file runs before every test file, ensuring consistent test environment.
 * 
 * **What This Sets Up:**
 * - React Testing Library matchers (jest-dom)
 * - localStorage/sessionStorage mocks
 * - Next.js navigation mocks
 * - Global test utilities
 * - MSW (Mock Service Worker) setup
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi, beforeAll, afterAll } from 'vitest'
import { server } from './mocks/handlers'

// ============================================================================
// Cleanup After Each Test
// ============================================================================

/**
 * Cleanup DOM and reset mocks after each test.
 * Prevents test pollution and ensures test isolation.
 */
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// ============================================================================
// MSW (Mock Service Worker) Setup
// ============================================================================

/**
 * Start MSW server before all tests.
 * This enables API mocking for all test files.
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

/**
 * Reset MSW handlers after each test.
 * Prevents handler state from leaking between tests.
 */
afterEach(() => {
  server.resetHandlers()
})

/**
 * Clean up MSW server after all tests.
 */
afterAll(() => {
  server.close()
})

// ============================================================================
// localStorage/sessionStorage Mocks
// ============================================================================

/**
 * Mock localStorage to handle edge cases gracefully.
 * Tests for localStorage unavailable scenarios (Safari private mode).
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      try {
        store[key] = value.toString()
      } catch (e) {
        // Handle quota exceeded error
        throw new DOMException('QuotaExceededError')
      }
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

/**
 * Mock sessionStorage (similar to localStorage).
 */
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      try {
        store[key] = value.toString()
      } catch (e) {
        throw new DOMException('QuotaExceededError')
      }
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

// ============================================================================
// SSR Safety - Handle Undefined Window/Document
// ============================================================================

/**
 * Ensure window and document are defined.
 * Some tests may run in SSR context where these are undefined.
 */
if (typeof window === 'undefined') {
  // @ts-ignore - Global for SSR tests
  global.window = {}
}

if (typeof document === 'undefined') {
  // @ts-ignore - Global for SSR tests
  global.document = {}
}

// ============================================================================
// Next.js Navigation Mock
// ============================================================================

/**
 * Next.js navigation is mocked in __mocks__/next/navigation.ts
 * This ensures all tests use the mocked version automatically.
 */

// ============================================================================
// Global Test Utilities
// ============================================================================

/**
 * Reset all mocks between tests.
 * Called automatically by afterEach, but can be called manually if needed.
 */
global.resetAllMocks = () => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
}

// ============================================================================
// Console Suppression (Optional - for cleaner test output)
// ============================================================================

/**
 * Suppress console warnings/errors in tests (optional).
 * Uncomment if you want cleaner test output.
 */
// global.console = {
//   ...console,
//   warn: vi.fn(),
//   error: vi.fn(),
// }
