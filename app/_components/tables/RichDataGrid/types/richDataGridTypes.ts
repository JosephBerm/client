/**
 * RichDataGrid Type System
 *
 * MAANG-level TypeScript definitions for the RichDataGrid component.
 * Leverages advanced TypeScript features for maximum type safety:
 *
 * - **Enums**: Type-safe constants for filter types, operators, sort directions
 * - **Discriminated Unions**: Type-safe filter value handling by filter type
 * - **Branded Types**: Runtime-safe IDs to prevent accidental type mixing
 * - **Mapped Types**: Derived column configurations from data types
 * - **Generic Constraints**: Type-safe column definitions
 * - **Template Literal Types**: Strongly typed filter expressions
 * - **Type Guards**: Runtime type checking with type narrowing
 *
 * @module RichDataGridTypes
 */

import type {
	ColumnDef,
	SortingState,
	ColumnFiltersState,
	VisibilityState,
	RowSelectionState,
	PaginationState,
	ColumnPinningState,
	Table,
	Row,
} from '@tanstack/react-table'

// ============================================================================
// BRANDED TYPES - Prevent Accidental Type Mixing (MAANG Pattern)
// ============================================================================

/**
 * Branded type for Column IDs.
 * Prevents accidentally passing a RowId where a ColumnId is expected.
 *
 * @example
 * const colId: ColumnId = 'name' as ColumnId
 * // Error: const colId: ColumnId = rowId // Type error!
 */
declare const BRAND_SYMBOL: unique symbol
type Brand<B> = { [BRAND_SYMBOL]: B }

export type ColumnId = string & Brand<'ColumnId'>
export type RowId = string & Brand<'RowId'>

/**
 * Create a branded ColumnId from a string.
 * Use this helper to create type-safe column IDs.
 */
export const createColumnId = (id: string): ColumnId => id as ColumnId

/**
 * Create a branded RowId from a string.
 */
export const createRowId = (id: string): RowId => id as RowId

// ============================================================================
// FILTER TYPE ENUM - Type-safe Filter Categories
// ============================================================================

/**
 * Filter type enum for column filtering.
 * Determines which filter UI component to render and how values are handled.
 *
 * @enum {string}
 */
export enum FilterType {
	/** Text filter: contains, equals, startsWith, endsWith */
	Text = 'text',
	/** Number filter: equals, gt, lt, gte, lte, between */
	Number = 'number',
	/** Date filter: before, after, between, today, thisWeek, thisMonth */
	Date = 'date',
	/** Select filter: single or multi-select from predefined values */
	Select = 'select',
	/** Boolean filter: true/false/all */
	Boolean = 'boolean',
	/** Range filter: numeric range with min/max (e.g., price range) */
	Range = 'range',
}

// ============================================================================
// FILTER OPERATOR ENUMS - Type-safe Operators by Category
// ============================================================================

/**
 * Text filter operators.
 * Following AG Grid and MUI DataGrid X patterns.
 */
export enum TextFilterOperator {
	Contains = 'contains',
	NotContains = 'notContains',
	Equals = 'equals',
	NotEquals = 'notEquals',
	StartsWith = 'startsWith',
	EndsWith = 'endsWith',
	IsEmpty = 'isEmpty',
	IsNotEmpty = 'isNotEmpty',
}

/**
 * Number filter operators.
 * Supports comparison and range operations.
 */
export enum NumberFilterOperator {
	Equals = 'eq',
	NotEquals = 'neq',
	GreaterThan = 'gt',
	GreaterThanOrEqual = 'gte',
	LessThan = 'lt',
	LessThanOrEqual = 'lte',
	Between = 'between',
	IsEmpty = 'isEmpty',
	IsNotEmpty = 'isNotEmpty',
}

/**
 * Date filter operators.
 * Includes relative date options for better UX.
 */
export enum DateFilterOperator {
	Is = 'is',
	IsNot = 'isNot',
	Before = 'before',
	After = 'after',
	OnOrBefore = 'onOrBefore',
	OnOrAfter = 'onOrAfter',
	Between = 'between',
	/** Today - relative date */
	Today = 'today',
	/** Yesterday - relative date */
	Yesterday = 'yesterday',
	/** This week - relative date */
	ThisWeek = 'thisWeek',
	/** Last week - relative date */
	LastWeek = 'lastWeek',
	/** This month - relative date */
	ThisMonth = 'thisMonth',
	/** Last month - relative date */
	LastMonth = 'lastMonth',
	IsEmpty = 'isEmpty',
	IsNotEmpty = 'isNotEmpty',
}

/**
 * Select filter operators.
 * For single and multi-select dropdowns.
 */
export enum SelectFilterOperator {
	Is = 'is',
	IsNot = 'isNot',
	IsAnyOf = 'isAnyOf',
	IsNoneOf = 'isNoneOf',
}

/**
 * Boolean filter operators.
 */
export enum BooleanFilterOperator {
	Is = 'is',
}

/**
 * Union of all filter operators.
 * Useful for generic filter handling.
 */
export type FilterOperator =
	| TextFilterOperator
	| NumberFilterOperator
	| DateFilterOperator
	| SelectFilterOperator
	| BooleanFilterOperator

// ============================================================================
// DISCRIMINATED UNION - Type-safe Filter Values by Type
// ============================================================================

/**
 * Text filter value configuration.
 */
export interface TextFilterValue {
	readonly filterType: FilterType.Text
	operator: TextFilterOperator
	value: string
	/** For case-sensitive matching */
	caseSensitive?: boolean
}

/**
 * Number filter value configuration.
 */
export interface NumberFilterValue {
	readonly filterType: FilterType.Number
	operator: NumberFilterOperator
	value: number
	/** For 'between' operator - upper bound */
	valueTo?: number
}

/**
 * Date filter value configuration.
 */
export interface DateFilterValue {
	readonly filterType: FilterType.Date
	operator: DateFilterOperator
	value: Date | string
	/** For 'between' operator - end date */
	valueTo?: Date | string
}

/**
 * Select filter value configuration.
 */
export interface SelectFilterValue {
	readonly filterType: FilterType.Select
	operator: SelectFilterOperator
	/** Array of selected values */
	values: string[]
}

/**
 * Boolean filter value configuration.
 */
export interface BooleanFilterValue {
	readonly filterType: FilterType.Boolean
	operator: BooleanFilterOperator
	value: boolean | null // null = all
}

/**
 * Range filter value configuration.
 */
export interface RangeFilterValue {
	readonly filterType: FilterType.Range
	min?: number
	max?: number
}

/**
 * Discriminated union of all filter values.
 * TypeScript will narrow the type based on filterType.
 *
 * @example
 * function handleFilter(filter: ColumnFilterValue) {
 *   switch (filter.filterType) {
 *     case FilterType.Text:
 *       // TypeScript knows filter is TextFilterValue here
 *       console.log(filter.value.toUpperCase())
 *       break
 *     case FilterType.Number:
 *       // TypeScript knows filter is NumberFilterValue here
 *       console.log(filter.value.toFixed(2))
 *       break
 *   }
 * }
 */
export type ColumnFilterValue =
	| TextFilterValue
	| NumberFilterValue
	| DateFilterValue
	| SelectFilterValue
	| BooleanFilterValue
	| RangeFilterValue

// ============================================================================
// TYPE GUARDS - Runtime Type Checking with Narrowing
// ============================================================================

/**
 * Type guard for text filter values.
 */
export function isTextFilter(filter: ColumnFilterValue): filter is TextFilterValue {
	return filter.filterType === FilterType.Text
}

/**
 * Type guard for number filter values.
 */
export function isNumberFilter(filter: ColumnFilterValue): filter is NumberFilterValue {
	return filter.filterType === FilterType.Number
}

/**
 * Type guard for date filter values.
 */
export function isDateFilter(filter: ColumnFilterValue): filter is DateFilterValue {
	return filter.filterType === FilterType.Date
}

/**
 * Type guard for select filter values.
 */
export function isSelectFilter(filter: ColumnFilterValue): filter is SelectFilterValue {
	return filter.filterType === FilterType.Select
}

/**
 * Type guard for boolean filter values.
 */
export function isBooleanFilter(filter: ColumnFilterValue): filter is BooleanFilterValue {
	return filter.filterType === FilterType.Boolean
}

/**
 * Type guard for range filter values.
 */
export function isRangeFilter(filter: ColumnFilterValue): filter is RangeFilterValue {
	return filter.filterType === FilterType.Range
}

// ============================================================================
// SORT DIRECTION ENUM
// ============================================================================

/**
 * Sort direction enum.
 */
export enum SortDirection {
	Ascending = 'asc',
	Descending = 'desc',
}

// ============================================================================
// COLUMN FILTER DEFINITION - Type-safe per-column filter config
// ============================================================================

/**
 * Column filter configuration.
 * Sent to backend for server-side filtering.
 */
export interface ColumnFilterConfig {
	/** Column identifier */
	columnId: ColumnId
	/** Filter configuration */
	filter: ColumnFilterValue
}

// ============================================================================
// RICH COLUMN DEFINITION - Extended TanStack Column with filter config
// ============================================================================

/**
 * Filter options for a column.
 * Defines how a column can be filtered.
 */
export interface ColumnFilterOptions<TData> {
	/** Filter type for this column */
	filterType: FilterType
	/** Default operator for this filter type */
	defaultOperator?: FilterOperator
	/** For select filters: list of options or function to fetch them */
	options?: SelectOption[] | (() => Promise<SelectOption[]>)
	/** Custom filter function for client-side filtering */
	filterFn?: (row: Row<TData>, columnId: string, filterValue: ColumnFilterValue) => boolean
	/** Whether this column should be included in global search */
	searchable?: boolean
	/** Whether this column should show as a faceted filter */
	faceted?: boolean
	/** Placeholder text for filter input */
	placeholder?: string
}

/**
 * Option type for select filters.
 */
export interface SelectOption {
	/** Option value */
	value: string
	/** Display label */
	label: string
	/** Optional icon */
	icon?: React.ReactNode
	/** Whether option is disabled */
	disabled?: boolean
	/** Count for faceted filters */
	count?: number
}

/**
 * Rich column extensions - additional props for RichDataGrid columns.
 */
export interface RichColumnExtensions<TData> {
	/** Filter configuration for this column */
	filterOptions?: ColumnFilterOptions<TData>
	/** Whether column is visible by default */
	defaultVisible?: boolean
	/** Whether column can be hidden */
	enableHiding?: boolean
	/** Whether column can be resized */
	enableResizing?: boolean
	/** Whether column can be pinned */
	enablePinning?: boolean
	/** Column group header (for grouped columns) */
	groupHeader?: string
	/** Sticky position: 'left' or 'right' */
	sticky?: 'left' | 'right'
	/** Column width constraints */
	width?: {
		min?: number
		max?: number
		default?: number
	}
}

/**
 * Extended column definition with RichDataGrid features.
 * Use this type when defining columns for RichDataGrid.
 * Uses intersection type instead of extends to avoid TypeScript issues with ColumnDef.
 *
 * @template TData - Row data type
 * @template TValue - Cell value type
 */
export type RichColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & RichColumnExtensions<TData>

// ============================================================================
// RICH SEARCH FILTER - Backend Request Structure
// ============================================================================

/**
 * Sort descriptor for multi-column sorting.
 * Matches AG Grid SortModel pattern.
 */
export interface SortDescriptor {
	/** Column to sort by */
	columnId: ColumnId
	/** Sort direction */
	direction: SortDirection
}

/**
 * Backend filter model.
 * Sent to server for server-side filtering.
 */
export interface BackendColumnFilter {
	/** Column identifier (string for backend compatibility) */
	columnId: string
	/** Filter type */
	filterType: FilterType
	/** Operator */
	operator: string
	/** Primary value */
	value: unknown
	/** Secondary value (for 'between' operators) */
	valueTo?: unknown
	/** Array values (for 'isAnyOf' operators) */
	values?: unknown[]
}

/**
 * Rich search filter - Complete request payload for server-side operations.
 * Comprehensive filter model that supports all MAANG-level features.
 */
export interface RichSearchFilter {
	// === PAGINATION ===
	/** Current page (1-based) */
	page: number
	/** Items per page */
	pageSize: number

	// === SORTING ===
	/** Multi-column sorting descriptors */
	sorting: SortDescriptor[]

	// === GLOBAL SEARCH ===
	/** Global search query (searches across searchable columns) */
	globalSearch?: string
	/** Columns to include in global search (defaults to all searchable) */
	searchableColumns?: string[]

	// === COLUMN FILTERS ===
	/** Per-column filters */
	columnFilters: BackendColumnFilter[]

	// === FACETED FILTERS ===
	/** Columns to request facet aggregation for (server returns unique values with counts) */
	facetColumns?: string[]
	/** Faceted filter selections (e.g., { category: ['Medical', 'Dental'] }) */
	facetFilters?: Record<string, string[]>

	// === ROW SELECTION (for bulk operations) ===
	/** Selected row IDs (for bulk actions) */
	selectedIds?: string[]
	/** Select all flag (for server-side select all) */
	selectAll?: boolean
	/** Exclude IDs when selectAll is true */
	excludeIds?: string[]

	// === ENTITY RELATIONS ===
	/** Related entities to include (eager loading) */
	includes?: string[]
}

// ============================================================================
// RICH SEARCH RESPONSE - Backend Response Structure
// ============================================================================

/**
 * Facet count for a filter value.
 */
export interface FacetCount {
	/** Filter value (used for filtering, e.g., ID) */
	value: string
	/** Display label (optional, e.g., Name). If null, value is used for display. */
	label?: string
	/** Count of items matching this value */
	count: number
}

/**
 * Facet data for a column.
 */
export interface FacetData {
	/** Column identifier */
	columnId: string
	/** Counts for each value */
	values: FacetCount[]
	/** Total unique values */
	totalValues: number
}

/**
 * Rich paged result from server.
 * Includes data, pagination metadata, and optional facets.
 *
 * @template TData - Row data type
 */
export interface RichPagedResult<TData> {
	/** Page data */
	data: TData[]

	// === PAGINATION METADATA ===
	/** Current page (1-based) */
	page: number
	/** Items per page */
	pageSize: number
	/** Total items across all pages */
	total: number
	/** Total number of pages */
	totalPages: number
	/** Whether next page exists */
	hasNext: boolean
	/** Whether previous page exists */
	hasPrevious: boolean

	// === FACETS (for faceted filters) ===
	/** Facet counts for columns with faceted=true */
	facets?: Record<string, FacetData>

	// === AGGREGATIONS (optional) ===
	/** Optional aggregated values (e.g., totals, averages) */
	aggregations?: Record<string, unknown>
}

// ============================================================================
// VIRTUALIZATION TYPES
// ============================================================================

/**
 * Configuration for row virtualization.
 * Used when enableVirtualization is true to control rendering behavior.
 */
export interface VirtualizationConfig {
	/** Estimated row height in pixels (default: 48) */
	estimatedRowHeight: number
	/** Number of rows to render outside visible area (default: 5) */
	overscan: number
	/** Maximum height of the virtualized container in pixels */
	maxHeight?: number
}

/**
 * Default virtualization configuration.
 */
export const DEFAULT_VIRTUALIZATION_CONFIG: VirtualizationConfig = {
	estimatedRowHeight: 48,
	overscan: 5,
	maxHeight: 600,
}

// ============================================================================
// COMPONENT STATE TYPES
// ============================================================================

/**
 * Loading state enum for component.
 */
export enum LoadingState {
	/** Initial state, no data loaded */
	Idle = 'idle',
	/** First load, show skeleton */
	Loading = 'loading',
	/** Refreshing with existing data visible */
	Refreshing = 'refreshing',
	/** Data loaded successfully */
	Success = 'success',
	/** Error occurred */
	Error = 'error',
}

/**
 * Export format enum.
 */
export enum ExportFormat {
	CSV = 'csv',
	Excel = 'xlsx',
	JSON = 'json',
	PDF = 'pdf',
}

/**
 * Export scope enum.
 */
export enum ExportScope {
	/** Current page only */
	CurrentPage = 'currentPage',
	/** All pages / all rows */
	AllPages = 'allPages',
	/** Selected rows only */
	SelectedRows = 'selectedRows',
	/** Filtered rows (respects current filters) */
	FilteredRows = 'filteredRows',
}

/**
 * Export options configuration.
 */
export interface ExportOptions {
	/** Export format */
	format: ExportFormat
	/** Export scope */
	scope: ExportScope
	/** Columns to include (defaults to visible columns) */
	columns?: ColumnId[]
	/** Include headers */
	includeHeaders?: boolean
	/** Filename (without extension) */
	filename?: string
}

// ============================================================================
// BULK ACTION TYPES
// ============================================================================

/**
 * Bulk action variant for styling.
 */
export enum BulkActionVariant {
	Default = 'default',
	Primary = 'primary',
	Danger = 'danger',
	Warning = 'warning',
}

/**
 * Bulk action definition.
 *
 * @template TData - Row data type
 */
export interface BulkAction<TData> {
	/** Unique action identifier */
	id: string
	/** Display label */
	label: string
	/** Optional icon */
	icon?: React.ReactNode
	/** Action variant for styling */
	variant?: BulkActionVariant
	/** Handler function */
	onAction: (selectedRows: TData[], selectedIds: RowId[]) => void | Promise<void>
	/** Whether action is disabled */
	disabled?: boolean | ((selectedRows: TData[]) => boolean)
	/** Confirmation message (shows confirm dialog if provided) */
	confirmMessage?: string | ((count: number) => string)
	/** Minimum rows required */
	minRows?: number
	/** Maximum rows allowed */
	maxRows?: number
}

// ============================================================================
// RICH DATA GRID PROPS - Main Component Props
// ============================================================================

/**
 * RichDataGrid component props.
 * Comprehensive props interface for the RichDataGrid component.
 *
 * @template TData - Row data type
 */
export interface RichDataGridProps<TData extends { id?: string | number }> {
	// === DATA ===
	/** API endpoint for data fetching (for server-side mode) */
	endpoint?: string
	/** Static data (for client-side mode) */
	data?: TData[]
	/** Column definitions */
	columns: RichColumnDef<TData>[]

	// === IDENTIFICATION ===
	/** Unique identifier for state persistence */
	persistStateKey?: string
	/** ARIA label for accessibility */
	ariaLabel: string

	// === FEATURE FLAGS ===
	/** Enable global search */
	enableGlobalSearch?: boolean
	/** Enable column filters */
	enableColumnFilters?: boolean
	/** Enable row selection */
	enableRowSelection?: boolean
	/** Enable faceted filters sidebar */
	enableFacetedFilters?: boolean
	/** Enable export functionality */
	enableExport?: boolean
	/** Enable column visibility toggle */
	enableColumnVisibility?: boolean
	/** Enable column resizing */
	enableColumnResizing?: boolean
	/** Enable column pinning */
	enableColumnPinning?: boolean
	/** Enable row virtualization */
	enableVirtualization?: boolean

	// === INITIAL STATE ===
	/** Default page size */
	defaultPageSize?: number
	/** Default sorting */
	defaultSorting?: SortDescriptor[]
	/** Default column visibility */
	defaultColumnVisibility?: VisibilityState

	// === CALLBACKS ===
	/** Called when row is clicked */
	onRowClick?: (row: TData) => void
	/** Called when row is double-clicked */
	onRowDoubleClick?: (row: TData) => void
	/** Called when selection changes */
	onSelectionChange?: (selectedRows: TData[], selectedIds: RowId[]) => void
	/** Called on data fetch error */
	onError?: (error: Error) => void

	// === BULK ACTIONS ===
	/** Bulk action definitions */
	bulkActions?: BulkAction<TData>[]

	// === CUSTOMIZATION ===
	/** Facet columns to show in sidebar */
	facetColumns?: ColumnId[]
	/** Custom empty state component */
	emptyState?: React.ReactNode
	/** Custom error state component */
	errorState?: (error: Error, retry: () => void) => React.ReactNode
	/** Custom loading component */
	loadingComponent?: React.ReactNode

	// === STYLING ===
	/** Additional CSS class */
	className?: string
	/** Row class getter */
	getRowClassName?: (row: TData) => string

	// === ADVANCED ===
	/** Debounce delay for search (ms) */
	searchDebounceMs?: number
	/** Server table hook configuration */
	serverConfig?: {
		/** Transform request before sending */
		transformRequest?: (filter: RichSearchFilter) => RichSearchFilter
		/** Transform response after receiving */
		transformResponse?: <T>(response: RichPagedResult<T>) => RichPagedResult<T>
	}
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useRichDataGrid hook.
 *
 * @template TData - Row data type
 */
export interface UseRichDataGridReturn<TData> {
	// === TABLE INSTANCE ===
	table: Table<TData>

	// === DATA ===
	data: TData[]
	totalItems: number
	facets: Record<string, FacetData> | undefined

	// === LOADING STATE ===
	loadingState: LoadingState
	isLoading: boolean
	isRefreshing: boolean
	error: Error | null

	// === GLOBAL SEARCH ===
	globalFilter: string
	setGlobalFilter: (value: string) => void

	// === COLUMN FILTERS ===
	columnFilters: ColumnFiltersState
	setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
	/** Set filter for a specific column. Pass null to clear the filter. */
	setColumnFilter: (columnId: string, value: ColumnFilterValue | null) => void
	/** Get current filter value for a specific column */
	getColumnFilter: (columnId: string) => ColumnFilterValue | undefined
	clearColumnFilters: () => void
	activeFilterCount: number

	// === ROW SELECTION ===
	rowSelection: RowSelectionState
	selectedRows: TData[]
	selectedIds: RowId[]
	selectedCount: number
	setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
	clearSelection: () => void
	selectAll: () => void

	// === COLUMN VISIBILITY ===
	columnVisibility: VisibilityState
	setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>
	toggleColumnVisibility: (columnId: ColumnId) => void
	visibleColumnCount: number
	hiddenColumnCount: number

	// === PAGINATION ===
	pagination: PaginationState
	setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
	pageCount: number
	canPreviousPage: boolean
	canNextPage: boolean

	// === SORTING ===
	sorting: SortingState
	setSorting: React.Dispatch<React.SetStateAction<SortingState>>

	// === COLUMN PINNING ===
	columnPinning: ColumnPinningState
	setColumnPinning: React.Dispatch<React.SetStateAction<ColumnPinningState>>
	pinColumn: (columnId: string, position: 'left' | 'right' | false) => void
	unpinColumn: (columnId: string) => void
	isPinned: (columnId: string) => 'left' | 'right' | false

	// === ACTIONS ===
	refresh: () => void
	exportData: (options: ExportOptions) => Promise<void>
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract column IDs from column definitions.
 * Useful for type-safe column references.
 */
export type ExtractColumnIds<TColumns extends readonly RichColumnDef<unknown>[]> =
	TColumns[number] extends { accessorKey: infer K } ? K : never

/**
 * Make specific properties required.
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Make all properties optional except specified ones.
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

/**
 * Deep partial type.
 */
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default page size options.
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const

/**
 * Default search debounce time (ms).
 */
export const DEFAULT_SEARCH_DEBOUNCE_MS = 300

/**
 * Default operators by filter type.
 */
export const DEFAULT_OPERATORS: Record<FilterType, FilterOperator> = {
	[FilterType.Text]: TextFilterOperator.Contains,
	[FilterType.Number]: NumberFilterOperator.Equals,
	[FilterType.Date]: DateFilterOperator.Is,
	[FilterType.Select]: SelectFilterOperator.Is,
	[FilterType.Boolean]: BooleanFilterOperator.Is,
	[FilterType.Range]: NumberFilterOperator.Between,
}

/**
 * Operator display names, organized by filter type.
 * Structured to avoid duplicate keys (DRY and type-safe).
 */
export const OPERATOR_LABELS = {
	[FilterType.Text]: {
		[TextFilterOperator.Contains]: 'Contains',
		[TextFilterOperator.NotContains]: 'Does not contain',
		[TextFilterOperator.Equals]: 'Equals',
		[TextFilterOperator.NotEquals]: 'Does not equal',
		[TextFilterOperator.StartsWith]: 'Starts with',
		[TextFilterOperator.EndsWith]: 'Ends with',
		[TextFilterOperator.IsEmpty]: 'Is empty',
		[TextFilterOperator.IsNotEmpty]: 'Is not empty',
	},
	[FilterType.Number]: {
		[NumberFilterOperator.Equals]: 'Equals',
		[NumberFilterOperator.NotEquals]: 'Does not equal',
		[NumberFilterOperator.GreaterThan]: 'Greater than',
		[NumberFilterOperator.GreaterThanOrEqual]: 'Greater than or equal',
		[NumberFilterOperator.LessThan]: 'Less than',
		[NumberFilterOperator.LessThanOrEqual]: 'Less than or equal',
		[NumberFilterOperator.Between]: 'Between',
		[NumberFilterOperator.IsEmpty]: 'Is empty',
		[NumberFilterOperator.IsNotEmpty]: 'Is not empty',
	},
	[FilterType.Date]: {
		[DateFilterOperator.Is]: 'Is',
		[DateFilterOperator.IsNot]: 'Is not',
		[DateFilterOperator.Before]: 'Before',
		[DateFilterOperator.After]: 'After',
		[DateFilterOperator.OnOrBefore]: 'On or before',
		[DateFilterOperator.OnOrAfter]: 'On or after',
		[DateFilterOperator.Between]: 'Between',
		[DateFilterOperator.Today]: 'Today',
		[DateFilterOperator.Yesterday]: 'Yesterday',
		[DateFilterOperator.ThisWeek]: 'This week',
		[DateFilterOperator.LastWeek]: 'Last week',
		[DateFilterOperator.ThisMonth]: 'This month',
		[DateFilterOperator.LastMonth]: 'Last month',
		[DateFilterOperator.IsEmpty]: 'Is empty',
		[DateFilterOperator.IsNotEmpty]: 'Is not empty',
	},
	[FilterType.Select]: {
		[SelectFilterOperator.Is]: 'Is',
		[SelectFilterOperator.IsNot]: 'Is not',
		[SelectFilterOperator.IsAnyOf]: 'Is any of',
		[SelectFilterOperator.IsNoneOf]: 'Is none of',
	},
	[FilterType.Boolean]: {
		[BooleanFilterOperator.Is]: 'Is',
	},
	[FilterType.Range]: {
		[NumberFilterOperator.Between]: 'Between',
	},
} as const

/**
 * Helper to get operator label.
 */
export function getOperatorLabel(filterType: FilterType, operator: FilterOperator): string {
	const labels = OPERATOR_LABELS[filterType]
	return (labels as Record<string, string>)?.[operator] ?? operator
}

