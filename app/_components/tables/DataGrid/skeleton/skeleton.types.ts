/**
 * DataGrid Skeleton - Type Definitions
 *
 * TypeScript type definitions for skeleton loading components.
 * Pure types with zero runtime cost.
 *
 * @module DataGrid/skeleton/types
 */

// ============================================================================
// SKELETON COLUMN WIDTH TYPES
// ============================================================================

/**
 * Skeleton column width variants.
 * Maps to Tailwind CSS width classes for consistent sizing.
 *
 * - 'sm': w-16 (64px) - IDs, short codes, icons
 * - 'md': w-24 (96px) - Dates, status badges, numbers
 * - 'lg': w-32 (128px) - Names, titles, short text
 * - 'xl': w-48 (192px) - Emails, descriptions, long text
 */
export type SkeletonColumnWidth = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Animation variant for skeleton loading.
 *
 * - 'pulse': DaisyUI pulse animation (default)
 * - 'shimmer': Netflix-style left-to-right shimmer
 * - 'none': No animation (for reduced motion)
 */
export type SkeletonAnimationVariant = 'pulse' | 'shimmer' | 'none'

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * DataGridSkeleton component props.
 *
 * Main skeleton component for use in Next.js loading.tsx files.
 *
 * @example
 * ```tsx
 * <DataGridSkeleton
 *   columns={7}
 *   rows={10}
 *   showPagination
 *   ariaLabel="Loading quotes"
 * />
 * ```
 */
export interface DataGridSkeletonProps {
	/** Number of columns to render */
	columns?: number
	/** Number of skeleton rows to render */
	rows?: number
	/** Whether to show pagination skeleton */
	showPagination?: boolean
	/** Whether to show page size selector skeleton */
	showPageSize?: boolean
	/**
	 * Column width configuration.
	 * Array of width variants for each column.
	 * If shorter than columns count, pattern repeats.
	 */
	columnWidths?: SkeletonColumnWidth[]
	/** Custom CSS class */
	className?: string
	/** ARIA label for accessibility */
	ariaLabel?: string
	/** Animation variant */
	animationVariant?: SkeletonAnimationVariant
	/** Stagger animation delay between rows (ms) */
	staggerDelay?: number
}

/**
 * DataGridSkeletonRow component props.
 *
 * Single skeleton row for DataGrid.
 */
export interface DataGridSkeletonRowProps {
	/** Number of columns */
	columns: number
	/** Column widths configuration */
	columnWidths?: SkeletonColumnWidth[]
	/** Row index for stagger animation */
	index?: number
	/** Stagger delay multiplier (ms) */
	staggerDelay?: number
	/** CSS class for row */
	className?: string
	/** Grid template columns CSS value */
	gridTemplateColumns?: string
}

/**
 * DataGridSkeletonHeader component props.
 *
 * Header row skeleton for DataGrid.
 */
export interface DataGridSkeletonHeaderProps {
	/** Number of columns */
	columns: number
	/** Column widths configuration */
	columnWidths?: SkeletonColumnWidth[]
	/** CSS class for header */
	className?: string
	/** Grid template columns CSS value */
	gridTemplateColumns?: string
}

/**
 * DataGridSkeletonBody component props.
 *
 * Body skeleton containing multiple rows.
 */
export interface DataGridSkeletonBodyProps {
	/** Number of columns */
	columns: number
	/** Number of rows to render */
	rows: number
	/** Column widths configuration */
	columnWidths?: SkeletonColumnWidth[]
	/** Stagger delay between rows (ms) */
	staggerDelay?: number
	/** CSS class for body */
	className?: string
	/** Grid template columns CSS value */
	gridTemplateColumns?: string
}

/**
 * DataGridSkeletonPagination component props.
 *
 * Pagination controls skeleton.
 */
export interface DataGridSkeletonPaginationProps {
	/** Whether to show page size selector */
	showPageSize?: boolean
	/** CSS class for pagination */
	className?: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Width mapping from SkeletonColumnWidth to Tailwind class.
 */
export type SkeletonWidthMap = Record<SkeletonColumnWidth, string>

