/**
 * Table Error Boundary Component
 * 
 * Error boundary to gracefully handle errors in table rendering,
 * preventing entire app crashes. Implements FAANG-level error handling.
 * 
 * @module TableErrorBoundary
 */

'use client'

import type { ReactNode } from 'react';
import { Component } from 'react'

import { logger } from '@_core'

import { COMPONENT_NAMES } from '../types/divTableConstants'

// ============================================================================
// Props & State
// ============================================================================

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
}

// ============================================================================
// Component
// ============================================================================

/**
 * Error boundary for table components
 * Catches errors in virtualization, drag-drop, and complex cell renderers
 * 
 * @example
 * ```tsx
 * <TableErrorBoundary>
 *   <DivTable {...props} />
 * </TableErrorBoundary>
 * ```
 */
export class TableErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  /**
   * Log error and call custom error handler
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with structured logging
    logger.error('Table error boundary caught error', {
      component: COMPONENT_NAMES.TABLE_ERROR_BOUNDARY,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date(),
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  /**
   * Reset error state when resetKeys change
   */
  componentDidUpdate(prevProps: Props) {
    if (!this.state.hasError) {return}

    const { resetKeys } = this.props
    if (!resetKeys || !prevProps.resetKeys) {return}

    // Reset if any reset key changed
    if (resetKeys.some((key, index) => key !== prevProps.resetKeys![index])) {
      this.setState({ hasError: false, error: null })
    }
  }

  /**
   * Render children or fallback
   */
  async render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback with DaisyUI styling
      return (
        <div role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <div className="font-semibold">Table Error</div>
            <div className="text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </div>
            <div className="text-xs mt-2 opacity-70">
              Please refresh the page or contact support if the problem persists.
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================================================
// Custom Fallback Components
// ============================================================================

/**
 * Minimalist error fallback for compact spaces
 */
export function MinimalErrorFallback({ error }: { error?: Error }) {
  return (
    <div
      role="alert"
      className="alert alert-error alert-sm"
      aria-live="assertive"
    >
      <span>Table Error: {error?.message || 'Unknown error'}</span>
    </div>
  )
}

/**
 * Detailed error fallback for debugging
 */
export function DetailedErrorFallback({ error }: { error?: Error }) {
  return (
    <div role="alert" className="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <div className="font-semibold text-lg">Table Rendering Error</div>
        <div className="text-sm mt-1">
          <strong>Message:</strong> {error?.message || 'Unknown error'}
        </div>
        {error?.stack && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs hover:underline">
              Show stack trace
            </summary>
            <pre className="text-xs mt-2 p-2 bg-base-300 rounded overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Retry-able error fallback with retry button
 */
export function RetryableErrorFallback({
  error,
  onRetry,
}: {
  error?: Error
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <div className="font-semibold">Failed to load table</div>
        <div className="text-sm">{error?.message || 'Unknown error'}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-ghost"
          type="button"
        >
          Retry
        </button>
      )}
    </div>
  )
}

