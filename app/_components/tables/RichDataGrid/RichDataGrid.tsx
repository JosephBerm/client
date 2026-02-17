/**
 * RichDataGrid - Enterprise-Grade Data Grid Component
 *
 * MAANG-level data grid with comprehensive features:
 * - Server-side pagination, sorting, filtering
 * - Global search with debounce
 * - Row selection with bulk actions
 * - Column visibility toggle
 * - State persistence
 * - Full keyboard accessibility
 *
 * Built on TanStack Table v8 with custom hooks and components.
 *
 * @example
 * ```tsx
 * <RichDataGrid<Product>
 *   endpoint="/products/search"
 *   columns={columns}
 *   ariaLabel="Products"
 *   enableGlobalSearch
 *   enableRowSelection
 *   enableColumnVisibility
 *   bulkActions={[
 *     { id: 'delete', label: 'Delete', variant: 'danger', onAction: handleDelete },
 *   ]}
 *   persistStateKey="products-grid"
 * />
 * ```
 *
 * @module RichDataGrid
 */

'use client'

import { useEffect } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, FileText } from 'lucide-react'

import Button from '@_components/ui/Button'

import { useRichDataGrid, type UseRichDataGridOptions } from './hooks/useRichDataGrid'
import { RichDataGridProvider } from './context/RichDataGridContext'
import { RichDataGridToolbar } from './components/Toolbar/RichDataGridToolbar'
import { RichDataGridHeader } from './components/Table/RichDataGridHeader'
import { RichDataGridBody } from './components/Table/RichDataGridBody'
import { VirtualizedBody } from './components/Table/VirtualizedBody'
import { RichDataGridPagination } from './components/Table/RichDataGridPagination'
import { SelectionStatusBar } from './components/Selection/SelectionStatusBar'
import { SelectAllCheckbox } from './components/Selection/SelectAllCheckbox'
import { RowSelectionCheckbox } from './components/Selection/RowSelectionCheckbox'
import { type RichColumnDef, type BulkAction, type RowId, type VirtualizationConfig, LoadingState } from './types'

// ============================================================================
// COLUMN HELPER - Creates selection column
// ============================================================================

/**
 * Creates a selection checkbox column definition.
 * Automatically added when enableRowSelection is true.
 *
 * Size is set to 52px to accommodate the 44px touch target
 * plus padding per mobile-first accessibility best practices.
 */
function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
	return {
		id: '_selection',
		header: () => <SelectAllCheckbox />,
		cell: ({ row }) => <RowSelectionCheckbox row={row} />,
		size: 52, // 44px touch target + 8px padding
		minSize: 44, // Minimum touch target per WCAG
		maxSize: 60,
		enableSorting: false,
		enableHiding: false,
		enableResizing: false,
	}
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
	return (
		<tbody>
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<tr
					key={rowIndex}
					className='border-b border-base-200/50 dark:border-base-content/10'>
					{Array.from({ length: columns }).map((_, colIndex) => (
						<td
							key={colIndex}
							className='px-3 py-2.5 sm:px-4 sm:py-3'>
							<div
								className='h-4 bg-base-300 dark:bg-base-content/10 rounded animate-pulse'
								style={{
									width: `${60 + Math.random() * 30}%`,
									animationDelay: `${rowIndex * 50}ms`,
								}}
							/>
						</td>
					))}
				</tr>
			))}
		</tbody>
	)
}

// ============================================================================
// PROPS
// ============================================================================

/**
 * Grid API exposed via onGridReady callback.
 * Provides programmatic access to grid operations.
 */
export interface RichDataGridApi<TData> {
	/** Update a single row optimistically */
	updateRow: (rowId: string | number, updater: (row: TData) => TData) => void
	/** Update multiple rows that match a predicate */
	updateRows: (predicate: (row: TData) => boolean, updater: (row: TData) => TData) => void
	/** Remove a row optimistically */
	removeRow: (rowId: string | number) => void
	/** Trigger a data refresh */
	refresh: () => void
	/** Clear all row selections */
	clearSelection: () => void
}

export interface RichDataGridProps<TData extends { id?: string | number | null }>
	extends Omit<UseRichDataGridOptions<TData>, 'columns'> {
	/** Column definitions */
	columns: RichColumnDef<TData, unknown>[]
	/** ARIA label for accessibility */
	ariaLabel: string
	/** Bulk actions for selected rows */
	bulkActions?: BulkAction<TData>[]
	/** Row click handler */
	onRowClick?: (row: TData) => void
	/** Row double-click handler */
	onRowDoubleClick?: (row: TData) => void
	/** Custom row class getter */
	getRowClassName?: (row: TData) => string
	/** Show toolbar */
	showToolbar?: boolean
	/** Show pagination */
	showPagination?: boolean
	/** Search placeholder */
	searchPlaceholder?: string
	/** Custom loading component */
	loadingComponent?: React.ReactNode
	/** Custom empty state */
	emptyState?: React.ReactNode
	/** Custom error state renderer */
	errorState?: (error: Error, retry: () => void) => React.ReactNode
	/** Additional container CSS classes */
	className?: string
	/** Enable row virtualization for large datasets (default: false) */
	enableVirtualization?: boolean
	/** Virtualization configuration (only used when enableVirtualization is true) */
	virtualizationConfig?: Partial<VirtualizationConfig>
	/**
	 * Callback fired when the grid is ready with its API.
	 * Use this to get programmatic access to grid operations like optimistic updates.
	 *
	 * @example
	 * const gridApiRef = useRef<RichDataGridApi<Notification>>(null)
	 *
	 * <RichDataGrid
	 *   onGridReady={(api) => { gridApiRef.current = api }}
	 *   ...
	 * />
	 *
	 * // Later, use optimistic updates:
	 * gridApiRef.current?.updateRow(notification.id, (row) => ({ ...row, read: true }))
	 */
	onGridReady?: (api: RichDataGridApi<TData>) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RichDataGrid component - Enterprise-grade data grid.
 *
 * @template TData - Row data type (must have id property, can be null for unsaved entities)
 */
export function RichDataGrid<TData extends { id?: string | number | null }>({
	// Data props
	endpoint,
	data,
	columns,
	fetcher,
	getRowId,
	filterKey,
	// Feature flags
	enableGlobalSearch = true,
	enableColumnFilters = false,
	enableRowSelection = false,
	enableColumnResizing = false,
	enableColumnPinning = false,
	enableVirtualization = false,
	// Config
	persistStateKey,
	defaultPageSize = 10,
	defaultSorting,
	defaultColumnVisibility,
	searchDebounceMs,
	virtualizationConfig,
	// UI props
	ariaLabel,
	bulkActions = [],
	onRowClick,
	onRowDoubleClick,
	getRowClassName,
	showToolbar = true,
	showPagination = true,
	searchPlaceholder = 'Search...',
	loadingComponent,
	emptyState,
	errorState,
	className = '',
	onGridReady,
}: RichDataGridProps<TData>) {
	// Prepare columns with selection column if needed
	const preparedColumns = enableRowSelection
		? [createSelectionColumn<TData>(), ...(columns as ColumnDef<TData, unknown>[])]
		: (columns as ColumnDef<TData, unknown>[])

	// Initialize the master hook
	const gridState = useRichDataGrid<TData>({
		endpoint,
		data,
		columns: preparedColumns as RichColumnDef<TData, unknown>[],
		fetcher,
		getRowId,
		filterKey,
		enableGlobalSearch,
		enableColumnFilters,
		enableRowSelection,
		enableColumnResizing,
		enableColumnPinning,
		persistStateKey,
		defaultPageSize,
		defaultSorting,
		defaultColumnVisibility,
		searchDebounceMs,
	})

	const { loadingState, error, refresh, table, updateRow, updateRows, removeRow, clearSelection } = gridState

	// Call onGridReady callback with the grid API
	// Using useEffect to ensure this is called after the grid is initialized
	useEffect(() => {
		if (onGridReady) {
			onGridReady({
				updateRow,
				updateRows,
				removeRow,
				refresh,
				clearSelection,
			})
		}
	}, [onGridReady, updateRow, updateRows, removeRow, refresh, clearSelection])

	// Render error state
	if (loadingState === LoadingState.Error && error) {
		if (errorState) {
			return <div className={className}>{errorState(error, refresh)}</div>
		}

		return (
			<div className={`border border-error/20 rounded-lg p-8 text-center ${className}`}>
				<div className='text-error mb-4'>
					<AlertTriangle className='h-12 w-12 mx-auto' />
				</div>
				<h3 className='text-lg font-semibold text-error mb-2'>Failed to load data</h3>
				<p className='text-sm text-base-content/60 mb-4'>{error.message}</p>
				<Button
					type='button'
					onClick={refresh}
					variant='error'
					size='sm'>
					Try Again
				</Button>
			</div>
		)
	}

	return (
		<RichDataGridProvider value={gridState}>
			<div
				className={`
					bg-base-100 border border-base-300 dark:border-base-content/10
					rounded-lg overflow-hidden shadow-sm
					${className}
				`}
				role='region'
				aria-label={ariaLabel}>
				{/* Toolbar */}
				{showToolbar && (
					<RichDataGridToolbar
						showSearch={enableGlobalSearch}
						searchPlaceholder={searchPlaceholder}
						showColumnVisibility
						showRefresh={!!endpoint || !!fetcher}
						bulkActions={bulkActions}
					/>
				)}

				{/* Table Container - Mobile-first horizontal scroll */}
				<div className='overflow-x-auto -webkit-overflow-scrolling-touch relative'>
					{/* Virtualized Mode - Uses div-based virtualization */}
					{enableVirtualization ? (
						<>
							{/* Header as standalone table for virtualized mode */}
							<table className='table w-full min-w-[320px]'>
								<RichDataGridHeader
									enableColumnFilters={enableColumnFilters}
									enableColumnResizing={enableColumnResizing}
									enableColumnPinning={enableColumnPinning}
								/>
							</table>

							{/* Loading State */}
							{loadingState === LoadingState.Loading || loadingState === LoadingState.Idle ? (
								loadingComponent ? (
									<div className='p-4'>{loadingComponent}</div>
								) : (
									<table className='table w-full min-w-[320px]'>
										<LoadingSkeleton
											rows={defaultPageSize}
											columns={preparedColumns.length}
										/>
									</table>
								)
							) : (
								<VirtualizedBody
									onRowClick={onRowClick}
									onRowDoubleClick={onRowDoubleClick}
									getRowClassName={getRowClassName}
									emptyState={emptyState}
									virtualizationConfig={virtualizationConfig}
									enableRowSelection={enableRowSelection}
								/>
							)}
						</>
					) : (
						/* Standard Table Mode - Traditional table rendering */
						<table className='table w-full min-w-[320px]'>
							<RichDataGridHeader
								enableColumnFilters={enableColumnFilters}
								enableColumnResizing={enableColumnResizing}
								enableColumnPinning={enableColumnPinning}
							/>

							{/* Loading State - Show skeleton during initial load or when idle with no data */}
							{loadingState === LoadingState.Loading || loadingState === LoadingState.Idle ? (
								loadingComponent ? (
									<tbody>
										<tr>
											<td colSpan={table.getVisibleLeafColumns().length}>{loadingComponent}</td>
										</tr>
									</tbody>
								) : (
									<LoadingSkeleton
										rows={defaultPageSize}
										columns={preparedColumns.length}
									/>
								)
							) : (
								<RichDataGridBody
									onRowClick={onRowClick}
									onRowDoubleClick={onRowDoubleClick}
									getRowClassName={getRowClassName}
									emptyState={emptyState}
									enableColumnPinning={enableColumnPinning}
									enableRowSelection={enableRowSelection}
								/>
							)}
						</table>
					)}

					{/* Loading Overlay for Refreshing - shows spinner over existing data */}
					{loadingState === LoadingState.Refreshing && (
						<div className='absolute inset-0 bg-base-100/50 dark:bg-base-100/70 backdrop-blur-sm flex items-center justify-center'>
							<span className='loading loading-spinner loading-lg text-primary' />
						</div>
					)}
				</div>

				{/* Selection Status Bar */}
				{enableRowSelection && <SelectionStatusBar />}

				{/* Pagination */}
				{showPagination && <RichDataGridPagination />}
			</div>
		</RichDataGridProvider>
	)
}

export default RichDataGrid
