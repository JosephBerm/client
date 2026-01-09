/**
 * Tables Barrel Export
 *
 * Centralized export point for all table components, utilities, types, and constants.
 * Provides clean imports across the application following FAANG-level organization.
 *
 * @example
 * ```tsx
 * // Components - Use RichDataGrid for server-side data operations
 * import { RichDataGrid, DataGrid, DataGridSkeleton } from '@_components/tables';
 *
 * // Column Helpers
 * import { createRichColumnHelper, FilterType } from '@_components/tables';
 *
 * // Utilities
 * import { calculateTotalItems, sanitizeString } from '@_components/tables';
 *
 * // Constants
 * import { DEFAULT_PAGE_SIZE_OPTIONS } from '@_components/tables';
 *
 * // Types
 * import type { RichColumnDef, RichSearchFilter, RichPagedResult } from '@_components/tables';
 * ```
 *
 * @module tables
 */

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

// NOTE: ServerDataGrid has been removed. Use RichDataGrid instead.
// See RICHDATAGRID_MIGRATION_PLAN.md for migration guide.

export { DataGrid } from './DataGrid' // Industry-standard name for div-based tables with virtualization
export type { DataGridProps } from './DataGrid'

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

export {
	DataGridSkeleton,
	DataGridSkeletonRow,
	DataGridSkeletonHeader,
	DataGridSkeletonBody,
	DataGridSkeletonPagination,
} from './DataGrid'

export type {
	DataGridSkeletonProps,
	DataGridSkeletonRowProps,
	DataGridSkeletonHeaderProps,
	DataGridSkeletonBodyProps,
	DataGridSkeletonPaginationProps,
	SkeletonColumnWidth,
	SkeletonAnimationVariant,
} from './DataGrid'

// Skeleton constants for customization
export {
	DEFAULT_SKELETON_COLUMNS,
	DEFAULT_SKELETON_ROWS,
	DEFAULT_STAGGER_DELAY,
	SKELETON_WIDTH_MAP,
	DEFAULT_COLUMN_WIDTHS,
} from './DataGrid'

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
	LoadingVariant,
} from './tableTypes'

// Re-export TanStack Table types for convenience
export type { ColumnDef, PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table'

// ============================================================================
// RICH DATA GRID (MAANG-Level Component)
// ============================================================================

// Main Component
export { RichDataGrid } from './RichDataGrid'
export type { RichDataGridProps } from './RichDataGrid'

// Hooks
export { useRichDataGrid } from './RichDataGrid'
export type { UseRichDataGridOptions } from './RichDataGrid'

// Context
export {
	RichDataGridProvider,
	useRichDataGridContext,
	useRichDataGridSelection,
	useRichDataGridFilters,
	useRichDataGridPagination,
	useRichDataGridVisibility,
	useRichDataGridLoading,
} from './RichDataGrid'

// Toolbar Components
export { RichDataGridToolbar, GlobalSearchInput, ColumnVisibilityDropdown, BulkActionsDropdown } from './RichDataGrid'

// Table Components
export { RichDataGridHeader, RichDataGridBody, RichDataGridPagination } from './RichDataGrid'

// Selection Components
export { SelectAllCheckbox, RowSelectionCheckbox, SelectionStatusBar } from './RichDataGrid'

// Enums
export {
	FilterType,
	TextFilterOperator,
	NumberFilterOperator,
	DateFilterOperator,
	SelectFilterOperator,
	BooleanFilterOperator,
	SortDirection,
	LoadingState,
	ExportFormat,
	ExportScope,
	BulkActionVariant,
} from './RichDataGrid'

// Type Guards
export {
	isTextFilter,
	isNumberFilter,
	isDateFilter,
	isSelectFilter,
	isBooleanFilter,
	isRangeFilter,
	createColumnId,
	createRowId,
} from './RichDataGrid'

// Filter Utilities
export {
	createTextFilter,
	createNumberFilter,
	createDateFilter,
	createSelectFilter,
	createBooleanFilter,
	createRangeFilter,
	serializeFilter,
	deserializeFilter,
	hasValidFilterValue,
	getOperatorsForFilterType,
	operatorRequiresSecondValue,
	operatorRequiresNoValue,
	getOperatorLabel,
} from './RichDataGrid'

// Constants
export { DEFAULT_SEARCH_DEBOUNCE_MS, DEFAULT_OPERATORS, OPERATOR_LABELS } from './RichDataGrid'

// Column Helpers
export { createRichColumnHelper, textColumn, numberColumn, dateColumn, selectColumn } from './RichDataGrid'

// RichDataGrid Types
export type {
	RichColumnDef,
	RichColumnDefWithAccessor,
	RichColumnDefWithFn,
	RichColumnDefDisplay,
	UseRichDataGridReturn,
	RichSearchFilter,
	RichPagedResult,
	ColumnFilterValue,
	ColumnFilterConfig,
	ColumnFilterOptions,
	SelectOption,
	FacetCount,
	FacetData,
	BulkAction,
	ExportOptions,
	SortDescriptor,
	BackendColumnFilter,
	ColumnId,
	RowId,
	TextFilterValue,
	NumberFilterValue,
	DateFilterValue,
	SelectFilterValue,
	BooleanFilterValue,
	RangeFilterValue,
	FilterOperator,
	RichColumnExtensions,
	ExtractColumnIds,
	RequireFields,
	PartialExcept,
	DeepPartial,
} from './RichDataGrid'
