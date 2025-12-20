'use client'

/**
 * AnalyticsLoadingState Component
 *
 * Loading indicator for analytics refresh operations.
 * Uses DaisyUI alert pattern for consistent styling.
 *
 * @module analytics/components/states/AnalyticsLoadingState
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsLoadingStateProps {
	/** Custom loading message */
	message?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Analytics Loading State
 *
 * Displays a subtle loading indicator for data refresh.
 * Used when data has already loaded and is being refreshed.
 */
export function AnalyticsLoadingState({
	message = 'Refreshing analytics…',
}: AnalyticsLoadingStateProps) {
	return (
		<div
			className="alert alert-info shadow-sm"
			role="status"
			aria-live="polite"
		>
			<span
				className="loading loading-spinner loading-sm"
				aria-hidden="true"
			/>
			<span>{message}</span>
		</div>
	)
}

