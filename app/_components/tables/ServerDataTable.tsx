'use client'

import { ReactNode, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from './DataTable'
import { useServerTable } from '@_hooks/useServerTable'
import { createServerTableFetcher } from '@_utils/table-helpers'

interface ServerDataTableProps<TData> {
	columns: ColumnDef<TData>[]
	fetchData?: (params: {
		page: number
		pageSize: number
		sorting?: any
		filters?: any
	}) => Promise<{
		data: TData[]
		page: number
		pageSize: number
		total: number
		totalPages: number
		hasNext: boolean
		hasPrevious: boolean
	}>
	endpoint?: string
	initialPageSize?: number
	initialSortBy?: string
	initialSortOrder?: 'asc' | 'desc'
	filters?: Record<string, any>
	emptyMessage?: string | ReactNode
}

/**
 * Server-side DataTable component
 * Automatically handles server-side pagination, sorting, and filtering
 * Supports both direct fetchData function and endpoint-based fetching
 */
export default function ServerDataTable<TData>({
	columns,
	fetchData: propFetchData,
	endpoint,
	initialPageSize = 10,
	initialSortBy,
	initialSortOrder,
	filters,
	emptyMessage,
}: ServerDataTableProps<TData>) {
	// Create fetch function from endpoint if provided
	const fetchData = useMemo(() => {
		if (propFetchData) return propFetchData
		if (endpoint) return createServerTableFetcher<TData>(endpoint, filters)
		throw new Error('ServerDataTable requires either fetchData or endpoint prop')
	}, [propFetchData, endpoint, filters])
	const {
		data,
		pageCount,
		isLoading,
		pagination,
		setPagination,
		sorting,
		setSorting,
	} = useServerTable(fetchData, { initialPageSize })

	return (
		<DataTable
			columns={columns}
			data={data}
			pageCount={pageCount}
			pagination={pagination}
			onPaginationChange={setPagination}
			sorting={sorting}
			onSortingChange={setSorting}
			isLoading={isLoading}
			manualPagination
			manualSorting
			emptyMessage={emptyMessage}
		/>
	)
}


