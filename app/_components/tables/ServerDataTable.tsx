/**
 * Server-Side Data Table Component
 * 
 * High-level wrapper around DataTable that automatically handles server-side pagination,
 * sorting, and filtering. Simplifies implementation by managing useServerTable hook
 * internally and forwarding all table state to the DataTable component.
 * 
 * **Features:**
 * - Automatic server-side data fetching
 * - Supports custom fetch function or endpoint-based fetching
 * - TanStack Table v8 integration
 * - Server-side pagination with page count
 * - Server-side sorting
 * - Loading states
 * - Empty state customization
 * - Initial sort and page size configuration
 * - Custom filters support
 * 
 * **Use Cases:**
 * - Large datasets (1000+ records)
 * - Backend-paginated APIs
 * - Search and filter operations on server
 * - Real-time data tables
 * 
 * **Two Usage Patterns:**
 * 1. **Endpoint-based** (recommended): Provide `endpoint` string, uses createServerTableFetcher
 * 2. **Custom fetch function**: Provide `fetchData` function for custom logic
 * 
 * @example
 * ```tsx
 * import ServerDataTable from '@_components/tables/ServerDataTable';
 * import { ColumnDef } from '@tanstack/react-table';
 * import { Product } from '@_classes/Product';
 * 
 * // Define columns
 * const columns: ColumnDef<Product>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: 'Product Name',
 *   },
 *   {
 *     accessorKey: 'price',
 *     header: 'Price',
 *     cell: ({ getValue }) => `$${getValue()}`,
 *   },
 *   {
 *     accessorKey: 'stock',
 *     header: 'Stock',
 *   },
 * ];
 * 
 * // Basic usage with endpoint
 * <ServerDataTable
 *   endpoint="/api/products/search"
 *   columns={columns}
 *   initialPageSize={20}
 * />
 * 
 * // With filters
 * <ServerDataTable
 *   endpoint="/api/products/search"
 *   columns={columns}
 *   filters={{ category: 'medical', inStock: true }}
 *   initialSortBy="name"
 *   initialSortOrder="asc"
 * />
 * 
 * // With custom fetch function
 * <ServerDataTable
 *   fetchData={async ({ page, pageSize, sorting, filters }) => {
 *     const response = await API.Products.search({
 *       page,
 *       pageSize,
 *       sortBy: sorting?.[0]?.id,
 *       sortOrder: sorting?.[0]?.desc ? 'desc' : 'asc',
 *       filters,
 *     });
 *     return response.data.payload;
 *   }}
 *   columns={columns}
 *   emptyMessage="No products found"
 * />
 * 
 * // Orders table with status filter
 * <ServerDataTable
 *   endpoint="/api/orders/search"
 *   columns={orderColumns}
 *   filters={{ status: selectedStatus }}
 *   initialPageSize={10}
 *   initialSortBy="createdAt"
 *   initialSortOrder="desc"
 * />
 * ```
 * 
 * @module ServerDataTable
 */

'use client'

import { ReactNode, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import DataTable from './DataTable'
import { useServerTable } from '@_hooks/useServerTable'
import { createServerTableFetcher } from '@_utils/table-helpers'

/**
 * ServerDataTable component props interface.
 * 
 * @template TData - The type of data items in the table rows
 */
interface ServerDataTableProps<TData> {
	/** 
	 * TanStack Table column definitions.
	 * Defines table structure, headers, cells, and sorting configuration.
	 */
	columns: ColumnDef<TData>[]
	
	/** 
	 * Custom fetch function for server data.
	 * Use this for complex fetch logic or API client methods.
	 * Mutually exclusive with `endpoint`.
	 */
	fetchData?: (params: {
		/** Current page number (1-based for backend) */
		page: number
		/** Number of items per page */
		pageSize: number
		/** TanStack Table sorting state */
		sorting?: any
		/** Custom filters object */
		filters?: any
	}) => Promise<{
		/** Array of data items for current page */
		data: TData[]
		/** Current page number */
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
	}>
	
	/** 
	 * Backend API endpoint for automatic fetching.
	 * Creates fetch function using createServerTableFetcher.
	 * Mutually exclusive with `fetchData`.
	 */
	endpoint?: string
	
	/** 
	 * Initial number of items per page.
	 * @default 10
	 */
	initialPageSize?: number
	
	/** 
	 * Initial column to sort by (column accessor key).
	 */
	initialSortBy?: string
	
	/** 
	 * Initial sort direction.
	 * @default 'asc'
	 */
	initialSortOrder?: 'asc' | 'desc'
	
	/** 
	 * Custom filters to send with each request.
	 * Object is sent to backend as part of search filter.
	 */
	filters?: Record<string, any>
	
	/** 
	 * Message/component to display when table is empty.
	 * @default 'No data available'
	 */
	emptyMessage?: string | ReactNode
}

/**
 * ServerDataTable Component
 * 
 * Wrapper component that combines useServerTable hook with DataTable component
 * to provide a complete server-side data table solution. Handles all server
 * communication and state management internally.
 * 
 * **How It Works:**
 * 1. Uses useServerTable hook to manage server-side state
 * 2. Automatically fetches data when pagination/sorting changes
 * 3. Forwards all state to DataTable for rendering
 * 4. Converts between endpoint string and fetch function
 * 
 * **Endpoint Mode:**
 * - Provide `endpoint` string (e.g., "/api/products/search")
 * - Automatically creates fetch function with createServerTableFetcher
 * - Includes filters in each request
 * 
 * **Custom Fetch Mode:**
 * - Provide `fetchData` function
 * - Full control over API calls and data transformation
 * - Must return PagedResult structure
 * 
 * **Error Handling:**
 * - Throws error if neither `endpoint` nor `fetchData` is provided
 * - Loading states handled by DataTable
 * 
 * @template TData - Type of data items in the table
 * @param props - Component props including columns, fetchData/endpoint, and options
 * @returns ServerDataTable component
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
	/**
	 * Create fetch function from endpoint if provided, otherwise use propFetchData.
	 * Memoized to prevent unnecessary recreations on re-renders.
	 * Throws error if neither is provided.
	 */
	const fetchData = useMemo(() => {
		// Use custom fetch function if provided
		if (propFetchData) return propFetchData
		
		// Create fetch function from endpoint if provided
		if (endpoint) return createServerTableFetcher<TData>(endpoint, filters)
		
		// Error: must provide either fetchData or endpoint
		throw new Error('ServerDataTable requires either fetchData or endpoint prop')
	}, [propFetchData, endpoint, filters])
	
	/**
	 * Use server table hook to manage pagination, sorting, and data fetching.
	 * Hook handles all server communication and state management.
	 */
	const {
		data,         // Current page data
		pageCount,    // Total pages available
		isLoading,    // Loading indicator
		pagination,   // Current pagination state (pageIndex, pageSize)
		setPagination, // Update pagination function
		sorting,      // Current sorting state
		setSorting,   // Update sorting function
	} = useServerTable(fetchData, { initialPageSize })

	/**
	 * Render DataTable with server-side data and state.
	 * DataTable handles UI rendering, table structure, and user interactions.
	 */
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
			manualPagination // Server handles pagination
			manualSorting    // Server handles sorting
			emptyMessage={emptyMessage}
		/>
	)
}


