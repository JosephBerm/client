/**
 * useRichDataGrid - Master Hook for RichDataGrid
 *
 * Comprehensive hook that composes all RichDataGrid functionality:
 * - Server-side data fetching with pagination
 * - Global search with debounce
 * - Column filters
 * - Row selection
 * - Column visibility
 * - Export functionality
 *
 * Following TanStack Table official patterns and MAANG best practices.
 *
 * ## React 19 / Next.js 16 Patterns
 *
 * This hook follows React 19 best practices:
 * - Single useEffect with AbortController for data fetching (per React docs)
 * - Proper cleanup to prevent race conditions in Strict Mode
 * - React Compiler auto-memoization via `"use memo"` directive
 *
 * @see https://react.dev/reference/react/useEffect#fetching-data-with-effects
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 *
 * @module useRichDataGrid
 */

'use client'
'use memo'

import { useState, useEffect, useRef, useReducer } from 'react'

import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	type ColumnDef,
	type SortingState,
	type ColumnFiltersState,
	type VisibilityState,
	type RowSelectionState,
	type PaginationState,
	type ColumnPinningState,
} from '@tanstack/react-table'

import { logger } from '@_core'

import { useDebounce } from '@_shared/hooks/useDebounce'

import {
	type RichColumnDef,
	type RichSearchFilter,
	type RichPagedResult,
	type UseRichDataGridReturn,
	type SortDescriptor,
	type ExportOptions,
	type ColumnId,
	type ColumnFilterValue,
	type BackendColumnFilter,
	type ColumnFilterOptions,
	type SelectFilterValue,
	LoadingState,
	SortDirection,
	FilterType,
	TextFilterOperator,
	SelectFilterOperator,
	isSelectFilter,
	DEFAULT_SEARCH_DEBOUNCE_MS,
	createRowId,
} from '../types'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for useRichDataGrid hook.
 */
export interface UseRichDataGridOptions<TData> {
	/** API endpoint for data fetching (server-side mode) */
	endpoint?: string
	/** Static data array (client-side mode) */
	data?: TData[]
	/** Column definitions */
	columns: RichColumnDef<TData, unknown>[]
	/** Unique key for state persistence */
	persistStateKey?: string
	/** Default page size */
	defaultPageSize?: number
	/** Default sorting */
	defaultSorting?: SortDescriptor[]
	/** Default column visibility */
	defaultColumnVisibility?: VisibilityState
	/** Enable global search */
	enableGlobalSearch?: boolean
	/** Enable column filters */
	enableColumnFilters?: boolean
	/** Enable row selection */
	enableRowSelection?: boolean
	/** Enable column resizing */
	enableColumnResizing?: boolean
	/** Column resize mode: 'onChange' for live preview, 'onEnd' for final value only */
	columnResizeMode?: 'onChange' | 'onEnd'
	/** Enable column pinning */
	enableColumnPinning?: boolean
	/** Default column pinning state */
	defaultColumnPinning?: ColumnPinningState
	/** Debounce delay for search (ms) */
	searchDebounceMs?: number
	/** Custom fetcher function (overrides endpoint) */
	fetcher?: (filter: RichSearchFilter) => Promise<RichPagedResult<TData>>
	/** Row ID accessor */
	getRowId?: (row: TData) => string
	/**
	 * External filter key - changes to this value trigger a re-fetch.
	 * Use this when your fetcher depends on external state (filters, toggles, etc.)
	 * that the grid doesn't know about.
	 *
	 * @example
	 * // Re-fetch when category or archived filter changes
	 * filterKey={`${selectedCategoryId}-${showArchived}`}
	 */
	filterKey?: string
}

/**
 * Server fetch function type.
 */
type ServerFetcher<TData> = (filter: RichSearchFilter) => Promise<RichPagedResult<TData>>

// ============================================================================
// DEFAULT FETCHER
// ============================================================================

/**
 * Default fetcher using endpoint.
 */
async function defaultFetcher<TData>(endpoint: string, filter: RichSearchFilter): Promise<RichPagedResult<TData>> {
	const headers = new Headers()
	headers.set('Content-Type', 'application/json')

	const response = await fetch(endpoint, {
		method: 'POST',
		headers,
		body: JSON.stringify(filter),
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
	}

	return response.json()
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Master hook for RichDataGrid.
 * Composes all table functionality into a single, cohesive API.
 *
 * @template TData - Row data type (must have id property, can be null for unsaved entities)
 */
export function useRichDataGrid<TData extends { id?: string | number | null }>({
	endpoint,
	data: staticData,
	columns,
	persistStateKey,
	defaultPageSize = 10,
	defaultSorting = [],
	defaultColumnVisibility = {},
	enableGlobalSearch = true,
	enableColumnFilters = true,
	enableRowSelection = true,
	enableColumnResizing = false,
	columnResizeMode = 'onChange',
	enableColumnPinning = false,
	defaultColumnPinning = { left: [], right: [] },
	searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
	fetcher,
	getRowId = (row) => String(row.id),
	filterKey,
}: UseRichDataGridOptions<TData>): UseRichDataGridReturn<TData> {
	// Determine mode: server-side or client-side
	const isServerSide = !!endpoint || !!fetcher

	// Store fetcher in ref to maintain stable reference across renders
	// This prevents infinite loops when fetcher prop changes reference but not behavior
	const fetcherRef = useRef(fetcher)
	fetcherRef.current = fetcher

	// Track fetch sequence to ignore stale responses (belt-and-suspenders with AbortController)
	const fetchIdRef = useRef(0)

	// Refresh trigger - incrementing this forces a re-fetch
	const [refreshTrigger, forceRefresh] = useReducer((x: number) => x + 1, 0)

	// ========================================================================
	// STATE MANAGEMENT
	// ========================================================================

	// Loading state
	const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Idle)
	const [error, setError] = useState<Error | null>(null)

	// Server data
	const [serverData, setServerData] = useState<TData[]>([])
	const [totalItems, setTotalItems] = useState(0)
	const [pageCount, setPageCount] = useState(0)
	const [facets, setFacets] = useState<RichPagedResult<TData>['facets']>(undefined)

	// Global search with debounce
	const [globalFilter, setGlobalFilter] = useState('')
	const debouncedGlobalFilter = useDebounce(globalFilter, searchDebounceMs)

	// Column filters
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	// Row selection
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	// Column visibility
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility)

	// Sorting
	const [sorting, setSorting] = useState<SortingState>(
		defaultSorting.map((s) => ({
			id: s.columnId as string,
			desc: s.direction === SortDirection.Descending,
		}))
	)

	// Pagination
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: defaultPageSize,
	})

	// Column pinning
	const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(defaultColumnPinning)

	// ========================================================================
	// PERSISTENCE (localStorage)
	// ========================================================================

	// Load persisted state on mount
	useEffect(() => {
		if (!persistStateKey) {
			return
		}

		try {
			const saved = localStorage.getItem(`richDataGrid_${persistStateKey}`)
			if (saved) {
				const parsed = JSON.parse(saved)
				if (parsed.columnVisibility) {
					setColumnVisibility(parsed.columnVisibility)
				}
				if (parsed.pageSize) {
					setPagination((prev) => ({ ...prev, pageSize: parsed.pageSize }))
				}
			}
		} catch (err) {
			logger.warn('Failed to load persisted grid state', { key: persistStateKey, error: err })
		}
	}, [persistStateKey])

	// Save state on change
	useEffect(() => {
		if (!persistStateKey) {
			return
		}

		try {
			localStorage.setItem(
				`richDataGrid_${persistStateKey}`,
				JSON.stringify({
					columnVisibility,
					pageSize: pagination.pageSize,
				})
			)
		} catch (err) {
			logger.warn('Failed to save grid state', { key: persistStateKey, error: err })
		}
	}, [persistStateKey, columnVisibility, pagination.pageSize])

	// ========================================================================
	// DATA FETCHING (Server-side)
	// ========================================================================

	/**
	 * Single useEffect for data fetching with AbortController.
	 *
	 * This pattern follows React 19 official documentation for data fetching:
	 * @see https://react.dev/reference/react/useEffect#fetching-data-with-effects
	 *
	 * Key features:
	 * - AbortController prevents race conditions when deps change rapidly
	 * - fetchId prevents stale responses from overwriting fresh data
	 * - Proper cleanup ensures Strict Mode double-execution works correctly
	 * - Single effect (not dual) avoids timing race conditions
	 */
	useEffect(() => {
		if (!isServerSide) {
			return
		}

		// Create AbortController for this fetch cycle
		const abortController = new AbortController()
		const currentFetchId = ++fetchIdRef.current

		// Set loading state
		// Use Loading (shows skeleton) when we don't have data yet
		// Use Refreshing (shows overlay spinner) only when we have existing data
		// This handles React 19 Strict Mode where effect runs twice on mount
		setLoadingState((prev) => {
			// If we're in Idle or Loading state, we don't have data yet - show skeleton
			if (prev === LoadingState.Idle || prev === LoadingState.Loading) {
				return LoadingState.Loading
			}
			// Success or Error state means we had a previous fetch - show refresh overlay
			return LoadingState.Refreshing
		})
		setError(null)

		const fetchData = async () => {
			try {
				// Extract faceted column IDs from column definitions
				// These columns will have their unique values aggregated by the server
				// Note: filterOptions can be in col.meta (runtime) or directly on col (type extension)
				const facetedColumnIds = columns
					.filter((col) => {
						// Check both meta.filterOptions (TanStack convention) and direct filterOptions (our extension)
						const meta = col.meta as { filterOptions?: { faceted?: boolean } } | undefined
						const filterOptions = meta?.filterOptions ?? col.filterOptions
						return filterOptions?.faceted === true
					})
					.map((col) => {
						// TanStack columns can have accessorKey or id
						const accessorKey = (col as { accessorKey?: string }).accessorKey
						return accessorKey ?? col.id
					})
					.filter((id): id is string => typeof id === 'string')

				// Build helper to look up column filter options by column ID
				const getColumnFilterOptions = (columnId: string): ColumnFilterOptions<TData> | undefined => {
					const col = columns.find((c) => {
						const accessorKey = (c as { accessorKey?: string }).accessorKey
						return (accessorKey ?? c.id) === columnId
					})
					if (!col) return undefined
					const meta = col.meta as { filterOptions?: ColumnFilterOptions<TData> } | undefined
					return meta?.filterOptions ?? col.filterOptions
				}

				// Separate faceted Select filters from regular column filters
				// Faceted filters go to facetFilters, others go to columnFilters
				const backendColumnFilters: BackendColumnFilter[] = []
				const facetFilterValues: Record<string, string[]> = {}

				for (const cf of columnFilters) {
					const filterValue = cf.value as ColumnFilterValue | undefined
					if (!filterValue) continue

					const filterOptions = getColumnFilterOptions(cf.id)
					const isFaceted = filterOptions?.faceted === true

					// Handle Select filters with faceted=true via facetFilters
					if (filterValue && isSelectFilter(filterValue) && isFaceted) {
						const selectValue = filterValue as SelectFilterValue
						if (selectValue.values.length > 0) {
							facetFilterValues[cf.id] = selectValue.values
						}
						continue
					}

					// Handle typed filters for columnFilters
					if (filterValue && typeof filterValue === 'object' && 'filterType' in filterValue) {
						const typedFilter = filterValue as ColumnFilterValue
						backendColumnFilters.push({
							columnId: cf.id,
							filterType: typedFilter.filterType,
							operator:
								'operator' in typedFilter ? String(typedFilter.operator) : TextFilterOperator.Contains,
							value: 'value' in typedFilter ? typedFilter.value : undefined,
							valueTo: 'valueTo' in typedFilter ? typedFilter.valueTo : undefined,
							values: 'values' in typedFilter ? typedFilter.values : undefined,
						})
						continue
					}

					// Fallback: treat as simple text filter (legacy support)
					backendColumnFilters.push({
						columnId: cf.id,
						filterType: FilterType.Text,
						operator: TextFilterOperator.Contains,
						value: cf.value,
					})
				}

				// Build filter object
				const filter: RichSearchFilter = {
					page: pagination.pageIndex + 1, // Convert 0-based to 1-based
					pageSize: pagination.pageSize,
					sorting: sorting.map((s) => ({
						columnId: s.id as ColumnId,
						direction: s.desc ? SortDirection.Descending : SortDirection.Ascending,
					})),
					globalSearch: debouncedGlobalFilter || undefined,
					columnFilters: backendColumnFilters,
					// Request facet aggregation for columns marked as faceted
					facetColumns: facetedColumnIds.length > 0 ? facetedColumnIds : undefined,
					// Send faceted Select filter selections
					facetFilters: Object.keys(facetFilterValues).length > 0 ? facetFilterValues : undefined,
				}

				// Use custom fetcher or default endpoint fetcher
				const fetchFn: ServerFetcher<TData> =
					fetcherRef.current ??
					(async (f) => {
						if (!endpoint) {
							throw new Error('Endpoint is required when no fetcher is provided')
						}
						return defaultFetcher(endpoint, f)
					})

				const result = await fetchFn(filter)

				// Guard: Only update state if this is still the current fetch
				// This prevents stale responses from overwriting fresh data
				if (abortController.signal.aborted || currentFetchId !== fetchIdRef.current) {
					return
				}

				// Update all state atomically (React 18+ batches these)
				setServerData(result.data)
				setTotalItems(result.total)
				setPageCount(result.totalPages)
				setFacets(result.facets)
				setLoadingState(LoadingState.Success)
			} catch (err) {
				// Ignore abort errors - these are expected during cleanup
				if (err instanceof Error && err.name === 'AbortError') {
					return
				}

				// Ignore if this fetch was superseded
				if (abortController.signal.aborted || currentFetchId !== fetchIdRef.current) {
					return
				}

				const error = err instanceof Error ? err : new Error('Unknown error')
				setError(error)
				setLoadingState(LoadingState.Error)
				logger.error('RichDataGrid fetch failed', { error, endpoint })
			}
		}

		void fetchData()

		// Cleanup: abort in-flight request when deps change or component unmounts
		// This is the React 19 recommended pattern for preventing race conditions
		return () => {
			abortController.abort()
		}
	}, [
		isServerSide,
		pagination.pageIndex,
		pagination.pageSize,
		sorting,
		debouncedGlobalFilter,
		columnFilters,
		endpoint,
		filterKey, // External filter changes trigger re-fetch
		refreshTrigger, // Allows manual refresh via forceRefresh()
	])

	// ========================================================================
	// TANSTACK TABLE INSTANCE
	// ========================================================================

	// Prepare data source
	// React Compiler automatically memoizes derived values
	const tableData = isServerSide ? serverData : staticData ?? []

	// Calculate page count for client-side mode
	const clientPageCount = !isServerSide && staticData ? Math.ceil(staticData.length / pagination.pageSize) : pageCount

	// Create table instance
	const table = useReactTable({
		data: tableData,
		columns: columns as ColumnDef<TData, unknown>[],
		state: {
			globalFilter: enableGlobalSearch ? debouncedGlobalFilter : undefined,
			columnFilters: enableColumnFilters ? columnFilters : [],
			rowSelection: enableRowSelection ? rowSelection : {},
			columnVisibility,
			sorting,
			pagination,
			columnPinning: enableColumnPinning ? columnPinning : { left: [], right: [] },
		},
		// Mode settings
		manualPagination: isServerSide,
		manualSorting: isServerSide,
		manualFiltering: isServerSide,
		pageCount: isServerSide ? pageCount : clientPageCount,

		// State handlers
		onGlobalFilterChange: enableGlobalSearch ? setGlobalFilter : undefined,
		onColumnFiltersChange: enableColumnFilters ? setColumnFilters : undefined,
		onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		onColumnPinningChange: enableColumnPinning ? setColumnPinning : undefined,

		// Row models
		getCoreRowModel: getCoreRowModel(),
		...(isServerSide
			? {}
			: {
					getPaginationRowModel: getPaginationRowModel(),
					getSortedRowModel: getSortedRowModel(),
					getFilteredRowModel: getFilteredRowModel(),
			  }),

		// Row identification
		getRowId,

		// Selection
		enableRowSelection,

		// Column resizing
		enableColumnResizing,
		columnResizeMode,

		// Column pinning
		enableColumnPinning,
	})

	// ========================================================================
	// DERIVED STATE
	// ========================================================================
	// React Compiler automatically memoizes these derived values

	// Selected rows and IDs
	const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
	const selectedIds = selectedRows.map((row) => createRowId(getRowId(row)))
	const selectedCount = selectedRows.length

	// Active filter count
	const activeFilterCount = columnFilters.length + (debouncedGlobalFilter ? 1 : 0)

	// Column visibility counts
	const visibleColumnCount = table.getVisibleLeafColumns().length
	const hiddenColumnCount = table.getAllLeafColumns().length - visibleColumnCount

	// ========================================================================
	// ACTIONS
	// ========================================================================
	// React Compiler automatically memoizes these action handlers

	const clearColumnFilters = () => {
		setColumnFilters([])
	}

	const setColumnFilter = (columnId: string, value: ColumnFilterValue | null) => {
		setColumnFilters((prev) => {
			// Remove existing filter for this column
			const filtered = prev.filter((f) => f.id !== columnId)
			// If null, just return filtered (removes the filter)
			if (value === null) {
				return filtered
			}
			// Otherwise, add the new filter
			return [...filtered, { id: columnId, value }]
		})
	}

	const getColumnFilter = (columnId: string): ColumnFilterValue | undefined => {
		const filter = columnFilters.find((f) => f.id === columnId)
		return filter?.value as ColumnFilterValue | undefined
	}

	const clearSelection = () => {
		setRowSelection({})
	}

	const selectAll = () => {
		table.toggleAllRowsSelected(true)
	}

	const toggleColumnVisibility = (columnId: ColumnId) => {
		setColumnVisibility((prev) => ({
			...prev,
			[columnId]: !prev[columnId],
		}))
	}

	const refresh = () => {
		if (isServerSide) {
			forceRefresh()
		}
	}

	// Column pinning actions
	const pinColumn = (columnId: string, position: 'left' | 'right' | false) => {
		setColumnPinning((prev) => {
			// Remove from both sides first
			const left = (prev.left ?? []).filter((id) => id !== columnId)
			const right = (prev.right ?? []).filter((id) => id !== columnId)

			// Add to the new position if not false
			if (position === 'left') {
				return { left: [...left, columnId], right }
			} else if (position === 'right') {
				return { left, right: [...right, columnId] }
			}

			// If false, just return with column removed from both
			return { left, right }
		})
	}

	const unpinColumn = (columnId: string) => {
		pinColumn(columnId, false)
	}

	const isPinned = (columnId: string): 'left' | 'right' | false => {
		if (columnPinning.left?.includes(columnId)) return 'left'
		if (columnPinning.right?.includes(columnId)) return 'right'
		return false
	}

	const exportGridData = async (options: ExportOptions): Promise<void> => {
		// Dynamic import to keep export libraries out of the main bundle
		const { exportData: doExport } = await import('../utils/exportUtils')

		logger.info('Export requested', { options })

		const result = await doExport(
			table,
			{
				format: options.format,
				scope: options.scope,
				filename: options.filename ?? 'export',
				includeTimestamp: true,
			},
			selectedRows
		)

		if (!result.success) {
			throw new Error(result.error ?? 'Export failed')
		}

		logger.info('Export completed', { filename: result.filename, rowCount: result.rowCount })
	}

	// ========================================================================
	// OPTIMISTIC UPDATE HELPERS
	// ========================================================================

	/**
	 * Update a single row optimistically.
	 * Immediately updates the UI without waiting for server response.
	 */
	const updateRow = (rowId: string | number, updater: (row: TData) => TData) => {
		const rowIdStr = String(rowId)
		setServerData((prev) => prev.map((row) => (getRowId(row) === rowIdStr ? updater(row) : row)))
	}

	/**
	 * Update multiple rows that match a predicate.
	 */
	const updateRows = (predicate: (row: TData) => boolean, updater: (row: TData) => TData) => {
		setServerData((prev) => prev.map((row) => (predicate(row) ? updater(row) : row)))
	}

	/**
	 * Remove a row optimistically.
	 */
	const removeRow = (rowId: string | number) => {
		const rowIdStr = String(rowId)
		setServerData((prev) => prev.filter((row) => getRowId(row) !== rowIdStr))
		setTotalItems((prev) => Math.max(0, prev - 1))
	}

	// ========================================================================
	// RETURN
	// ========================================================================

	return {
		// Table instance
		table,

		// Data
		data: tableData,
		totalItems: isServerSide ? totalItems : staticData?.length ?? 0,
		facets,

		// Loading state
		loadingState,
		isLoading: loadingState === LoadingState.Loading,
		isRefreshing: loadingState === LoadingState.Refreshing,
		error,

		// Global search
		globalFilter,
		setGlobalFilter,

		// Column filters
		columnFilters,
		setColumnFilters,
		setColumnFilter,
		getColumnFilter,
		clearColumnFilters,
		activeFilterCount,

		// Row selection
		rowSelection,
		selectedRows,
		selectedIds,
		selectedCount,
		setRowSelection,
		clearSelection,
		selectAll,

		// Column visibility
		columnVisibility,
		setColumnVisibility,
		toggleColumnVisibility,
		visibleColumnCount,
		hiddenColumnCount,

		// Pagination
		pagination,
		setPagination,
		pageCount: isServerSide ? pageCount : clientPageCount,
		canPreviousPage: table.getCanPreviousPage(),
		canNextPage: table.getCanNextPage(),

		// Sorting
		sorting,
		setSorting,

		// Column pinning
		columnPinning,
		setColumnPinning,
		pinColumn,
		unpinColumn,
		isPinned,

		// Actions
		refresh,
		exportData: exportGridData,

		// Optimistic updates
		updateRow,
		updateRows,
		removeRow,
	}
}

export default useRichDataGrid
