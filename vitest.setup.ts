/**
 * Vitest Setup File
 * 
 * Comprehensive test environment setup following official Vitest patterns.
 * This file runs before every test file, ensuring consistent test environment.
 * 
 * **What This Sets Up:**
 * - React Testing Library matchers (jest-dom)
 * - localStorage/sessionStorage mocks
 * - Next.js navigation mocks
 * - MSW (Mock Service Worker) setup
 * 
 * @see https://vitest.dev/config/#setupfiles
 * @see https://testing-library.com/docs/react-testing-library/setup
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi, beforeAll, afterAll } from 'vitest'
import { server } from './mocks/handlers'

// ============================================================================
// localStorage/sessionStorage Mocks
// Must be defined before afterEach hooks that reference them
// ============================================================================

/**
 * Mock localStorage to handle edge cases gracefully.
 * Tests for localStorage unavailable scenarios (Safari private mode).
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Storage
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      try {
        store[key] = value.toString()
      } catch {
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
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
 */
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      try {
        store[key] = value.toString()
      } catch {
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
// MSW (Mock Service Worker) Setup
// ============================================================================

/**
 * Start MSW server before all tests.
 * This enables API mocking for all test files.
 * 
 * @see https://mswjs.io/docs/integrations/node
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

/**
 * Clean up MSW server after all tests.
 */
afterAll(() => {
  server.close()
})

// ============================================================================
// Cleanup After Each Test
// Single afterEach hook for all cleanup (MAANG best practice)
// ============================================================================

/**
 * Comprehensive cleanup after each test.
 * 
 * Combines all cleanup operations in a single hook for:
 * - Better performance (single hook registration)
 * - Clear execution order
 * - Easier debugging
 * 
 * @see https://vitest.dev/api/vi.html#vi-clearallmocks
 * @see https://testing-library.com/docs/react-testing-library/api#cleanup
 */
afterEach(() => {
  // 1. Clean up React Testing Library DOM
  cleanup()
  
  // 2. Reset MSW handlers to defaults
  server.resetHandlers()
  
  // 3. Clear all Vitest mocks (call history, not implementations)
  vi.clearAllMocks()
  
  // 4. Clear storage mocks to prevent test pollution
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// ============================================================================
// SSR Safety - Handle Undefined Window/Document
// ============================================================================

/**
 * Ensure window and document are defined for SSR tests.
 * Some tests may run in SSR context where these are undefined.
 */
if (typeof window === 'undefined') {
  // @ts-expect-error - Global for SSR tests
  global.window = {}
}

if (typeof document === 'undefined') {
  // @ts-expect-error - Global for SSR tests
  global.document = {}
}

// ============================================================================
// Next.js Navigation Mock
// ============================================================================

/**
 * Next.js navigation is mocked in __mocks__/next/navigation.ts
 * This ensures all tests use the mocked version automatically.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/testing/vitest
 */
