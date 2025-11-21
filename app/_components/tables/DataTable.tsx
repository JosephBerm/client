/**
 * Data Table Component
 * 
 * Modern, powerful, and elegant data table component built on TanStack Table v8.
 * Supports both client-side and server-side pagination, sorting, and filtering.
 * Styled with DaisyUI for consistent theming. Mobile-first responsive design.
 * 
 * **Features:**
 * - Client-side AND server-side pagination
 * - Sortable columns with visual indicators (toggleable)
 * - Column filtering (client-side and server-side, toggleable)
 * - Loading spinner during data fetch
 * - Empty state with custom message
 * - Zebra striping (alternating row colors)
 * - Responsive overflow scrolling
 * - Page size selector (10, 20, 30, 40, 50) - toggleable
 * - First/Previous/Next/Last navigation - toggleable
 * - Page number display
 * - Hover states on rows
 * - Lucide icon sorting indicators
 * - Mobile-first responsive design
 * - WCAG AA accessibility compliance
 * - Structured logging for debugging
 * 
 * **Feature Toggles:**
 * All major features can be enabled/disabled with simple boolean props:
 * - `enableSorting` - Enable/disable column sorting
 * - `enableFiltering` - Enable/disable column filtering
 * - `enablePagination` - Enable/disable pagination controls
 * - `enablePageSize` - Enable/disable page size selector
 * 
 * **Modes:**
 * 1. **Client-Side**: Pass data array, table handles pagination/sorting/filtering
 * 2. **Server-Side**: Pass data + state, parent handles data fetching
 * 
 * **Use Cases:**
 * - User management tables
 * - Product listings
 * - Order history
 * - Any tabular data display
 * 
 * @example
 * ```tsx
 * import DataTable from '@_components/tables/DataTable';
 * import { ColumnDef } from '@tanstack/react-table';
 * 
 * // Define columns with filter support
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: 'Name',
 *     enableColumnFilter: true, // Enable filtering for this column
 *   },
 *   {
 *     accessorKey: 'email',
 *     header: 'Email',
 *     enableColumnFilter: true,
 *   },
 *   {
 *     accessorKey: 'role',
 *     header: 'Role',
 *     cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
 *     filterFn: 'equals', // Use exact match filter
 *   },
 * ];
 * 
 * // Full-featured table with all features enabled
 * <DataTable
 *   columns={columns}
 *   data={allUsers}
 *   enableSorting={true}
 *   enableFiltering={true}
 *   enablePagination={true}
 *   enablePageSize={true}
 *   pagination={{ pageIndex: 0, pageSize: 10 }}
 *   onPaginationChange={setPagination}
 * />
 * 
 * // Minimal table with only sorting
 * <DataTable
 *   columns={columns}
 *   data={allUsers}
 *   enableSorting={true}
 *   enableFiltering={false}
 *   enablePagination={false}
 *   enablePageSize={false}
 * />
 * 
 * // Server-side with filtering
 * <DataTable
 *   columns={columns}
 *   data={currentPageData}
 *   pageCount={totalPages}
 *   pagination={pagination}
 *   onPaginationChange={setPagination}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 *   columnFilters={columnFilters}
 *   onColumnFiltersChange={setColumnFilters}
 *   isLoading={isLoading}
 *   enableSorting={true}
 *   enableFiltering={true}
 *   enablePagination={true}
 *   enablePageSize={true}
 *   manualPagination
 *   manualSorting
 *   manualFiltering
 * />
 * ```
 * 
 * @module DataTable
 */

'use client'

import { ReactNode, useMemo } from 'react'
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	ColumnDef,
	PaginationState,
	SortingState,
	ColumnFiltersState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, X } from 'lucide-react'
import classNames from 'classnames'
import { logger } from '@_core'
import {
	DEFAULT_PAGE_SIZE_OPTIONS,
	DEFAULT_EMPTY_MESSAGE,
	TABLE_ERROR_MESSAGES,
	COMPONENT_NAME,
} from './tableConstants'
import {
	sanitizeString,
	isValidPageSize,
	calculateTotalItems,
	calculateLastPageIndex,
	calculatePaginationRange,
	isValidArray,
	normalizeArray,
} from './tableUtils'
import type { PaginationButtonConfig, TableFeatureToggles, TableManualModes } from './tableTypes'

/**
 * DataTable component props interface.
 * 
 * @template TData - The type of data items in the table rows
 */
interface DataTableProps<TData> extends TableFeatureToggles, TableManualModes {
	/** 
	 * TanStack Table column definitions.
	 * Defines table structure, headers, cells, sorting, filtering, and rendering.
	 */
	columns: ColumnDef<TData>[]
	
	/** 
	 * Array of data items to display in the table.
	 * For server-side tables, this is the current page data.
	 */
	data: TData[]
	
	/** 
	 * Total number of pages (for server-side pagination).
	 * Required when using manualPagination.
	 */
	pageCount?: number
	
	/** 
	 * Total number of items across all pages (for server-side pagination).
	 * Used for accurate pagination display. If not provided, calculated from pageCount * pageSize.
	 */
	totalItems?: number
	
	/** 
	 * Current pagination state.
	 * Object with pageIndex (0-based) and pageSize.
	 */
	pagination?: PaginationState
	
	/** 
	 * Callback when pagination changes.
	 * Receives new pagination state or updater function.
	 */
	onPaginationChange?: (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void
	
	/** 
	 * Current sorting state.
	 * Array of column sort specifications.
	 */
	sorting?: SortingState
	
	/** 
	 * Callback when sorting changes.
	 * Receives new sorting state or updater function.
	 */
	onSortingChange?: (updater: SortingState | ((old: SortingState) => SortingState)) => void
	
	/** 
	 * Current column filters state.
	 * Array of column filter specifications.
	 */
	columnFilters?: ColumnFiltersState
	
	/** 
	 * Callback when column filters change.
	 * Receives new filter state or updater function.
	 */
	onColumnFiltersChange?: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void
	
	/** 
	 * Whether table is currently loading data.
	 * Shows loading spinner in table body.
	 * @default false
	 */
	isLoading?: boolean
	
	/** 
	 * Message or component to display when table is empty.
	 * @default 'No data available'
	 */
	emptyMessage?: string | ReactNode
}

/**
 * DataTable Component
 * 
 * Modern, powerful, and elegant table component for displaying tabular data.
 * Built on TanStack Table v8 for powerful data management and DaisyUI for styling.
 * Mobile-first responsive design with full accessibility support.
 * 
 * **Table Structure:**
 * 1. Filter row (if filtering enabled)
 * 2. Header row with sortable columns
 * 3. Body rows with zebra striping
 * 4. Pagination controls (if pagination enabled)
 * 
 * **Sorting:**
 * - Click column header to toggle sort (if enabled)
 * - Visual indicators: unsorted (⇅), ascending (↑), descending (↓)
 * - Supports single column sorting
 * 
 * **Filtering:**
 * - Column-level filter inputs (if enabled)
 * - Client-side or server-side filtering
 * - Clear filters button
 * 
 * **Pagination:**
 * - First/Previous/Next/Last buttons (if enabled)
 * - Page number display
 * - Page size selector (10, 20, 30, 40, 50) (if enabled)
 * - Shows current range (e.g., "Showing 1 to 10 of 50")
 * 
 * **States:**
 * - **Loading**: Shows spinner, hides data
 * - **Empty**: Shows custom message when no data
 * - **Data**: Shows table with rows
 * 
 * **Client vs Server Mode:**
 * - **Client**: Pass all data, table handles pagination/sorting/filtering
 * - **Server**: Pass current page data, use manualPagination/manualSorting/manualFiltering
 * 
 * @template TData - Type of data items in the table
 * @param props - Component props including columns, data, pagination, etc.
 * @returns DataTable component
 */
export default function DataTable<TData>({
	columns,
	data = [],
	pageCount,
	totalItems: propTotalItems,
	pagination,
	onPaginationChange,
	sorting,
	onSortingChange,
	columnFilters,
	onColumnFiltersChange,
	isLoading = false,
	manualPagination = false,
	manualSorting = false,
	manualFiltering = false,
	enableSorting = true,
	enableFiltering = true,
	enablePagination = true,
	enablePageSize = true,
	emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: DataTableProps<TData>) {
	// Defensive programming: Normalize inputs (but don't return early - hooks must come first)
	const normalizedColumns: ColumnDef<TData>[] = normalizeArray<ColumnDef<TData>>(columns)
	const normalizedData: TData[] = normalizeArray<TData>(data)
	
	// Log warnings for invalid inputs but continue execution
	const columnsLength = Array.isArray(columns) ? columns.length : 0
	if (columnsLength === 0) {
		logger.warn('DataTable rendered with invalid or empty columns array', {
			columnsLength,
			component: COMPONENT_NAME,
		})
	}
	
	if (!Array.isArray(data)) {
		logger.warn('DataTable rendered with invalid data prop', {
			dataType: typeof data,
			component: COMPONENT_NAME,
		})
	}
	
	/**
	 * Initialize TanStack Table instance with configuration.
	 * Handles all table logic including pagination, sorting, filtering, and rendering.
	 * Uses normalized data to prevent crashes.
	 */
	const table = useReactTable({
		data: normalizedData,    // Data array to display (normalized)
		columns: normalizedColumns, // Column definitions (normalized)
		pageCount,               // Total pages (server-side)
		state: {
			pagination,          // Current pagination state
			sorting,             // Current sorting state
			columnFilters,       // Current filter state
		},
		onPaginationChange,      // Pagination change handler
		onSortingChange,         // Sorting change handler
		onColumnFiltersChange,  // Filter change handler
		getCoreRowModel: getCoreRowModel(), // Required: builds row model
		getFilteredRowModel: getFilteredRowModel(), // Client-side filtering
		getSortedRowModel: getSortedRowModel(), // Client-side sorting
		getPaginationRowModel: getPaginationRowModel(), // Client-side pagination
		manualPagination,        // Whether pagination is handled externally
		manualSorting,          // Whether sorting is handled externally
		manualFiltering,        // Whether filtering is handled externally
		enableSorting,          // Global sorting toggle
		enableColumnFilters: enableFiltering, // Global filtering toggle
	})

	/**
	 * Get total item count for display using centralized utility.
	 * Priority: propTotalItems > calculated from pageCount > filtered row count.
	 */
	const totalItems = useMemo(() => {
		return calculateTotalItems({
			totalItems: propTotalItems,
			pageCount: manualPagination ? pageCount : undefined,
			pagination,
			filteredRowCount: table.getFilteredRowModel().rows.length,
		})
	}, [propTotalItems, manualPagination, pageCount, pagination, table])

	/**
	 * Check if any filters are active.
	 */
	const hasActiveFilters = useMemo(() => {
		return (columnFilters?.length ?? 0) > 0
	}, [columnFilters])

	/**
	 * Memoized pagination button configuration using centralized utility.
	 * DRY: Single source of truth for all pagination buttons.
	 */
	const paginationButtons = useMemo((): PaginationButtonConfig[] => {
		if (!pagination) return []
		
		const lastPageIndex = calculateLastPageIndex({
			pageCount,
			totalItems,
			pageSize: pagination.pageSize,
		})
		
		return [
			{ 
				label: 'First', 
				action: () => ({ ...pagination, pageIndex: 0 }), 
				disabled: !table.getCanPreviousPage(),
				ariaLabel: 'Go to first page'
			},
			{
				label: 'Previous',
				action: () => ({ ...pagination, pageIndex: Math.max(pagination.pageIndex - 1, 0) }),
				disabled: !table.getCanPreviousPage(),
				ariaLabel: 'Go to previous page'
			},
			{
				label: 'Next',
				action: () => ({ ...pagination, pageIndex: pagination.pageIndex + 1 }),
				disabled: !table.getCanNextPage(),
				ariaLabel: 'Go to next page'
			},
			{
				label: 'Last',
				action: () => ({
					...pagination,
					pageIndex: lastPageIndex,
				}),
				disabled: !table.getCanNextPage(),
				ariaLabel: 'Go to last page'
			},
		]
	}, [pagination, pageCount, totalItems, table])

	/**
	 * Handle filter value change for a column using centralized sanitization.
	 * Logs filter changes for debugging. Validates input to prevent XSS.
	 */
	const handleFilterChange = (columnId: string, value: string) => {
		if (!onColumnFiltersChange) return
		
		// Input validation: sanitize using utility function
		const sanitizedColumnId = sanitizeString(columnId)
		const sanitizedValue = sanitizeString(value)
		
		// Guard clause: invalid columnId
		if (!sanitizedColumnId) {
			logger.warn('Table filter change attempted with invalid columnId', {
				columnId,
				component: COMPONENT_NAME,
			})
			return
		}

		onColumnFiltersChange((old) => {
			const newFilters = old?.filter((f) => f.id !== sanitizedColumnId) || []
			if (sanitizedValue) {
				newFilters.push({ id: sanitizedColumnId, value: sanitizedValue })
			}
			
			logger.debug('Table filter changed', {
				columnId: sanitizedColumnId,
				valueLength: sanitizedValue.length, // Log length, not value (security)
				filterCount: newFilters.length,
				component: COMPONENT_NAME,
			})
			
			return newFilters
		})
	}

	/**
	 * Clear all filters.
	 * Logs filter clear action.
	 */
	const handleClearFilters = () => {
		if (!onColumnFiltersChange) return
		
		onColumnFiltersChange([])
		logger.debug('Table filters cleared', {
			component: COMPONENT_NAME,
		})
	}

	/**
	 * Get filter value for a column.
	 * Returns empty string if column not found or value is invalid.
	 */
	const getFilterValue = (columnId: string): string => {
		if (!columnId || !columnFilters) return ''
		const filter = columnFilters.find((f) => f.id === columnId)
		return (filter?.value as string) || ''
	}

	// Early return for invalid configuration (after all hooks)
	if (normalizedColumns.length === 0) {
		return (
			<div className="flex w-full flex-col gap-4 sm:gap-6">
				<div className="rounded-[32px] border border-base-300 bg-base-100 p-6 text-center text-base-content/60">
					{TABLE_ERROR_MESSAGES.NO_COLUMNS}
				</div>
			</div>
		)
	}

	return (
		<div className="flex w-full flex-col gap-4 sm:gap-6">
			{/* Filter Row - Mobile-first responsive design */}
			{enableFiltering && onColumnFiltersChange && columns.length > 0 && (
				<div className="flex flex-col gap-2 rounded-[24px] border border-base-300 bg-base-200/50 p-3 sm:p-4 shadow-md">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-primary sm:h-5 sm:w-5" aria-hidden="true" />
							<span className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/70 sm:text-sm">
								Filters
							</span>
						</div>
						{hasActiveFilters && (
							<button
								type="button"
								onClick={handleClearFilters}
								className="btn btn-ghost btn-xs sm:btn-sm flex items-center gap-1 rounded-full text-xs font-semibold uppercase tracking-[0.3em] transition hover:bg-base-300"
								aria-label="Clear all filters"
							>
								<X className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
								<span className="hidden sm:inline">Clear</span>
							</button>
						)}
					</div>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{table.getAllColumns()
							.filter((column) => column.getCanFilter())
							.map((column) => {
								const columnDef = column.columnDef
								const filterValue = getFilterValue(column.id)
								
								return (
									<div key={column.id} className="flex flex-col gap-1">
										<label
											htmlFor={`filter-${column.id}`}
											className="text-xs font-medium uppercase tracking-[0.2em] text-base-content/60"
										>
											{typeof columnDef.header === 'string' ? columnDef.header : column.id}
										</label>
										<input
											id={`filter-${column.id}`}
											type="text"
											value={filterValue}
											onChange={(e) => handleFilterChange(column.id, e.target.value)}
											placeholder={`Filter ${typeof columnDef.header === 'string' ? columnDef.header : column.id}...`}
											className="input input-bordered input-sm w-full rounded-lg text-sm focus:input-primary"
											aria-label={`Filter by ${typeof columnDef.header === 'string' ? columnDef.header : column.id}`}
										/>
									</div>
								)
							})}
					</div>
				</div>
			)}

			{/* Table Container - Mobile-first responsive */}
			<div className="overflow-hidden rounded-[32px] border border-base-300 bg-base-100 shadow-xl">
				<div className="relative overflow-x-auto">
					<table className="table table-zebra min-w-full" role="table" aria-label="Data table">
						<thead className="bg-primary text-primary-content">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header, headerIndex) => {
										const canSort = enableSorting && header.column.getCanSort()
										const isSorted = header.column.getIsSorted()
										
										return (
											<th
												key={header.id}
												className={classNames(
													'px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] sm:px-6 sm:py-4',
													{
														'cursor-pointer select-none transition hover:bg-primary-focus focus:bg-primary-focus focus:outline-2 focus:outline-offset-2 focus:outline-primary':
															canSort,
													}
												)}
												onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
												onKeyDown={
													canSort
														? (e) => {
																if (e.key === 'Enter' || e.key === ' ') {
																	e.preventDefault()
																	header.column.getToggleSortingHandler()?.(e)
																}
															}
														: undefined
												}
												tabIndex={canSort ? 0 : undefined}
												role="columnheader"
												aria-sort={
													isSorted === 'asc'
														? 'ascending'
														: isSorted === 'desc'
															? 'descending'
															: 'none'
												}
											>
												<div className="flex items-center gap-2">
													{header.isPlaceholder
														? null
														: flexRender(header.column.columnDef.header, header.getContext())}

													{canSort && (
														<span className="text-primary-content/70" aria-hidden="true">
															{isSorted === 'asc' ? (
																<ChevronUp className="h-4 w-4" aria-label="Sorted ascending" />
															) : isSorted === 'desc' ? (
																<ChevronDown className="h-4 w-4" aria-label="Sorted descending" />
															) : (
																<ChevronsUpDown className="h-4 w-4" aria-label="Not sorted" />
															)}
														</span>
													)}
												</div>
											</th>
										)
									})}
								</tr>
							))}
						</thead>

						<tbody>
							{isLoading ? (
								<tr>
									<td 
										colSpan={Math.max(1, columns.length)} 
										className="px-3 py-12 text-center sm:px-6" 
										role="status" 
										aria-live="polite"
									>
										<span className="loading loading-spinner loading-lg text-primary" aria-label="Loading data" />
									</td>
								</tr>
							) : table.getRowModel().rows.length === 0 ? (
								<tr>
									<td
										colSpan={Math.max(1, columns.length)}
										className="px-3 py-12 text-center text-sm font-semibold uppercase tracking-[0.3em] text-base-content/60 sm:px-6 sm:text-base"
										role="status"
										aria-live="polite"
									>
										{emptyMessage}
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="hover transition-colors"
										role="row"
									>
										{row.getVisibleCells().map((cell, cellIndex) => (
											<td
												key={cell.id}
												className="px-3 py-3 text-sm text-base-content sm:px-6 sm:py-4 sm:text-base"
												role="gridcell"
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination Controls - Mobile-first responsive */}
			{enablePagination && pagination && onPaginationChange && pagination.pageSize > 0 && totalItems > 0 && (
				<div className="flex flex-col gap-3 rounded-[28px] border border-base-300 bg-base-200/70 p-4 shadow-lg sm:gap-4 sm:p-6">
					{/* Results Summary - Mobile-first using centralized calculation */}
					<div className="text-xs font-semibold uppercase tracking-[0.3em] text-base-content/70 sm:text-sm">
						{(() => {
							const range = calculatePaginationRange(pagination, totalItems)
							return (
								<>
									Showing{' '}
									<span className="font-bold text-primary">{range.start}</span>
									{' - '}
									<span className="font-bold text-primary">{range.end}</span>
									{' of '}
									<span className="font-bold text-primary">{totalItems}</span>
								</>
							)
						})()}
					</div>

					{/* Pagination Controls - Mobile-first flex layout */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						{/* Navigation Buttons - Mobile-first wrap */}
						<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
							{/* DRY: Single array for all pagination buttons */}
							{paginationButtons.map(({ label, action, disabled, ariaLabel }) => (
								<button
									key={label}
									type="button"
									className="btn btn-sm btn-ghost inline-flex min-h-[36px] items-center rounded-full border border-base-300 px-3 text-xs font-semibold uppercase tracking-[0.3em] transition hover:-translate-y-0.5 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
									onClick={() => onPaginationChange(action())}
									disabled={disabled}
									aria-label={ariaLabel}
								>
									{label}
								</button>
							))}

							{/* Page Number Display */}
							<span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary sm:text-sm">
								Page {pagination.pageIndex + 1} of{' '}
								{pageCount !== undefined 
									? pageCount 
									: Math.ceil(totalItems / pagination.pageSize) || 0}
							</span>
						</div>

						{/* Page Size Selector - Mobile-first */}
						{enablePageSize && (
							<div className="flex items-center justify-center gap-2 sm:justify-end">
								<label
									htmlFor="page-size-select"
									className="text-xs font-semibold uppercase tracking-[0.3em] text-primary sm:text-sm"
								>
									Show
								</label>
								<select
									id="page-size-select"
									className="select select-bordered select-sm min-h-[36px] rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:select-primary sm:px-4"
									value={pagination.pageSize}
									onChange={(e) => {
										const newPageSize = Number(e.target.value)
										// Input validation: ensure valid page size using utility
										if (!isValidPageSize(newPageSize)) {
											logger.warn('Invalid page size attempted', {
												value: e.target.value,
												component: COMPONENT_NAME,
											})
											return
										}
										
										onPaginationChange({
											...pagination,
											pageSize: newPageSize,
											pageIndex: 0,
										})
										logger.debug('Table page size changed', {
											pageSize: newPageSize,
											component: COMPONENT_NAME,
										})
									}}
									aria-label="Items per page"
								>
									{DEFAULT_PAGE_SIZE_OPTIONS.map((size) => (
										<option key={size} value={size}>
											{size}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}


