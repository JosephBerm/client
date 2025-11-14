/**
 * Server-Side Table Hook for TanStack Table v8
 * 
 * Manages server-side pagination, sorting, and filtering for large datasets.
 * Automatically fetches data when pagination, sorting, or filters change.
 * Converts between 0-based (TanStack Table) and 1-based (backend) page indexing.
 * 
 * **Use Cases:**
 * - Large datasets that require server-side pagination
 * - Tables with sorting and filtering from the backend
 * - Real-time data tables with refresh functionality
 * 
 * @module useServerTable
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
	PaginationState,
	SortingState,
	ColumnFiltersState,
} from '@tanstack/react-table'
import { logger } from '@_core'

/**
 * Configuration options for the server table hook.
 */
interface ServerTableOptions {
	/** Initial number of items per page (default: 10) */
	initialPageSize?: number
	/** Initial page index, 0-based (default: 0) */
	initialPage?: number
	/** Initial sort column and direction */
	initialSortBy?: string
	/** Initial sort order ('asc' or 'desc') */
	initialSortOrder?: 'asc' | 'desc'
}

/**
 * Standard paged result structure returned from the server.
 * Matches the backend PagedResult<T> format.
 * 
 * @template T - The type of data items in the result
 */
interface PagedResult<T> {
	/** Array of data items for the current page */
	data: T[]
	/** Current page number (1-based from backend) */
	page: number
	/** Number of items per page */
	pageSize: number
	/** Total number of items across all pages */
	total: number
	/** Total number of pages available */
	totalPages: number
	/** Whether there is a next page */
	hasNext: boolean
	/** Whether there is a previous page */
	hasPrevious: boolean
}

/**
 * Custom hook for managing server-side table data with TanStack Table.
 * Handles all aspects of server-side data fetching including pagination,
 * sorting, and filtering with automatic refetch on state changes.
 * 
 * **Features:**
 * - Automatic data fetching when state changes
 * - Loading and error states
 * - Manual refresh functionality
 * - Page index conversion (0-based ↔ 1-based)
 * - TypeScript type safety
 * 
 * @template T - The type of data items in the table
 * 
 * @param {Function} fetchData - Async function that fetches paginated data from the server
 * @param {Object} params - Parameters passed to fetchData
 * @param {number} params.page - Page number (1-based for backend)
 * @param {number} params.pageSize - Number of items per page
 * @param {SortingState} params.sorting - TanStack Table sorting state
 * @param {ColumnFiltersState} params.filters - TanStack Table filter state
 * @param {ServerTableOptions} options - Configuration options
 * 
 * @returns {Object} Object containing table data, state, and control functions
 * @returns {T[]} returns.data - Array of data items for current page
 * @returns {number} returns.pageCount - Total number of pages
 * @returns {number} returns.totalItems - Total number of items across all pages
 * @returns {boolean} returns.isLoading - True while fetching data
 * @returns {Error|null} returns.error - Error object if fetch failed
 * @returns {PaginationState} returns.pagination - Current pagination state
 * @returns {Function} returns.setPagination - Function to update pagination
 * @returns {SortingState} returns.sorting - Current sorting state
 * @returns {Function} returns.setSorting - Function to update sorting
 * @returns {ColumnFiltersState} returns.columnFilters - Current filter state
 * @returns {Function} returns.setColumnFilters - Function to update filters
 * @returns {Function} returns.refresh - Function to manually reload data
 * 
 * @example
 * ```typescript
 * // Basic usage with endpoint-based fetcher
 * const {
 *   data,
 *   pageCount,
 *   isLoading,
 *   pagination,
 *   setPagination,
 *   sorting,
 *   setSorting
 * } = useServerTable(
 *   async ({ page, pageSize, sorting }) => {
 *     const response = await fetch(`/api/users?page=${page}&pageSize=${pageSize}`);
 *     return response.json();
 *   },
 *   { initialPageSize: 20 }
 * );
 * 
 * // Use with TanStack Table
 * const table = useReactTable({
 *   data,
 *   columns,
 *   pageCount,
 *   state: { pagination, sorting },
 *   onPaginationChange: setPagination,
 *   onSortingChange: setSorting,
 *   manualPagination: true,
 *   manualSorting: true
 * });
 * 
 * // Manual refresh after an action
 * const handleDelete = async (id) => {
 *   await deleteUser(id);
 *   refresh(); // Reload table data
 * };
 * ```
 */
export function useServerTable<T>(
	fetchData: (params: {
		page: number
		pageSize: number
		sorting?: SortingState
		filters?: ColumnFiltersState
	}) => Promise<PagedResult<T>>,
	options: ServerTableOptions = {}
) {
	// Extract options with defaults
	const { initialPageSize = 10, initialPage = 0, initialSortBy, initialSortOrder } = options

	// Initialize pagination state (0-based indexing for TanStack Table)
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: initialPage,
		pageSize: initialPageSize,
	})
	
	// Initialize sorting state (can start with a default sort if provided)
	const [sorting, setSorting] = useState<SortingState>(
		initialSortBy ? [{ id: initialSortBy, desc: initialSortOrder === 'desc' }] : []
	)
	
	// Initialize column filters state (empty by default)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	// Data state management
	const [data, setData] = useState<T[]>([])           // Current page data
	const [pageCount, setPageCount] = useState(0)        // Total pages available
	const [totalItems, setTotalItems] = useState(0)      // Total items across all pages
	const [isLoading, setIsLoading] = useState(false)    // Loading indicator
	const [error, setError] = useState<Error | null>(null) // Error state

	/**
	 * Internal function to fetch data from the server.
	 * Automatically called when pagination, sorting, or filters change.
	 * Converts 0-based page index (TanStack) to 1-based (backend).
	 */
	const loadData = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			// Convert 0-based page index to 1-based for backend
			// TanStack Table: pageIndex 0 = first page
			// Backend: page 1 = first page
			const result = await fetchData({
				page: pagination.pageIndex + 1,
				pageSize: pagination.pageSize,
				sorting,
				filters: columnFilters,
			})

			// Update state with fetched data
			setData(result.data)
			setPageCount(result.totalPages)
			setTotalItems(result.total)
		} catch (err) {
			// Handle fetch errors
			const error = err as Error
			setError(error)
			logger.error('Table data fetch failed', {
				error,
				page: pagination.pageIndex + 1,
				pageSize: pagination.pageSize,
				sorting,
				filters: columnFilters,
			})
		} finally {
			// Always reset loading state
			setIsLoading(false)
		}
	}, [pagination, sorting, columnFilters, fetchData])

	// Automatically fetch data when state changes
	useEffect(() => {
		loadData()
	}, [loadData])

	/**
	 * Manual refresh function to reload current page data.
	 * Useful after create/update/delete operations.
	 */
	const refresh = useCallback(() => {
		loadData()
	}, [loadData])

	return {
		// Data and metadata
		data,         // Current page data items
		pageCount,    // Total number of pages
		totalItems,   // Total items across all pages
		isLoading,    // Loading indicator
		error,        // Error object if fetch failed

		// State management (pass to TanStack Table)
		pagination,
		setPagination,
		sorting,
		setSorting,
		columnFilters,
		setColumnFilters,

		// Actions
		refresh,      // Manual reload function
	}
}


