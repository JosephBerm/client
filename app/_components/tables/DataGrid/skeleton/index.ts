/**
 * DataGrid Skeleton - Barrel Export
 *
 * Centralized exports for skeleton loading components.
 * Following project barrel export conventions for optimal tree-shaking.
 *
 * @module DataGrid/skeleton
 */

// ============================================================================
// MAIN SKELETON COMPONENT
// ============================================================================

export { DataGridSkeleton } from './DataGridSkeleton'

// ============================================================================
// SUB-COMPONENTS (for advanced composition)
// ============================================================================

export { DataGridSkeletonRow } from './DataGridSkeletonRow'
export { DataGridSkeletonHeader } from './DataGridSkeletonHeader'
export { DataGridSkeletonBody } from './DataGridSkeletonBody'
export { DataGridSkeletonPagination } from './DataGridSkeletonPagination'

// ============================================================================
// TYPES
// ============================================================================

export type {
	DataGridSkeletonProps,
	DataGridSkeletonRowProps,
	DataGridSkeletonHeaderProps,
	DataGridSkeletonBodyProps,
	DataGridSkeletonPaginationProps,
	SkeletonColumnWidth,
	SkeletonAnimationVariant,
	SkeletonWidthMap,
} from './skeleton.types'

// ============================================================================
// CONSTANTS (for customization)
// ============================================================================

export {
	DEFAULT_SKELETON_COLUMNS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_STAGGER_DELAY,
	MAX_STAGGER_DELAY,
	SKELETON_WIDTH_MAP,
	DEFAULT_COLUMN_WIDTHS,
	generateGridTemplateColumns,
	DEFAULT_SKELETON_ARIA_LABEL,
} from './skeleton.constants'

