'use client'

/**
 * ChartEmptyState
 *
 * Empty state display for charts with no data.
 *
 * @module charts/components/ChartEmptyState
 */

import { TrendingUp, type LucideIcon } from 'lucide-react'
import classNames from 'classnames'

interface ChartEmptyStateProps {
	/** Message to display */
	message?: string
	/** Optional icon */
	icon?: LucideIcon
	/** Height in pixels */
	height?: number
	/** Additional CSS classes */
	className?: string
}

/**
 * Empty state for charts with no data.
 *
 * @example
 * ```tsx
 * {data.length === 0 && (
 *   <ChartEmptyState message="No revenue data for this period" />
 * )}
 * ```
 */
export function ChartEmptyState({
	message = 'No data available',
	icon: Icon = TrendingUp,
	height = 200,
	className = '',
}: ChartEmptyStateProps) {
	return (
		<div
			className={classNames(
				'flex flex-col items-center justify-center text-base-content/50',
				className
			)}
			style={{ height }}
			role="status"
			aria-label={message}
		>
			<Icon className="h-12 w-12 mb-2" aria-hidden="true" />
			<p className="text-sm">{message}</p>
		</div>
	)
}

export default ChartEmptyState
