/**
 * DataGrid Skeleton - Constants
 *
 * Centralized constants for skeleton loading components.
 * Single source of truth for defaults and configuration.
 *
 * @module DataGrid/skeleton/constants
 */

import type { SkeletonColumnWidth, SkeletonWidthMap } from './skeleton.types'

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default number of columns in skeleton */
export const DEFAULT_SKELETON_COLUMNS = 5

/** Default number of rows in skeleton */
export const DEFAULT_SKELETON_ROWS = 10

/** Default stagger delay between rows (ms) */
export const DEFAULT_STAGGER_DELAY = 50

/** Maximum stagger delay for performance (ms) */
export const MAX_STAGGER_DELAY = 500

// ============================================================================
// COLUMN WIDTH CONFIGURATION
// ============================================================================

/**
 * Maps skeleton column width variants to Tailwind CSS classes.
 * Provides consistent sizing across all skeleton components.
 */
export const SKELETON_WIDTH_MAP: SkeletonWidthMap = {
	sm: 'w-16',
	md: 'w-24',
	lg: 'w-32',
	xl: 'w-48',
} as const

/**
 * Default column width pattern for skeleton.
 * Repeats when more columns than widths specified.
 *
 * Pattern: md, lg, md, xl, sm (typical table pattern)
 */
export const DEFAULT_COLUMN_WIDTHS: SkeletonColumnWidth[] = [
	'md', // ID / short code
	'lg', // Name / title
	'md', // Date / status
	'xl', // Email / description
	'sm', // Actions
]

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

/**
 * Default grid template columns for skeleton layout.
 * Responsive design matching DataGrid structure.
 */
export const DEFAULT_GRID_TEMPLATE_COLUMNS = 'minmax(100px, 1fr) '.repeat(5).trim()

/**
 * Generate grid template columns string for given column count.
 *
 * @param columns - Number of columns
 * @returns CSS grid-template-columns value
 */
export function generateGridTemplateColumns(columns: number): string {
	return `repeat(${columns}, minmax(100px, 1fr))`
}

// ============================================================================
// CSS CLASS CONSTANTS
// ============================================================================

/** Base class for skeleton container */
export const SKELETON_CONTAINER_CLASS = 'data-grid-skeleton-container'

/** Class for skeleton header */
export const SKELETON_HEADER_CLASS = 'data-grid-skeleton-header'

/** Class for skeleton row */
export const SKELETON_ROW_CLASS = 'data-grid-skeleton-row'

/** Class for skeleton cell */
export const SKELETON_CELL_CLASS = 'data-grid-skeleton-cell'

/** Class for skeleton pagination */
export const SKELETON_PAGINATION_CLASS = 'data-grid-skeleton-pagination'

/** Class for skeleton element (animated bar) */
export const SKELETON_ELEMENT_CLASS = 'skeleton'

/** Class for shimmer animation variant */
export const SKELETON_SHIMMER_CLASS = 'skeleton-shimmer'

// ============================================================================
// ARIA LABELS
// ============================================================================

/** Default ARIA label for skeleton */
export const DEFAULT_SKELETON_ARIA_LABEL = 'Loading data...'

/** ARIA live region for screen readers */
export const SKELETON_ARIA_LIVE = 'polite' as const

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

/** CSS variable for stagger delay */
export const STAGGER_DELAY_CSS_VAR = '--skeleton-stagger-delay'

/** Shimmer animation duration (ms) */
export const SHIMMER_DURATION = 1500

/** Shimmer animation CSS */
export const SHIMMER_KEYFRAMES = `
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`

