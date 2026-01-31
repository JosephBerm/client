/**
 * Chart Error Boundary Component
 *
 * Error boundary to gracefully handle errors in chart rendering,
 * preventing entire page crashes.
 *
 * @module charts/components/ChartErrorBoundary
 */

'use client'

import type { ReactNode } from 'react'
import { Component } from 'react'
import classNames from 'classnames'

import { logger } from '@_core'
import Button from '@_components/ui/Button'

import { ChartEmptyState } from './ChartEmptyState'

interface ChartErrorBoundaryProps {
	children: ReactNode
	fallback?: ReactNode
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void
	resetKeys?: Array<string | number>
	className?: string
}

interface ChartErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

/**
 * Error boundary for chart components.
 *
 * @example
 * ```tsx
 * <ChartErrorBoundary>
 *   <AreaChart data={data} />
 * </ChartErrorBoundary>
 * ```
 */
export class ChartErrorBoundary extends Component<
	ChartErrorBoundaryProps,
	ChartErrorBoundaryState
> {
	constructor(props: ChartErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		logger.error('Chart error boundary caught error', {
			component: 'ChartErrorBoundary',
			error: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
			timestamp: new Date(),
		})

		this.props.onError?.(error, errorInfo)
	}

	componentDidUpdate(prevProps: ChartErrorBoundaryProps) {
		if (!this.state.hasError) return

		const { resetKeys } = this.props
		if (!resetKeys || !prevProps.resetKeys) return

		if (resetKeys.some((key, index) => key !== prevProps.resetKeys![index])) {
			this.setState({ hasError: false, error: null })
		}
	}

	private handleReset = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div
					role="alert"
					className={classNames(
						'flex flex-col items-center justify-center gap-3 text-base-content/70',
						this.props.className
					)}
				>
					<ChartEmptyState
						message={this.state.error?.message ?? 'Chart failed to load'}
					/>
					<Button
						variant="ghost"
						size="sm"
						onClick={this.handleReset}
					>
						Retry chart
					</Button>
				</div>
			)
		}

		return this.props.children
	}
}

export default ChartErrorBoundary
