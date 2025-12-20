'use client'

/**
 * AnalyticsEmptyState Component
 *
 * Empty state for analytics dashboard when no data is available.
 * Uses centralized EmptyState component for consistency.
 *
 * @see @_components/common/EmptyState
 * @module analytics/components/states/AnalyticsEmptyState
 */

import { TrendingUp } from 'lucide-react'

import EmptyState from '@_components/common/EmptyState'

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsEmptyStateProps {
	/** Custom title */
	title?: string
	/** Custom description */
	description?: string
	/** Optional action */
	action?: {
		label: string
		onClick: () => void
	}
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Analytics Empty State
 *
 * Displays when no analytics data is available.
 * Wraps the centralized EmptyState component with analytics-specific defaults.
 */
export function AnalyticsEmptyState({
	title = 'No Analytics Data',
	description = 'Analytics data will appear here once there are quotes and orders in the system.',
	action,
}: AnalyticsEmptyStateProps) {
	return (
		<div className="card bg-base-100 border border-base-300">
			<EmptyState
				icon={<TrendingUp className="w-16 h-16" />}
				title={title}
				description={description}
				action={action}
			/>
		</div>
	)
}

