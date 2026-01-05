/**
 * RichDataGrid Barrel Export
 *
 * Enterprise-grade data grid component with MAANG-level features.
 * Follows project barrel export conventions for clean imports.
 *
 * @example
 * import {
 *   RichDataGrid,
 *   type RichDataGridProps,
 *   FilterType,
 *   TextFilterOperator,
 *   createTextFilter,
 *   useRichDataGrid,
 * } from '@_components/tables/RichDataGrid'
 *
 * @module RichDataGrid
 */

// === MAIN COMPONENT ===
export { RichDataGrid } from './RichDataGrid'
export type { RichDataGridProps, RichDataGridApi } from './RichDataGrid'

// === HOOKS ===
export { useRichDataGrid } from './hooks/useRichDataGrid'
export type { UseRichDataGridOptions } from './hooks/useRichDataGrid'

export { useGridUrlState } from './hooks/useGridUrlState'
export type { GridUrlStateConfig, GridUrlState, UseGridUrlStateReturn } from './hooks/useGridUrlState'

export { useRangeSelection } from './hooks/useRangeSelection'
export type { UseRangeSelectionOptions, UseRangeSelectionReturn } from './hooks/useRangeSelection'

export { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
export type { UseKeyboardNavigationOptions, UseKeyboardNavigationReturn } from './hooks/useKeyboardNavigation'

export { useClickOutside, useEscapeKey } from './hooks/useClickOutside'

// === CONTEXT ===
export {
	RichDataGridProvider,
	useRichDataGridContext,
	useRichDataGridSelection,
	useRichDataGridFilters,
	useRichDataGridPagination,
	useRichDataGridVisibility,
	useRichDataGridLoading,
	useRichDataGridPinning,
	useRichDataGridFacets,
	useRichDataGridOptimistic,
} from './context/RichDataGridContext'

// === TOOLBAR COMPONENTS ===
export { RichDataGridToolbar } from './components/Toolbar/RichDataGridToolbar'
export type { RichDataGridToolbarProps } from './components/Toolbar/RichDataGridToolbar'
export { GlobalSearchInput } from './components/Toolbar/GlobalSearchInput'
export type { GlobalSearchInputProps } from './components/Toolbar/GlobalSearchInput'
export { ColumnVisibilityDropdown } from './components/Toolbar/ColumnVisibilityDropdown'
export type { ColumnVisibilityDropdownProps } from './components/Toolbar/ColumnVisibilityDropdown'
export { BulkActionsDropdown } from './components/Toolbar/BulkActionsDropdown'
export type { BulkActionsDropdownProps } from './components/Toolbar/BulkActionsDropdown'

// === TABLE COMPONENTS ===
export { RichDataGridHeader } from './components/Table/RichDataGridHeader'
export type { RichDataGridHeaderProps } from './components/Table/RichDataGridHeader'
export { RichDataGridBody } from './components/Table/RichDataGridBody'
export type { RichDataGridBodyProps } from './components/Table/RichDataGridBody'
export { VirtualizedBody } from './components/Table/VirtualizedBody'
export type { VirtualizedBodyProps } from './components/Table/VirtualizedBody'
export { RichDataGridPagination } from './components/Table/RichDataGridPagination'
export type { RichDataGridPaginationProps } from './components/Table/RichDataGridPagination'

// === SELECTION COMPONENTS ===
export { SelectAllCheckbox } from './components/Selection/SelectAllCheckbox'
export type { SelectAllCheckboxProps } from './components/Selection/SelectAllCheckbox'
export { RowSelectionCheckbox } from './components/Selection/RowSelectionCheckbox'
export type { RowSelectionCheckboxProps } from './components/Selection/RowSelectionCheckbox'
export { SelectionStatusBar } from './components/Selection/SelectionStatusBar'
export type { SelectionStatusBarProps } from './components/Selection/SelectionStatusBar'

// === HEADER COMPONENTS ===
export { ResizeHandle } from './components/Header'
export type { ResizeHandleProps } from './components/Header'

// === FILTER COMPONENTS ===
export {
	FilterPopover,
	TextFilterInput,
	NumberFilterInput,
	DateFilterInput,
	SelectFilterInput,
	BooleanFilterInput,
} from './components/Filter'
export type {
	FilterPopoverProps,
	TextFilterInputProps,
	NumberFilterInputProps,
	DateFilterInputProps,
	SelectFilterInputProps,
	BooleanFilterInputProps,
} from './components/Filter'

// === EXPORT COMPONENTS ===
export { ExportButton, ExportModal } from './components/Export'
export type { ExportButtonProps, ExportModalProps } from './components/Export'

// === EXPORT UTILITIES ===
export {
	exportData,
	exportToCSV,
	exportToExcel,
	exportToPDF,
	quickExport,
} from './utils/exportUtils'
export type {
	ExportConfig,
	ExportResult,
	ExportColumnConfig,
} from './utils/exportUtils'

// === TYPES, ENUMS, TYPE GUARDS, UTILITIES, CONSTANTS ===
// Explicit named exports following project lint rules

// Branded Types
export type { ColumnId, RowId } from './types'
export { createColumnId, createRowId } from './types'

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
} from './types'

// Filter Value Types
export type {
	FilterOperator,
	TextFilterValue,
	NumberFilterValue,
	DateFilterValue,
	SelectFilterValue,
	BooleanFilterValue,
	RangeFilterValue,
	ColumnFilterValue,
} from './types'

// Type Guards
export {
	isTextFilter,
	isNumberFilter,
	isDateFilter,
	isSelectFilter,
	isBooleanFilter,
	isRangeFilter,
} from './types'

// Column and Filter Configuration Types
export type {
	ColumnFilterConfig,
	ColumnFilterOptions,
	SelectOption,
	RichColumnExtensions,
	RichColumnDef,
	SortDescriptor,
	BackendColumnFilter,
	RichSearchFilter,
	FacetCount,
	FacetData,
	RichPagedResult,
	ExportOptions,
	BulkAction,
	UseRichDataGridReturn,
} from './types'

// Utility Types
export type {
	ExtractColumnIds,
	RequireFields,
	PartialExcept,
	DeepPartial,
} from './types'

// Virtualization Types
export type { VirtualizationConfig } from './types'
export { DEFAULT_VIRTUALIZATION_CONFIG } from './types'

// Constants
export {
	DEFAULT_PAGE_SIZE_OPTIONS,
	DEFAULT_SEARCH_DEBOUNCE_MS,
	DEFAULT_OPERATORS,
	OPERATOR_LABELS,
	getOperatorLabel,
} from './types'

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
} from './types'

// TanStack Table Re-exports
export type {
	ColumnDef,
	SortingState,
	ColumnFiltersState,
	VisibilityState,
	RowSelectionState,
	PaginationState,
	ColumnPinningState,
	Table,
	Row,
	Header,
	HeaderGroup,
	Cell,
} from './types'

// === COLUMN HELPERS ===
export {
	createRichColumnHelper,
	textColumn,
	numberColumn,
	dateColumn,
	selectColumn,
} from './utils/columnHelper'

export type { RichColumnDefWithAccessor, RichColumnDefWithFn, RichColumnDefDisplay } from './utils/columnHelper'

