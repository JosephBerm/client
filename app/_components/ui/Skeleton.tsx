/**
 * Skeleton UI Component
 *
 * A placeholder loading component that shows a pulsing animation.
 * Used to indicate loading states while preserving layout.
 *
 * **Features:**
 * - Customizable size via className
 * - Subtle pulse animation
 * - Theme-aware (uses base-300 color)
 * - Accessible (hidden from screen readers)
 *
 * @example
 * ```tsx
 * import Skeleton from '@_components/ui/Skeleton';
 *
 * // Basic usage
 * <Skeleton className="h-4 w-32" />
 *
 * // Card skeleton
 * <div className="space-y-2">
 *   <Skeleton className="h-8 w-full" />
 *   <Skeleton className="h-4 w-3/4" />
 *   <Skeleton className="h-4 w-1/2" />
 * </div>
 * ```
 *
 * @module Skeleton
 */

import classNames from 'classnames'

interface SkeletonProps {
	className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
	return (
		<div
			aria-hidden="true"
			className={classNames(
				'animate-pulse rounded-md bg-base-300',
				className
			)}
		/>
	)
}

export { Skeleton }
