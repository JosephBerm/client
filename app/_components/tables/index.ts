/**
 * Tables Barrel Export
 * 
 * Centralized export point for all table components, utilities, types, and constants.
 * Provides clean imports across the application following FAANG-level organization.
 * 
 * @example
 * ```tsx
 * // Components
 * import { DataGrid, ServerDataGrid } from '@_components/tables';
 * 
 * // Utilities
 * import { calculateTotalItems, sanitizeString } from '@_components/tables';
 * 
 * // Constants
 * import { DEFAULT_PAGE_SIZE_OPTIONS } from '@_components/tables';
 * 
 * // Types
 * import type { PaginationButtonConfig, TableFeatureToggles } from '@_components/tables';
 * ```
 * 
 * @module tables
 */

// Components
// DataTable removed - use DataGrid instead
export { default as ServerDataGrid } from './ServerDataGrid'
export { DataGrid } from './DataGrid' // Industry-standard name for div-based tables
export type { DataGridProps } from './DataGrid'
// DivTable removed - use DataGrid instead

// Constants
export {
	DEFAULT_PAGE_SIZE_OPTIONS,
	DEFAULT_PAGE_SIZE,
	MIN_PAGE_SIZE,
	MAX_PAGE_SIZE,
	DEFAULT_EMPTY_MESSAGE,
	TABLE_ERROR_MESSAGES,
	COMPONENT_NAME,
} from './tableConstants'

// Utilities
export {
	sanitizeString,
	isPositiveNumber,
	isValidPageSize,
	calculateTotalItems,
	calculateLastPageIndex,
	calculatePaginationRange,
	isValidArray,
	normalizeArray,
} from './tableUtils'

// Types
export type {
	PaginationButtonConfig,
	TableFeatureToggles,
	TableManualModes,
	ServerPaginationMeta,
	PaginationRange,
} from './tableTypes'

// Re-export TanStack Table types for convenience
export type { ColumnDef, PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'

