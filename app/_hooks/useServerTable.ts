'use client'

import { useState, useEffect, useCallback } from 'react'
import {
	PaginationState,
	SortingState,
	ColumnFiltersState,
} from '@tanstack/react-table'

interface ServerTableOptions {
	initialPageSize?: number
	initialPage?: number
}

interface PagedResult<T> {
	data: T[]
	page: number
	pageSize: number
	total: number
	totalPages: number
	hasNext: boolean
	hasPrevious: boolean
}

/**
 * Hook for managing server-side table state with TanStack Table
 * Handles pagination, sorting, and filtering
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
	const { initialPageSize = 10, initialPage = 0 } = options

	// Table state
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: initialPage,
		pageSize: initialPageSize,
	})
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	// Data state
	const [data, setData] = useState<T[]>([])
	const [pageCount, setPageCount] = useState(0)
	const [totalItems, setTotalItems] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	// Fetch data when state changes
	const loadData = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			// Convert 0-based page index to 1-based for backend
			const result = await fetchData({
				page: pagination.pageIndex + 1,
				pageSize: pagination.pageSize,
				sorting,
				filters: columnFilters,
			})

			setData(result.data)
			setPageCount(result.totalPages)
			setTotalItems(result.total)
		} catch (err) {
			setError(err as Error)
			console.error('Error loading table data:', err)
		} finally {
			setIsLoading(false)
		}
	}, [pagination, sorting, columnFilters, fetchData])

	useEffect(() => {
		loadData()
	}, [loadData])

	// Refresh function to manually reload data
	const refresh = useCallback(() => {
		loadData()
	}, [loadData])

	return {
		// Data
		data,
		pageCount,
		totalItems,
		isLoading,
		error,

		// State
		pagination,
		setPagination,
		sorting,
		setSorting,
		columnFilters,
		setColumnFilters,

		// Actions
		refresh,
	}
}


