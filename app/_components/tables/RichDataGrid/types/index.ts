/**
 * RichDataGrid Types Barrel Export
 *
 * Centralized export for all RichDataGrid type definitions.
 * Following project barrel export conventions with explicit named exports.
 *
 * @module RichDataGridTypes
 */

// === CORE TYPE DEFINITIONS ===
// Branded Types
export type { ColumnId, RowId } from './richDataGridTypes'
export { createColumnId, createRowId } from './richDataGridTypes'

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
} from './richDataGridTypes'

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
} from './richDataGridTypes'

// Type Guards
export {
	isTextFilter,
	isNumberFilter,
	isDateFilter,
	isSelectFilter,
	isBooleanFilter,
	isRangeFilter,
} from './richDataGridTypes'

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
	RichDataGridProps,
	UseRichDataGridReturn,
} from './richDataGridTypes'

// Utility Types
export type {
	ExtractColumnIds,
	RequireFields,
	PartialExcept,
	DeepPartial,
} from './richDataGridTypes'

// Virtualization Types
export type { VirtualizationConfig } from './richDataGridTypes'
export { DEFAULT_VIRTUALIZATION_CONFIG } from './richDataGridTypes'

// Constants
export {
	DEFAULT_PAGE_SIZE_OPTIONS,
	DEFAULT_SEARCH_DEBOUNCE_MS,
	DEFAULT_OPERATORS,
	OPERATOR_LABELS,
	getOperatorLabel,
} from './richDataGridTypes'

// === FILTER UTILITIES ===
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
} from './filterTypes'

// === RE-EXPORT TANSTACK TYPES FOR CONVENIENCE ===
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
} from '@tanstack/react-table'
