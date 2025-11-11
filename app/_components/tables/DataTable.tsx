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

interface DataTableProps<TData> {
	columns: ColumnDef<TData>[]
	data: TData[]
	pageCount?: number
	pagination?: PaginationState
	onPaginationChange?: (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void
	sorting?: SortingState
	onSortingChange?: (updater: SortingState | ((old: SortingState) => SortingState)) => void
	isLoading?: boolean
	manualPagination?: boolean
	manualSorting?: boolean
	emptyMessage?: string | ReactNode
}

/**
 * Generic DataTable component with TanStack Table
 * Supports both client-side and server-side pagination/sorting
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
	const table = useReactTable({
		data,
		columns,
		pageCount,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange,
		onSortingChange,
		getCoreRowModel: getCoreRowModel(),
		manualPagination,
		manualSorting,
	})

	return (
		<div className="w-full">
			{/* Table */}
			<div className="overflow-x-auto">
				<table className="table table-zebra w-full">
					{/* Header */}
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className={classNames({
											'cursor-pointer select-none hover:bg-base-300':
												header.column.getCanSort(),
										})}
										onClick={header.column.getToggleSortingHandler()}
									>
										<div className="flex items-center gap-2">
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
											{header.column.getCanSort() && (
												<span className="text-base-content/50">
													{header.column.getIsSorted() === 'asc' ? (
														<ChevronUp className="w-4 h-4" />
													) : header.column.getIsSorted() === 'desc' ? (
														<ChevronDown className="w-4 h-4" />
													) : (
														<ChevronsUpDown className="w-4 h-4" />
													)}
												</span>
											)}
										</div>
									</th>
								))}
							</tr>
						))}
					</thead>

					{/* Body */}
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={columns.length} className="text-center py-8">
									<span className="loading loading-spinner loading-lg text-primary"></span>
								</td>
							</tr>
						) : table.getRowModel().rows.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="text-center py-8 text-base-content/60">
									{emptyMessage}
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr key={row.id} className="hover">
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{pagination && onPaginationChange && (
				<div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
					{/* Page info */}
					<div className="text-sm text-base-content/70">
						Showing{' '}
						{pagination.pageIndex * pagination.pageSize + 1} to{' '}
						{Math.min((pagination.pageIndex + 1) * pagination.pageSize, pageCount ? pageCount * pagination.pageSize : data.length)}{' '}
						{pageCount && `of ${pageCount * pagination.pageSize}`}
					</div>

					{/* Pagination controls */}
					<div className="flex items-center gap-2">
						<button
							className="btn btn-sm"
							onClick={() =>
								onPaginationChange({
									...pagination,
									pageIndex: 0,
								})
							}
							disabled={!table.getCanPreviousPage()}
						>
							First
						</button>
						<button
							className="btn btn-sm"
							onClick={() =>
								onPaginationChange({
									...pagination,
									pageIndex: pagination.pageIndex - 1,
								})
							}
							disabled={!table.getCanPreviousPage()}
						>
							Previous
						</button>
						<span className="text-sm">
							Page {pagination.pageIndex + 1} of {pageCount || 1}
						</span>
						<button
							className="btn btn-sm"
							onClick={() =>
								onPaginationChange({
									...pagination,
									pageIndex: pagination.pageIndex + 1,
								})
							}
							disabled={!table.getCanNextPage()}
						>
							Next
						</button>
						<button
							className="btn btn-sm"
							onClick={() =>
								onPaginationChange({
									...pagination,
									pageIndex: (pageCount || 1) - 1,
								})
							}
							disabled={!table.getCanNextPage()}
						>
							Last
						</button>
					</div>

					{/* Page size selector */}
					<select
						className="select select-sm select-bordered"
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
								Show {size}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	)
}


