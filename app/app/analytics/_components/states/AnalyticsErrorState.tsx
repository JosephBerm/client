'use client'

/**
 * AnalyticsErrorState Component
 *
 * Error state display for analytics dashboard.
 * Shows error message with retry action using centralized patterns.
 *
 * @see @_components/common for reusable state patterns
 * @module analytics/components/states/AnalyticsErrorState
 */

import { AlertTriangle } from 'lucide-react'

import { logger } from '@_core'
import Button from '@_components/ui/Button'

// ============================================================================
// CONSTANTS
// ============================================================================

const COMPONENT_NAME = 'AnalyticsErrorState'

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsErrorStateProps {
	/** Error message to display */
	error: string
	/** Retry handler */
	onRetry?: () => void
	/** Component context for logging */
	context?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Analytics Error State
 *
 * Displays error message with optional retry button.
 * Logs error for debugging purposes.
 */
export function AnalyticsErrorState({
	error,
	onRetry,
	context = 'analytics',
}: AnalyticsErrorStateProps) {
	// Log error for debugging
	logger.warn('Analytics error displayed', {
		component: COMPONENT_NAME,
		context,
		error,
	})

	return (
		<div
			className="alert alert-error shadow-lg"
			role="alert"
			aria-live="polite"
		>
			<AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
			<div className="flex-1">
				<span className="font-medium">Error loading analytics</span>
				<p className="text-sm opacity-90">{error}</p>
			</div>
			{onRetry && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onRetry}
					className="text-error-content hover:bg-error-content/10"
				>
					Retry
				</Button>
			)}
		</div>
	)
}

