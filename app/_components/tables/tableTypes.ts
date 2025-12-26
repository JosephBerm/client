/**
 * Table Types and Interfaces
 * 
 * Shared type definitions for table components.
 * Promotes type safety and reusability across the application.
 * 
 * **FAANG-level best practice**: Centralized type definitions prevent
 * duplication and ensure consistency.
 * 
 * @module tableTypes
 */

import type { PaginationState } from '@tanstack/react-table'

/**
 * Configuration for a pagination button.
 * Used to render First/Previous/Next/Last buttons with consistent behavior.
 */
export interface PaginationButtonConfig {
	/** Display label for the button */
	label: string
	/** Action to perform when clicked (returns new pagination state) */
	action: () => PaginationState
	/** Whether the button should be disabled */
	disabled: boolean
	/** Accessible label for screen readers */
	ariaLabel: string
}

/**
 * Options for table feature toggles.
 * Allows granular control over table functionality.
 */
export interface TableFeatureToggles {
	/** Enable/disable column sorting */
	enableSorting?: boolean
	/** Enable/disable column filtering */
	enableFiltering?: boolean
	/** Enable/disable pagination controls */
	enablePagination?: boolean
	/** Enable/disable page size selector */
	enablePageSize?: boolean
}

/**
 * Options for manual (server-side) table modes.
 * When enabled, the table delegates operations to the parent component.
 */
export interface TableManualModes {
	/** Manual (server-side) pagination */
	manualPagination?: boolean
	/** Manual (server-side) sorting */
	manualSorting?: boolean
	/** Manual (server-side) filtering */
	manualFiltering?: boolean
}

/**
 * Pagination metadata for server-side tables.
 * Matches backend PagedResult structure.
 */
export interface ServerPaginationMeta {
	/** Current page number (1-based) */
	page: number
	/** Number of items per page */
	pageSize: number
	/** Total items across all pages */
	total: number
	/** Total number of pages */
	totalPages: number
	/** Whether next page exists */
	hasNext: boolean
	/** Whether previous page exists */
	hasPrevious: boolean
}

/**
 * Result of pagination range calculation.
 * Used for "Showing X-Y of Z" display.
 */
export interface PaginationRange {
	/** Start index (1-based for display) */
	start: number
	/** End index (1-based for display) */
	end: number
}

/**
 * Loading variant for DataGrid component.
 *
 * - 'spinner': Overlay spinner (default, backward compatible)
 * - 'skeleton': Skeleton rows replace content when loading
 * - 'skeleton-overlay': Skeleton rows with semi-transparent overlay
 */
export type LoadingVariant = 'spinner' | 'skeleton' | 'skeleton-overlay'

