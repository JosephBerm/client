/**
 * Test Utilities - Render With Providers
 * 
 * MAANG-Level: Custom render function that includes all necessary providers for testing.
 * Follows React Testing Library best practices for provider composition.
 * 
 * **Why This Exists:**
 * - Wraps components with all required providers (theme, auth, etc.)
 * - Provides consistent test setup across all tests
 * - Reduces boilerplate in individual test files
 * - Follows DRY principle
 * 
 * **Usage:**
 * ```typescript
 * import { renderWithProviders } from '@/test-utils/renderWithProviders'
 * 
 * test('my component', () => {
 *   const { getByText } = renderWithProviders(<MyComponent />)
 *   expect(getByText('Hello')).toBeInTheDocument()
 * })
 * ```
 */

import { render, type RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

/**
 * All Providers Wrapper
 * 
 * Wraps components with all necessary providers for testing.
 * Currently minimal, but can be extended as needed (ThemeProvider, etc.)
 */
function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/**
 * Custom render function that includes providers.
 * 
 * Use this instead of React Testing Library's `render` function to ensure
 * all components have access to required providers.
 * 
 * @param ui - Component to render
 * @param options - Optional render options (same as RTL's render options)
 * @returns Render result with all query methods and utilities
 * 
 * @example
 * ```typescript
 * const { getByText, container } = renderWithProviders(
 *   <CartItem item={mockCartItem} />
 * )
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

/**
 * Re-export all React Testing Library utilities for convenience.
 * Allows importing everything from one place.
 */
export * from '@testing-library/react'

/**
 * Re-export user-event utilities for convenience.
 */
export { default as userEvent } from '@testing-library/user-event'
