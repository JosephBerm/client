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
export * from './tableConstants'

// Utilities
export * from './tableUtils'

// Types
export type * from './tableTypes'

// Re-export TanStack Table types for convenience
export type { ColumnDef, PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'

