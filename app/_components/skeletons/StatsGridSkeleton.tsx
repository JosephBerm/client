/**
 * StatsGridSkeleton Component
 *
 * Reusable skeleton for stats grids used in loading.tsx files.
 * Server Component compatible (no 'use client' directive).
 *
 * Used in:
 * - Store loading (4 cards)
 * - Customers loading (4 cards)
 * - Providers loading (4 cards)
 *
 * Features:
 * - Mobile-first responsive grid
 * - Respects reduced motion preferences
 * - Accessible with proper ARIA attributes
 *
 * @module skeletons/StatsGridSkeleton
 */

interface StatsGridSkeletonProps {
	/**
	 * Number of stat cards to display.
	 * @default 4
	 */
	count?: 3 | 4

	/**
	 * Additional CSS classes for the container.
	 * @default 'mb-6'
	 */
	className?: string
}

/**
 * StatsGridSkeleton - Loading skeleton for stats grid sections.
 *
 * Matches the layout of ProductStatsGrid, CustomerStatsGrid, ProviderStatsGrid.
 *
 * @example
 * ```tsx
 * // In loading.tsx
 * <StatsGridSkeleton count={4} />
 * ```
 */
export function StatsGridSkeleton({
	count = 4,
	className = 'mb-6',
}: StatsGridSkeletonProps) {
	const gridCols =
		count === 4
			? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
			: 'grid-cols-1 sm:grid-cols-3'

	return (
		<div
			className={`grid ${gridCols} gap-3 sm:gap-4 ${className}`}
			role="status"
			aria-label="Loading statistics"
		>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className="rounded-xl bg-base-100 border border-base-200 p-4 shadow-sm"
				>
					<div className="flex items-start justify-between">
						<div className="flex-1 space-y-2">
							{/* Label skeleton */}
							<div className="h-3 w-20 bg-base-300 rounded motion-safe:animate-pulse" />
							{/* Value skeleton */}
							<div className="h-8 w-16 bg-base-300 rounded motion-safe:animate-pulse" />
						</div>
						{/* Icon skeleton */}
						<div className="h-6 w-6 bg-base-300 rounded motion-safe:animate-pulse" />
					</div>
				</div>
			))}
		</div>
	)
}

export default StatsGridSkeleton
