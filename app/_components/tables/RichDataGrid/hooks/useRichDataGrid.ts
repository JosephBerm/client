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
 * ## React Compiler Optimizations (Next.js 16+)
 *
 * This hook uses the `"use memo"` directive to enable React Compiler
 * automatic memoization. This eliminates the need for manual `useMemo`
 * and `useCallback` calls while maintaining optimal performance.
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @see https://react.dev/learn/react-compiler
 *
 * @module useRichDataGrid
 */

'use client'
'use memo'

import { useState, useEffect, useRef } from 'react'

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
	LoadingState,
	SortDirection,
	FilterType,
	TextFilterOperator,
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
	/** Debounce delay for search (ms) */
	searchDebounceMs?: number
	/** Custom fetcher function (overrides endpoint) */
	fetcher?: (filter: RichSearchFilter) => Promise<RichPagedResult<TData>>
	/** Row ID accessor */
	getRowId?: (row: TData) => string
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
 * @template TData - Row data type (must have id property)
 */
export function useRichDataGrid<TData extends { id?: string | number }>({
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
	searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
	fetcher,
	getRowId = (row) => String(row.id),
}: UseRichDataGridOptions<TData>): UseRichDataGridReturn<TData> {
	// Determine mode: server-side or client-side
	const isServerSide = !!endpoint || !!fetcher

	// Store fetcher in ref to avoid infinite re-fetch loops
	// when fetcher function reference changes but endpoint doesn't
	const fetcherRef = useRef(fetcher)
	fetcherRef.current = fetcher

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
	 * Fetch data from server.
	 *
	 * Note: With React Compiler enabled, this function is automatically
	 * memoized based on its captured dependencies. No manual useCallback needed.
	 *
	 * The fetcherRef pattern is essential (not for memoization) to avoid
	 * infinite loops when the fetcher prop changes reference but not behavior.
	 */
	const fetchServerData = async () => {
		if (!isServerSide) {
			return
		}

		// Use functional update to avoid loadingState in dependencies
		setLoadingState((prev) => prev === LoadingState.Idle ? LoadingState.Loading : LoadingState.Refreshing)
		setError(null)

		try {
			// Build filter object
			const filter: RichSearchFilter = {
				page: pagination.pageIndex + 1, // Convert 0-based to 1-based
				pageSize: pagination.pageSize,
				sorting: sorting.map((s) => ({
					columnId: s.id as ColumnId,
					direction: s.desc ? SortDirection.Descending : SortDirection.Ascending,
				})),
				globalSearch: debouncedGlobalFilter || undefined,
				columnFilters: columnFilters.map((cf) => ({
					columnId: cf.id,
					filterType: FilterType.Text, // Default filter type
					operator: TextFilterOperator.Contains,
					value: cf.value,
				})),
			}

			// Fetch data - use ref to avoid infinite loops from fetcher reference changes
			const fetchFn: ServerFetcher<TData> = fetcherRef.current ?? (async (f) => {
				if (!endpoint) {
					throw new Error('Endpoint is required when no fetcher is provided')
				}
				return defaultFetcher(endpoint, f)
			})
			const result = await fetchFn(filter)

			setServerData(result.data)
			setTotalItems(result.total)
			setPageCount(result.totalPages)
			setFacets(result.facets)
			setLoadingState(LoadingState.Success)
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Unknown error')
			setError(error)
			setLoadingState(LoadingState.Error)
			logger.error('RichDataGrid fetch failed', { error, endpoint })
		}
	}

	// Fetch data on state changes (server-side only)
	// Dependencies listed explicitly since fetchServerData is not wrapped in useCallback
	// React Compiler will optimize this effect automatically
	useEffect(() => {
		if (isServerSide) {
			void fetchServerData()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- React Compiler handles memoization
	}, [
		isServerSide,
		pagination.pageIndex,
		pagination.pageSize,
		sorting,
		debouncedGlobalFilter,
		columnFilters,
		endpoint,
	])

	// ========================================================================
	// TANSTACK TABLE INSTANCE
	// ========================================================================

	// Prepare data source
	// React Compiler automatically memoizes derived values
	const tableData = isServerSide ? serverData : (staticData ?? [])

	// Calculate page count for client-side mode
	const clientPageCount = (!isServerSide && staticData)
		? Math.ceil(staticData.length / pagination.pageSize)
		: pageCount

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
			void fetchServerData()
		}
	}

	const exportData = async (options: ExportOptions): Promise<void> => {
		// TODO: Implement export functionality
		logger.info('Export requested', { options })
		await Promise.resolve() // Placeholder for future async operations
		throw new Error('Export not yet implemented')
	}

	// ========================================================================
	// RETURN
	// ========================================================================

	return {
		// Table instance
		table,

		// Data
		data: tableData,
		totalItems: isServerSide ? totalItems : (staticData?.length ?? 0),
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

		// Actions
		refresh,
		exportData,
	}
}

export default useRichDataGrid

