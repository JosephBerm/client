/**
 * RBACErrorBoundary Component
 *
 * Error boundary for RBAC management feature.
 * Catches React errors and displays a user-friendly fallback UI.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Error Boundary Pattern (MAANG Standard)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * React Error Boundaries catch JavaScript errors in their child component
 * tree and display a fallback UI instead of crashing the whole page.
 *
 * Best Practices:
 * 1. Place error boundaries at feature/route level
 * 2. Log errors to monitoring service
 * 3. Provide recovery options (retry, go back)
 * 4. Show user-friendly messages
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @example
 * ```tsx
 * <RBACErrorBoundary>
 *   <RBACManagementPage />
 * </RBACErrorBoundary>
 * ```
 *
 * @module app/rbac/_components/RBACErrorBoundary
 */

'use client'

import { Component, type ReactNode } from 'react'
import { AlertOctagon, RefreshCw, ArrowLeft } from 'lucide-react'

import { logger } from '@_core'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

// =========================================================================
// TYPES
// =========================================================================

interface RBACErrorBoundaryProps {
	/** Child components to wrap */
	children: ReactNode
	/** Optional fallback component */
	fallback?: ReactNode
	/** Callback when error is caught */
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface RBACErrorBoundaryState {
	hasError: boolean
	error: Error | null
	errorInfo: React.ErrorInfo | null
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Error Boundary for RBAC Management
 *
 * Features:
 * - Catches all React errors in child tree
 * - Logs errors for monitoring
 * - Provides retry and navigation options
 * - Shows user-friendly error message
 */
export class RBACErrorBoundary extends Component<RBACErrorBoundaryProps, RBACErrorBoundaryState> {
	constructor(props: RBACErrorBoundaryProps) {
		super(props)
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		}
	}

	static getDerivedStateFromError(error: Error): Partial<RBACErrorBoundaryState> {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		// Log error
		logger.error('RBAC Error Boundary caught an error', {
			component: 'RBACErrorBoundary',
			action: 'componentDidCatch',
			error: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
		})

		// Update state with error info
		this.setState({ errorInfo })

		// Call optional error callback
		this.props.onError?.(error, errorInfo)
	}

	handleRetry = (): void => {
		// Reset error state to retry rendering
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		})
	}

	handleGoBack = (): void => {
		// Navigate back
		if (typeof window !== 'undefined') {
			window.history.back()
		}
	}

	render(): ReactNode {
		if (this.state.hasError) {
			// If custom fallback provided, use it
			if (this.props.fallback) {
				return this.props.fallback
			}

			// Default error UI
			return (
				<div className="flex min-h-[400px] items-center justify-center p-6">
					<Card className="max-w-lg border border-error/30 bg-error/5 p-8 text-center">
						<AlertOctagon className="mx-auto mb-4 h-16 w-16 text-error" />

						<h2 className="mb-2 text-xl font-bold text-base-content">
							Something went wrong
						</h2>

						<p className="mb-6 text-base-content/70">
							An error occurred while loading the RBAC management page.
							This has been logged and our team will investigate.
						</p>

						{/* Error details (development only) */}
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="mb-6 text-left">
								<summary className="cursor-pointer text-sm font-medium text-error">
									Error Details (Development Only)
								</summary>
								<pre className="mt-2 overflow-auto rounded bg-base-200 p-3 text-xs">
									{this.state.error.message}
									{'\n\n'}
									{this.state.error.stack}
								</pre>
							</details>
						)}

						<div className="flex justify-center gap-3">
							<Button
								variant="ghost"
								onClick={this.handleGoBack}
								className="gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								Go Back
							</Button>
							<Button
								variant="primary"
								onClick={this.handleRetry}
								className="gap-2"
							>
								<RefreshCw className="h-4 w-4" />
								Try Again
							</Button>
						</div>
					</Card>
				</div>
			)
		}

		return this.props.children
	}
}

export default RBACErrorBoundary

