/**
 * Next.js Navigation Mock
 * 
 * MAANG-Level: Comprehensive Next.js navigation mocking for test isolation.
 * Mocks all Next.js App Router navigation hooks and utilities.
 * 
 * **Why Mock Next.js Navigation?**
 * - Tests should be isolated from Next.js routing
 * - Prevents actual navigation during tests
 * - Allows verification of navigation calls
 * - Works in jsdom environment (no actual routing)
 */

import { vi } from 'vitest'

/**
 * Mock router object with all Next.js router methods.
 */
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
}

/**
 * Mock useRouter hook.
 * Returns the mock router object.
 */
export const useRouter = () => mockRouter

/**
 * Mock usePathname hook.
 * Returns current pathname (can be overridden in tests).
 */
export const usePathname = vi.fn(() => '/')

/**
 * Mock useSearchParams hook.
 * Returns URLSearchParams object (can be overridden in tests).
 */
export const useSearchParams = vi.fn(() => new URLSearchParams())

/**
 * Mock useParams hook.
 * Returns route parameters object (can be overridden in tests).
 */
export const useParams = vi.fn(() => ({}))

/**
 * Mock redirect function.
 * Throws an error that can be caught in tests.
 */
export const redirect = vi.fn((url: string) => {
  throw new Error(`Redirect to: ${url}`)
})

/**
 * Mock notFound function.
 * Throws an error that can be caught in tests.
 */
export const notFound = vi.fn(() => {
  throw new Error('Not Found')
})

/**
 * Helper function to reset all navigation mocks.
 * Useful in beforeEach or afterEach hooks.
 */
export const resetNavigationMocks = () => {
  mockRouter.push.mockClear()
  mockRouter.replace.mockClear()
  mockRouter.refresh.mockClear()
  mockRouter.back.mockClear()
  mockRouter.forward.mockClear()
  mockRouter.prefetch.mockClear()
  usePathname.mockClear()
  useSearchParams.mockClear()
  useParams.mockClear()
  redirect.mockClear()
  notFound.mockClear()
}

/**
 * Helper function to set mock pathname.
 * Useful for testing pathname-dependent logic.
 */
export const setMockPathname = (pathname: string) => {
  usePathname.mockReturnValue(pathname)
  mockRouter.pathname = pathname
}

/**
 * Helper function to set mock search params.
 * Useful for testing query parameter-dependent logic.
 */
export const setMockSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams(params)
  useSearchParams.mockReturnValue(searchParams)
}

/**
 * Helper function to set mock route params.
 * Useful for testing dynamic route parameters.
 */
export const setMockParams = (params: Record<string, string>) => {
  useParams.mockReturnValue(params)
}
