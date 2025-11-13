/**
 * Data Table Component
 * 
 * Generic, reusable data table component built on TanStack Table v8.
 * Supports both client-side and server-side pagination, sorting, filtering,
 * loading states, and empty states. Styled with DaisyUI for consistent theming.
 * 
 * **Features:**
 * - Client-side AND server-side pagination
 * - Sortable columns with visual indicators
 * - Loading spinner during data fetch
 * - Empty state with custom message
 * - Zebra striping (alternating row colors)
 * - Responsive overflow scrolling
 * - Page size selector (10, 20, 30, 40, 50)
 * - First/Previous/Next/Last navigation
 * - Page number display
 * - Hover states on rows
 * - Lucide icon sorting indicators
 * 
 * **Modes:**
 * 1. **Client-Side**: Pass data array, table handles pagination/sorting
 * 2. **Server-Side**: Pass data + pagination state, parent handles data fetching
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
 * // Define columns
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: 'Name',
 *   },
 *   {
 *     accessorKey: 'email',
 *     header: 'Email',
 *   },
 *   {
 *     accessorKey: 'role',
 *     header: 'Role',
 *     cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
 *   },
 *   {
 *     id: 'actions',
 *     header: 'Actions',
 *     cell: ({ row }) => (
 *       <Button size="sm" onClick={() => handleEdit(row.original)}>
 *         Edit
 *       </Button>
 *     ),
 *   },
 * ];
 * 
 * // Client-side pagination (automatic)
 * <DataTable
 *   columns={columns}
 *   data={allUsers}
 *   pagination={{ pageIndex: 0, pageSize: 10 }}
 *   onPaginationChange={setPagination}
 * />
 * 
 * // Server-side pagination (manual)
 * <DataTable
 *   columns={columns}
 *   data={currentPageData}
 *   pageCount={totalPages}
 *   pagination={pagination}
 *   onPaginationChange={setPagination}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 *   isLoading={isLoading}
 *   manualPagination
 *   manualSorting
 * />
 * 
 * // With custom empty message
 * <DataTable
 *   columns={columns}
 *   data={filteredData}
 *   emptyMessage={
 *     <div className="text-center">
 *       <p>No users found matching your search</p>
 *       <Button onClick={handleReset}>Reset Filters</Button>
 *     </div>
 *   }
 * />
 * ```
 * 
 * @module DataTable
 */

'use client'

import { ReactNode } from 'react'
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	ColumnDef,
	PaginationState,
	SortingState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import classNames from 'classnames'

/**
 * DataTable component props interface.
 * 
 * @template TData - The type of data items in the table rows
 */
interface DataTableProps<TData> {
	/** 
	 * TanStack Table column definitions.
	 * Defines table structure, headers, cells, sorting, and rendering.
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
	 * Whether table is currently loading data.
	 * Shows loading spinner in table body.
	 * @default false
	 */
	isLoading?: boolean
	
	/** 
	 * Enable manual (server-side) pagination.
	 * When true, table doesn't handle pagination - parent component does.
	 * @default false
	 */
	manualPagination?: boolean
	
	/** 
	 * Enable manual (server-side) sorting.
	 * When true, table doesn't sort data - parent component does.
	 * @default false
	 */
	manualSorting?: boolean
	
	/** 
	 * Message or component to display when table is empty.
	 * @default 'No data available'
	 */
	emptyMessage?: string | ReactNode
}

/**
 * DataTable Component
 * 
 * Flexible table component for displaying tabular data with pagination and sorting.
 * Built on TanStack Table v8 for powerful data management and DaisyUI for styling.
 * 
 * **Table Structure:**
 * 1. Header row with sortable columns
 * 2. Body rows with zebra striping
 * 3. Pagination controls (if pagination prop provided)
 * 
 * **Sorting:**
 * - Click column header to toggle sort
 * - Visual indicators: unsorted (⇅), ascending (↑), descending (↓)
 * - Supports single column sorting
 * 
 * **Pagination:**
 * - First/Previous/Next/Last buttons
 * - Page number display
 * - Page size selector (10, 20, 30, 40, 50)
 * - Shows current range (e.g., "Showing 1 to 10 of 50")
 * 
 * **States:**
 * - **Loading**: Shows spinner, hides data
 * - **Empty**: Shows custom message when no data
 * - **Data**: Shows table with rows
 * 
 * **Client vs Server Mode:**
 * - **Client**: Pass all data, table handles pagination/sorting
 * - **Server**: Pass current page data, use manualPagination/manualSorting
 * 
 * @template TData - Type of data items in the table
 * @param props - Component props including columns, data, pagination, etc.
 * @returns DataTable component
 */
export default function DataTable<TData>({
	columns,
	data,
	pageCount,
	pagination,
	onPaginationChange,
	sorting,
	onSortingChange,
	isLoading = false,
	manualPagination = false,
	manualSorting = false,
	emptyMessage = 'No data available',
}: DataTableProps<TData>) {
	/**
	 * Initialize TanStack Table instance with configuration.
	 * Handles all table logic including pagination, sorting, and rendering.
	 */
	const table = useReactTable({
		data,                    // Data array to display
		columns,                 // Column definitions
		pageCount,               // Total pages (server-side)
		state: {
			pagination,          // Current pagination state
			sorting,             // Current sorting state
		},
		onPaginationChange,      // Pagination change handler
		onSortingChange,         // Sorting change handler
		getCoreRowModel: getCoreRowModel(), // Required: builds row model
		manualPagination,        // Whether pagination is handled externally
		manualSorting,           // Whether sorting is handled externally
	})

	return (
		<div className="flex w-full flex-col gap-6">
			<div className="overflow-hidden rounded-[32px] border border-base-300 bg-base-100 shadow-xl">
				<div className="relative overflow-x-auto">
					<table className="table table-zebra min-w-full">
						<thead className="bg-primary text-primary-content">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th
											key={header.id}
											className={classNames(
											'px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.3em]',
											{
												'cursor-pointer select-none transition hover:bg-primary-focus':
													header.column.getCanSort(),
											}
											)}
											onClick={header.column.getToggleSortingHandler()}
										>
											<div className="flex items-center gap-2">
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}

												{header.column.getCanSort() && (
													<span className="text-primary-content/70">
														{header.column.getIsSorted() === 'asc' ? (
															<ChevronUp className="h-4 w-4" />
														) : header.column.getIsSorted() === 'desc' ? (
															<ChevronDown className="h-4 w-4" />
														) : (
															<ChevronsUpDown className="h-4 w-4" />
														)}
													</span>
												)}
											</div>
										</th>
									))}
								</tr>
							))}
						</thead>

					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={columns.length} className="px-6 py-12 text-center">
									<span className="loading loading-spinner loading-lg text-primary" />
								</td>
							</tr>
						) : table.getRowModel().rows.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-12 text-center text-base font-semibold uppercase tracking-[0.3em] text-base-content/60"
								>
									{emptyMessage}
									</td>
								</tr>
							) : (
								table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="hover"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-6 py-4 text-base text-base-content">
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

		{pagination && onPaginationChange && (
			<div className="flex flex-col gap-4 rounded-[28px] border border-base-300 bg-base-200/70 px-6 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
				<div className="text-sm font-semibold uppercase tracking-[0.3em] text-base-content/70">
						Showing{' '}
						{pagination.pageIndex * pagination.pageSize + 1}-
						{Math.min(
							(pagination.pageIndex + 1) * pagination.pageSize,
							manualPagination && pageCount ? pageCount * pagination.pageSize : data.length
						)}{' '}
						{pageCount ? `of ${pageCount * pagination.pageSize}` : `of ${data.length}`}
					</div>

					<div className="flex flex-wrap items-center gap-3">
						{[
							{ label: 'First', action: () => ({ ...pagination, pageIndex: 0 }), disabled: !table.getCanPreviousPage() },
							{
								label: 'Previous',
								action: () => ({ ...pagination, pageIndex: Math.max(pagination.pageIndex - 1, 0) }),
								disabled: !table.getCanPreviousPage(),
							},
						].map(({ label, action, disabled }) => (
							<button
								key={label}
								className="btn btn-sm btn-ghost inline-flex h-9 items-center rounded-full border border-base-300 px-4 text-xs font-semibold uppercase tracking-[0.3em] transition hover:-translate-y-0.5 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
								onClick={() => onPaginationChange(action())}
								disabled={disabled}
							>
								{label}
							</button>
						))}

					<span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
						Page {pagination.pageIndex + 1} of {pageCount || Math.max(1, Math.ceil(data.length / pagination.pageSize))}
					</span>

						{[
							{
								label: 'Next',
								action: () => ({ ...pagination, pageIndex: pagination.pageIndex + 1 }),
								disabled: !table.getCanNextPage(),
							},
							{
								label: 'Last',
								action: () => ({
									...pagination,
									pageIndex: Math.max((pageCount || Math.ceil(data.length / pagination.pageSize)) - 1, 0),
								}),
								disabled: !table.getCanNextPage(),
							},
						].map(({ label, action, disabled }) => (
							<button
								key={label}
								className="btn btn-sm btn-ghost inline-flex h-9 items-center rounded-full border border-base-300 px-4 text-xs font-semibold uppercase tracking-[0.3em] transition hover:-translate-y-0.5 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
								onClick={() => onPaginationChange(action())}
								disabled={disabled}
							>
								{label}
							</button>
						))}
					</div>

				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Show</span>
					<select
						className="select select-bordered select-sm rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
						value={pagination.pageSize}
							onChange={(e) =>
								onPaginationChange({
									...pagination,
									pageSize: Number(e.target.value),
									pageIndex: 0,
								})
							}
						>
							{[10, 20, 30, 40, 50].map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
					</div>
				</div>
			)}
		</div>
	)
}


