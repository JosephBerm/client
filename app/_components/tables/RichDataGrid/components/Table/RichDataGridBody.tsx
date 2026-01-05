/**
 * RichDataGridBody - Table Body Component
 *
 * Renders table rows with row click support and range selection.
 * Following TanStack Table patterns and WCAG accessibility guidelines.
 *
 * @module RichDataGridBody
 */

'use client'
'use memo'

import { flexRender, type Row } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { useRichDataGridContext, useRichDataGridPinning, useRichDataGridSelection } from '../../context/RichDataGridContext'
import { useRangeSelection } from '../../hooks/useRangeSelection'

// ============================================================================
// PROPS
// ============================================================================

export interface RichDataGridBodyProps<TData> {
	/** Row click handler */
	onRowClick?: (row: TData) => void
	/** Row double-click handler */
	onRowDoubleClick?: (row: TData) => void
	/** Custom row class getter */
	getRowClassName?: (row: TData) => string
	/** Custom empty state component */
	emptyState?: React.ReactNode
	/** Enable column pinning */
	enableColumnPinning?: boolean
	/** Enable row selection (enables Shift+Click and Ctrl/Cmd+Click) */
	enableRowSelection?: boolean
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Table body component with row rendering.
 *
 * @example
 * <RichDataGridBody
 *   onRowClick={(row) => console.log('Clicked:', row)}
 * />
 */
export function RichDataGridBody<TData>({
	onRowClick,
	onRowDoubleClick,
	getRowClassName,
	emptyState,
	enableColumnPinning = false,
	enableRowSelection = false,
	className = '',
}: RichDataGridBodyProps<TData>) {
	const { table, isLoading } = useRichDataGridContext<TData>()
	const { isPinned } = useRichDataGridPinning()
	const { rowSelection, setRowSelection } = useRichDataGridSelection()

	const rows = table.getRowModel().rows

	// Range selection hook for Shift+Click and Ctrl/Cmd+Click functionality
	const { handleRowClick: handleRangeRowClick, handleRowKeyDown } = useRangeSelection({
		rows,
		rowSelection,
		setRowSelection,
	})

	// Empty state - use custom emptyState if provided, otherwise show default
	if (!isLoading && rows.length === 0) {
		return (
			<tbody className={className}>
				<tr>
					<td
						colSpan={table.getVisibleLeafColumns().length}
						className="px-4 py-8 sm:py-12 text-center text-base-content/60 dark:text-base-content/50"
					>
						{emptyState ?? (
							<div className="flex flex-col items-center gap-2 sm:gap-3">
								<FileText className="h-10 w-10 sm:h-12 sm:w-12 text-base-content/30 dark:text-base-content/20" strokeWidth={1} />
								<p className="text-xs sm:text-sm">No data available</p>
							</div>
						)}
					</td>
				</tr>
			</tbody>
		)
	}

	/**
	 * Handle row click with range selection support.
	 * Delegates to range selection hook when row selection is enabled.
	 */
	const handleRowClick = (rowIndex: number, event: React.MouseEvent, rowData: TData) => {
		// Always call custom onRowClick if provided
		onRowClick?.(rowData)

		// Handle range selection for Shift+Click and Ctrl/Cmd+Click
		if (enableRowSelection) {
			handleRangeRowClick(rowIndex, event)
		}
	}

	/**
	 * Handle row keyboard events for accessibility.
	 * Space/Enter toggles selection, Shift+Space/Enter does range select.
	 */
	const handleKeyDown = (rowIndex: number, event: React.KeyboardEvent) => {
		if (enableRowSelection) {
			handleRowKeyDown(rowIndex, event)
		}
	}

	return (
		<tbody className={className} role="rowgroup">
			{rows.map((row: Row<TData>, rowIndex: number) => {
				const isSelected = row.getIsSelected()
				const customClass = getRowClassName ? getRowClassName(row.original) : ''

				return (
					<tr
						key={row.id}
						role="row"
						tabIndex={enableRowSelection ? 0 : undefined}
						aria-selected={enableRowSelection ? isSelected : undefined}
						onClick={(e) => handleRowClick(rowIndex, e, row.original)}
						onDoubleClick={() => onRowDoubleClick?.(row.original)}
						onKeyDown={(e) => handleKeyDown(rowIndex, e)}
						className={`
							border-b border-base-200/50 dark:border-base-content/10
							${isSelected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-base-200/30 dark:hover:bg-base-content/5'}
							${onRowClick || onRowDoubleClick || enableRowSelection ? 'cursor-pointer active:bg-base-200/50 dark:active:bg-base-content/10' : ''}
							${enableRowSelection ? 'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset' : ''}
							transition-colors
							${customClass}
						`}
						data-selected={isSelected}
					>
						{row.getVisibleCells().map((cell) => {
							// Column pinning
							const pinned = enableColumnPinning ? isPinned(cell.column.id) : false
							const pinnedStyles = pinned ? {
								position: 'sticky' as const,
								left: pinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
								right: pinned === 'right' ? `${cell.column.getStart('right')}px` : undefined,
								zIndex: 1,
							} : {}

							return (
								<td
									key={cell.id}
									role="cell"
									className={`
										px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-base-content dark:text-base-content/90
										${pinned ? 'bg-base-100 dark:bg-base-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}
									`}
									style={{ width: cell.column.getSize(), ...pinnedStyles }}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							)
						})}
					</tr>
				)
			})}
		</tbody>
	)
}

export default RichDataGridBody

