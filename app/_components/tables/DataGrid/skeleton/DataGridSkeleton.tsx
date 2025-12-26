/**
 * DataGridSkeleton - Main Skeleton Component
 *
 * Composed skeleton component for DataGrid loading states.
 * Primary component for use in Next.js loading.tsx files.
 * Mobile-first responsive design.
 *
 * Features:
 * - Configurable columns and rows
 * - Staggered animation for visual appeal
 * - Optional pagination skeleton
 * - Accessibility compliant
 * - Respects reduced motion preferences
 *
 * @module DataGrid/skeleton/DataGridSkeleton
 */

import type { DataGridSkeletonProps } from './skeleton.types'
import {
	SKELETON_CONTAINER_CLASS,
	DEFAULT_SKELETON_COLUMNS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_STAGGER_DELAY,
	DEFAULT_COLUMN_WIDTHS,
	DEFAULT_SKELETON_ARIA_LABEL,
	SKELETON_ARIA_LIVE,
	SKELETON_SHIMMER_CLASS,
	generateGridTemplateColumns,
} from './skeleton.constants'
import { DataGridSkeletonHeader } from './DataGridSkeletonHeader'
import { DataGridSkeletonBody } from './DataGridSkeletonBody'
import { DataGridSkeletonPagination } from './DataGridSkeletonPagination'

/**
 * DataGridSkeleton Component
 *
 * Main skeleton component for DataGrid loading states.
 * Composes header, body, and pagination skeleton components.
 *
 * @example Basic usage
 * ```tsx
 * // In loading.tsx
 * export default function Loading() {
 *   return <DataGridSkeleton columns={7} rows={10} />
 * }
 * ```
 *
 * @example With custom configuration
 * ```tsx
 * <DataGridSkeleton
 *   columns={5}
 *   rows={15}
 *   showPagination
 *   showPageSize
 *   columnWidths={['sm', 'lg', 'md', 'xl', 'sm']}
 *   ariaLabel="Loading quotes..."
 *   staggerDelay={30}
 * />
 * ```
 *
 * @example Shimmer animation
 * ```tsx
 * <DataGridSkeleton
 *   columns={5}
 *   rows={10}
 *   animationVariant="shimmer"
 * />
 * ```
 */
export function DataGridSkeleton({
	columns = DEFAULT_SKELETON_COLUMNS,
	rows = DEFAULT_SKELETON_ROWS,
	showPagination = true,
	showPageSize = true,
	columnWidths = DEFAULT_COLUMN_WIDTHS,
	className = '',
	ariaLabel = DEFAULT_SKELETON_ARIA_LABEL,
	animationVariant = 'pulse',
	staggerDelay = DEFAULT_STAGGER_DELAY,
}: DataGridSkeletonProps): React.ReactElement {
	const gridTemplateColumns = generateGridTemplateColumns(columns)
	const animationClass = animationVariant === 'shimmer' ? SKELETON_SHIMMER_CLASS : ''

	// Build container class - mobile-first with responsive overflow
	const containerClass = [
		SKELETON_CONTAINER_CLASS,
		'w-full rounded-lg border border-base-200 bg-base-100 overflow-x-auto',
		animationClass,
		className,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<div
			className={containerClass}
			role="grid"
			aria-label={ariaLabel}
			aria-busy="true"
			aria-live={SKELETON_ARIA_LIVE}
		>
			{/* Screen reader announcement */}
			<div className="sr-only" role="status">
				{ariaLabel}
			</div>

			{/* Header skeleton */}
			<DataGridSkeletonHeader
				columns={columns}
				columnWidths={columnWidths}
				gridTemplateColumns={gridTemplateColumns}
			/>

			{/* Body skeleton with rows */}
			<DataGridSkeletonBody
				columns={columns}
				rows={rows}
				columnWidths={columnWidths}
				staggerDelay={animationVariant === 'none' ? 0 : staggerDelay}
				gridTemplateColumns={gridTemplateColumns}
			/>

			{/* Pagination skeleton */}
			{showPagination && <DataGridSkeletonPagination showPageSize={showPageSize} />}
		</div>
	)
}

DataGridSkeleton.displayName = 'DataGridSkeleton'
