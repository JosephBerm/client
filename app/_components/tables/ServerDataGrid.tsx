/**
 * Server-Side Data Grid Component
 * 
 * High-level wrapper around DataGrid that automatically handles server-side pagination,
 * sorting, and filtering. Drop-in replacement for ServerDataTable with enhanced features.
 * 
 * **Features:**
 * - Automatic server-side data fetching
 * - Supports custom fetch function or endpoint-based fetching
 * - TanStack Table v8 integration
 * - Server-side pagination with page count
 * - Server-side sorting
 * - Server-side filtering
 * - Loading states
 * - Empty state customization
 * - Initial sort and page size configuration
 * - Custom filters support
 * - Feature toggles: enableSorting, enableFiltering, enablePagination, enablePageSize
 * - **NEW**: Virtualization for large datasets (>100 rows)
 * - **NEW**: Mobile card views
 * - **NEW**: Enhanced accessibility (WCAG AA)
 * 
 * **Use Cases:**
 * - Large datasets (100+ records) - benefits from virtualization
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
 * import ServerDataGrid from '@_components/tables/ServerDataGrid';
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
 * ];
 * 
 * // Basic usage with endpoint (drop-in replacement for ServerDataTable)
 * <ServerDataGrid
 *   endpoint="/api/products/search"
 *   columns={columns}
 *   initialPageSize={20}
 *   ariaLabel="Products grid"
 * />
 * 
 * // With filters
 * <ServerDataGrid
 *   endpoint="/api/products/search"
 *   columns={columns}
 *   filters={{ category: 'medical', inStock: true }}
 *   initialSortBy="name"
 *   initialSortOrder="asc"
 *   ariaLabel="Filtered products"
 * />
 * ```
 * 
 * @module ServerDataGrid
 */

'use client'

import { ReactNode, useMemo } from 'react'
import { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { DataGrid } from './DataGrid/DataGrid'
import { createServerTableFetcher, useServerTable } from '@_shared'

/**
 * ServerDataGrid component props interface.
 * 
 * Identical API to ServerDataTable for easy migration.
 * 
 * @template TData - The type of data items in the table rows
 */
interface ServerDataGridProps<TData> {
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
		sorting?: SortingState
		/** TanStack Table column filters state */
		filters?: ColumnFiltersState
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
	
	/** 
	 * Enable/disable column sorting feature.
	 * When false, sorting UI and handlers are disabled.
	 * @default true
	 */
	enableSorting?: boolean
	
	/** 
	 * Enable/disable column filtering feature.
	 * When false, filtering UI and handlers are disabled.
	 * @default true
	 */
	enableFiltering?: boolean
	
	/** 
	 * Enable/disable pagination controls.
	 * When false, pagination UI is hidden.
	 * @default true
	 */
	enablePagination?: boolean
	
	/** 
	 * Enable/disable page size selector.
	 * When false, page size selector is hidden.
	 * @default true
	 */
	enablePageSize?: boolean

	/**
	 * ARIA label for the table (required for accessibility).
	 * Should be descriptive of the table's content.
	 */
	ariaLabel: string
}

/**
 * ServerDataGrid Component
 * 
 * Wrapper component that combines useServerTable hook with DataGrid component
 * to provide a complete server-side data grid solution with enhanced features.
 * 
 * **How It Works:**
 * 1. Uses useServerTable hook to manage server-side state
 * 2. Automatically fetches data when pagination/sorting changes
 * 3. Forwards all state to DataGrid for rendering
 * 4. Converts between endpoint string and fetch function
 * 5. Auto-enables virtualization for large datasets
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
 * - Loading states handled by DataGrid
 * 
 * **Migration from ServerDataTable:**
 * Simply change the import and add `ariaLabel` prop:
 * 
 * ```tsx
 * // Before
 * import ServerDataTable from '@_components/tables/ServerDataTable'
 * <ServerDataTable endpoint="/api/orders" columns={columns} />
 * 
 * // After
 * import ServerDataGrid from '@_components/tables/ServerDataGrid'
 * <ServerDataGrid endpoint="/api/orders" columns={columns} ariaLabel="Orders grid" />
 * ```
 * 
 * @template TData - Type of data items in the table
 * @param props - Component props including columns, fetchData/endpoint, and options
 * @returns ServerDataGrid component
 */
export default function ServerDataGrid<TData>({
	columns,
	fetchData: propFetchData,
	endpoint,
	initialPageSize = 10,
	initialSortBy,
	initialSortOrder,
	filters,
	emptyMessage,
	enableSorting = true,
	enableFiltering = true,
	enablePagination = true,
	enablePageSize = true,
	ariaLabel,
}: ServerDataGridProps<TData>) {
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
		throw new Error('ServerDataGrid requires either fetchData or endpoint prop')
	}, [propFetchData, endpoint, filters])

	/**
	 * Use server table hook to manage pagination, sorting, filtering, and data fetching.
	 * Hook handles all server communication and state management.
	 */
	const {
		data,            // Current page data
		pageCount,       // Total pages available
		totalItems,      // Total items across all pages
		isLoading,       // Loading indicator
		error,           // Error state
		pagination,      // Current pagination state (pageIndex, pageSize)
		setPagination,   // Update pagination function
		sorting,         // Current sorting state
		setSorting,      // Update sorting function
		columnFilters,   // Current filter state
		setColumnFilters, // Update filter function
	} = useServerTable(fetchData, { 
		initialPageSize,
		initialSortBy,
		initialSortOrder: initialSortOrder || 'asc',
	})

	/**
	 * Render DataGrid with server-side data and state.
	 * DataGrid handles UI rendering, table structure, and user interactions.
	 * All features are enabled by default but can be toggled with boolean props.
	 * Virtualization is auto-enabled for datasets > 100 rows.
	 */
	return (
		<DataGrid
			columns={columns}
			data={data}
			ariaLabel={ariaLabel}
			pageCount={pageCount}
			totalItems={totalItems}
			pagination={pagination}
			onPaginationChange={setPagination}
			sorting={sorting}
			onSortingChange={setSorting}
			columnFilters={columnFilters}
			onColumnFiltersChange={setColumnFilters}
			isLoading={isLoading}
			error={error}
			manualPagination // Server handles pagination
			manualSorting    // Server handles sorting
			manualFiltering  // Server handles filtering
			enableSorting={enableSorting}
			enableFiltering={enableFiltering}
			enablePagination={enablePagination}
			enablePageSize={enablePageSize}
			enableVirtualization={true} // Auto-enabled for server-side tables
			emptyMessage={emptyMessage}
		/>
	)
}

