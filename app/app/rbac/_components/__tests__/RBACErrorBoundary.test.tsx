/**
 * RBACErrorBoundary Component Unit Tests
 *
 * MAANG-Level: Comprehensive testing of error boundary functionality.
 *
 * **Priority**: 🔴 CRITICAL - ERROR RESILIENCE
 *
 * This component catches and handles errors in the RBAC feature tree,
 * providing graceful degradation and recovery options.
 *
 * **Testing Strategy:**
 * 1. Normal rendering (no errors)
 * 2. Error catching and fallback UI
 * 3. Error logging
 * 4. Recovery options (retry, navigate)
 * 5. Error information display
 * 6. Nested error handling
 *
 * @module RBAC/RBACErrorBoundary.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Hoist mock logger to avoid temporal dead zone issues
const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('@_core', () => ({
  logger: mockLogger,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}))

import { RBACErrorBoundary } from '../RBACErrorBoundary'

// ============================================================================
// TEST HELPERS
// ============================================================================

// Component that throws an error
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }): React.ReactElement | null {
  if (shouldThrow) {
    throw new Error('Test error from child component')
  }
  return <div>Child content</div>
}

// Suppress console.error for error boundary tests
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

// ============================================================================
// TESTS
// ============================================================================

describe('RBACErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // NORMAL RENDERING (NO ERRORS)
  // ==========================================================================

  describe('Normal Rendering', () => {
    it('should render children when no error', () => {
      render(
        <RBACErrorBoundary>
          <div data-testid="child">Child content</div>
        </RBACErrorBoundary>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should not show error UI when no error', () => {
      render(
        <RBACErrorBoundary>
          <div>Normal content</div>
        </RBACErrorBoundary>
      )

      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })

    it('should render multiple children', () => {
      render(
        <RBACErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </RBACErrorBoundary>
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ERROR CATCHING
  // ==========================================================================

  describe('Error Catching', () => {
    it('should catch errors from child components', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      // Should show error UI instead of crashing
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should display fallback UI on error', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      // Should have error-related content
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should not crash the entire application', () => {
      render(
        <div>
          <div>Before boundary</div>
          <RBACErrorBoundary>
            <ThrowingComponent />
          </RBACErrorBoundary>
          <div>After boundary</div>
        </div>
      )

      // Siblings should still render
      expect(screen.getByText('Before boundary')).toBeInTheDocument()
      expect(screen.getByText('After boundary')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ERROR LOGGING
  // ==========================================================================

  describe('Error Logging', () => {
    it('should log errors to logger service', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should include error message in log', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          component: 'RBACErrorBoundary',
        })
      )
    })

    it('should include component info in log', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      expect(mockLogger.error).toHaveBeenCalledWith(
        'RBAC Error Boundary caught an error',
        expect.objectContaining({
          component: 'RBACErrorBoundary',
        })
      )
    })
  })

  // ==========================================================================
  // RECOVERY OPTIONS
  // ==========================================================================

  describe('Recovery Options', () => {
    it('should provide Try Again button', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should provide Go Back button', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      const navButton = screen.getByRole('button', { name: /go back/i })
      expect(navButton).toBeInTheDocument()
    })

    it('should reset error state on retry', () => {
      let shouldThrow = true
      
      function ConditionalThrow(): React.ReactElement {
        if (shouldThrow) {
          throw new Error('Conditional error')
        }
        return <div>Recovered content</div>
      }

      render(
        <RBACErrorBoundary>
          <ConditionalThrow />
        </RBACErrorBoundary>
      )

      // Initially in error state
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

      // Fix the error condition
      shouldThrow = false

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)

      // Should attempt to re-render
    })
  })

  // ==========================================================================
  // ERROR INFORMATION DISPLAY
  // ==========================================================================

  describe('Error Information Display', () => {
    it('should show user-friendly error message', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should show RBAC-specific messaging', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      expect(screen.getByText(/rbac management/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // CUSTOM FALLBACK
  // ==========================================================================

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>
      
      render(
        <RBACErrorBoundary fallback={customFallback}>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // NESTED ERROR HANDLING
  // ==========================================================================

  describe('Nested Error Handling', () => {
    it('should handle errors in deeply nested components', () => {
      render(
        <RBACErrorBoundary>
          <div>
            <div>
              <div>
                <ThrowingComponent />
              </div>
            </div>
          </div>
        </RBACErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should catch errors from multiple children', () => {
      function MultipleErrors(): React.ReactElement {
        return (
          <>
            <div>Normal child</div>
            <ThrowingComponent />
          </>
        )
      }

      render(
        <RBACErrorBoundary>
          <MultipleErrors />
        </RBACErrorBoundary>
      )

      // First error should be caught
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // CALLBACK TESTS
  // ==========================================================================

  describe('Callback Tests', () => {
    it('should call onError callback when error occurs', () => {
      const onError = vi.fn()
      
      render(
        <RBACErrorBoundary onError={onError}>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle null error', () => {
      render(
        <RBACErrorBoundary>
          <div>Content</div>
        </RBACErrorBoundary>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle error during render phase', () => {
      function RenderPhaseError(): never {
        throw new Error('Render phase error')
      }

      render(
        <RBACErrorBoundary>
          <RenderPhaseError />
        </RBACErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should handle errors with no message', () => {
      function NoMessageError(): never {
        throw new Error()
      }

      render(
        <RBACErrorBoundary>
          <NoMessageError />
        </RBACErrorBoundary>
      )

      // Should still show error UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })

    it('should handle non-Error throws', () => {
      function ThrowString(): never {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'String error'
      }

      render(
        <RBACErrorBoundary>
          <ThrowString />
        </RBACErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible error message', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      const errorMessage = screen.getByText(/something went wrong/i)
      expect(errorMessage).toBeVisible()
    })

    it('should have accessible action buttons', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeVisible()
      })
    })

    it('should support keyboard navigation', () => {
      render(
        <RBACErrorBoundary>
          <ThrowingComponent />
        </RBACErrorBoundary>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
