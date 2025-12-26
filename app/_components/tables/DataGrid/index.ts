/**
 * DataGrid - Barrel Export
 *
 * Centralized exports for the modern data grid implementation.
 * Industry-standard naming convention for div-based tables.
 *
 * @module DataGrid
 */

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export { DataGrid } from './DataGrid'
export type { DataGridProps } from './DataGrid'

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

export { DataGridSkeleton } from './skeleton'
export type { DataGridSkeletonProps } from './skeleton'

// Sub-components for advanced composition
export {
	DataGridSkeletonRow,
	DataGridSkeletonHeader,
	DataGridSkeletonBody,
	DataGridSkeletonPagination,
} from './skeleton'

// Types for skeleton customization
export type {
	DataGridSkeletonRowProps,
	DataGridSkeletonHeaderProps,
	DataGridSkeletonBodyProps,
	DataGridSkeletonPaginationProps,
	SkeletonColumnWidth,
	SkeletonAnimationVariant,
} from './skeleton'

// Constants for skeleton configuration
export {
	DEFAULT_SKELETON_COLUMNS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_STAGGER_DELAY,
	SKELETON_WIDTH_MAP,
	DEFAULT_COLUMN_WIDTHS,
} from './skeleton'

// Note: Sub-components, types, constants, utilities, and hooks will be migrated
// from DivTable as the full rename is completed. For now, DataGrid.tsx
// imports directly from DivTable to maintain functionality.

