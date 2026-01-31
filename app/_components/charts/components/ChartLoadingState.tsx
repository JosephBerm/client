'use client'

/**
 * ChartLoadingState
 *
 * Loading skeleton for charts.
 *
 * @module charts/components/ChartLoadingState
 */

import classNames from 'classnames'

interface ChartLoadingStateProps {
	/** Height in pixels */
	height?: number
	/** Show animated bars or spinner */
	variant?: 'spinner' | 'skeleton'
	/** Additional CSS classes */
	className?: string
}

/**
 * Loading state for charts.
 *
 * @example
 * ```tsx
 * {isLoading && <ChartLoadingState height={300} />}
 * ```
 */
export function ChartLoadingState({
	height = 200,
	variant = 'skeleton',
	className = '',
}: ChartLoadingStateProps) {
	if (variant === 'spinner') {
		return (
			<div
				className={classNames('flex items-center justify-center', className)}
				style={{ height }}
				role="status"
				aria-label="Loading chart"
			>
				<span className="loading loading-spinner loading-lg text-primary" />
			</div>
		)
	}

	// Skeleton variant - animated bar chart placeholder
	return (
		<div
			className={classNames('relative', className)}
			style={{ height }}
			role="status"
			aria-label="Loading chart"
		>
			{/* Y-axis skeleton */}
			<div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between">
				<div className="h-3 w-8 bg-base-300 rounded animate-pulse" />
				<div className="h-3 w-6 bg-base-300 rounded animate-pulse" />
				<div className="h-3 w-8 bg-base-300 rounded animate-pulse" />
			</div>

			{/* Chart area skeleton */}
			<div className="ml-14 h-full flex items-end gap-2 pb-8">
				{[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.75].map((scale, i) => (
					<div
						key={i}
						className="flex-1 bg-base-300 rounded-t animate-pulse"
						style={{
							height: `${scale * 80}%`,
							animationDelay: `${i * 100}ms`,
						}}
					/>
				))}
			</div>

			{/* X-axis skeleton */}
			<div className="absolute bottom-0 left-14 right-0 flex justify-between px-2">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-2 w-8 bg-base-300 rounded animate-pulse"
						style={{ animationDelay: `${i * 50}ms` }}
					/>
				))}
			</div>
		</div>
	)
}

/**
 * Compact loading state for sparklines and small charts.
 */
export function ChartLoadingCompact({
	width = 100,
	height = 40,
}: {
	width?: number
	height?: number
}) {
	return (
		<div
			className="bg-base-300/50 rounded animate-pulse"
			style={{ width, height }}
			role="status"
			aria-label="Loading"
		/>
	)
}

export default ChartLoadingState
