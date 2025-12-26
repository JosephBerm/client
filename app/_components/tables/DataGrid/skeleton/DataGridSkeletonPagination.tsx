/**
 * DataGridSkeletonPagination - Pagination Skeleton
 *
 * Pagination controls skeleton component for DataGrid.
 * Renders skeleton pagination buttons and optional page size selector.
 * Mobile-first responsive design.
 *
 * @module DataGrid/skeleton/DataGridSkeletonPagination
 */

import type { DataGridSkeletonPaginationProps } from './skeleton.types'
import { SKELETON_PAGINATION_CLASS, SKELETON_ELEMENT_CLASS } from './skeleton.constants'

/**
 * DataGridSkeletonPagination Component
 *
 * Renders the skeleton pagination controls for DataGrid.
 * Matches the visual style of actual DataGrid pagination.
 *
 * @example
 * ```tsx
 * <DataGridSkeletonPagination
 *   showPageSize={true}
 * />
 * ```
 */
export function DataGridSkeletonPagination({
	showPageSize = true,
	className = '',
}: DataGridSkeletonPaginationProps): React.ReactElement {
	return (
		<div
			className={`${SKELETON_PAGINATION_CLASS} flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 border-t border-base-200 bg-base-100 ${className}`.trim()}
			role="navigation"
			aria-hidden="true"
			aria-label="Pagination loading"
		>
			{/* Left side: Page info skeleton */}
			<div className="flex items-center gap-2 order-2 sm:order-1">
				<div className={`${SKELETON_ELEMENT_CLASS} h-3 sm:h-4 w-24 sm:w-32 rounded`} />
			</div>

			{/* Center: Page buttons skeleton */}
			<div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
				{/* First page button */}
				<div className={`${SKELETON_ELEMENT_CLASS} h-7 w-7 sm:h-8 sm:w-8 rounded`} />
				{/* Previous button */}
				<div className={`${SKELETON_ELEMENT_CLASS} h-7 w-7 sm:h-8 sm:w-8 rounded`} />
				{/* Page numbers - fewer on mobile */}
				<div className="flex items-center gap-1">
					<div className={`${SKELETON_ELEMENT_CLASS} h-7 w-7 sm:h-8 sm:w-8 rounded`} />
					<div className={`${SKELETON_ELEMENT_CLASS} hidden sm:block h-8 w-8 rounded`} />
					<div className={`${SKELETON_ELEMENT_CLASS} hidden sm:block h-8 w-8 rounded`} />
				</div>
				{/* Next button */}
				<div className={`${SKELETON_ELEMENT_CLASS} h-7 w-7 sm:h-8 sm:w-8 rounded`} />
				{/* Last page button */}
				<div className={`${SKELETON_ELEMENT_CLASS} h-7 w-7 sm:h-8 sm:w-8 rounded`} />
			</div>

			{/* Right side: Page size selector skeleton - hidden on mobile */}
			{showPageSize && (
				<div className="hidden sm:flex items-center gap-2 order-3">
					<div className={`${SKELETON_ELEMENT_CLASS} h-4 w-20 rounded`} />
					<div className={`${SKELETON_ELEMENT_CLASS} h-8 w-16 rounded`} />
				</div>
			)}
		</div>
	)
}

DataGridSkeletonPagination.displayName = 'DataGridSkeletonPagination'
