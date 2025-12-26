/**
 * RichDataGridBody - Table Body Component
 *
 * Renders table rows with row click support.
 * Following TanStack Table patterns.
 *
 * @module RichDataGridBody
 */

'use client'

import { flexRender, type Row } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { useRichDataGridContext } from '../../context/RichDataGridContext'

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
	className = '',
}: RichDataGridBodyProps<TData>) {
	const { table, isLoading } = useRichDataGridContext<TData>()

	const rows = table.getRowModel().rows

	// Empty state
	if (!isLoading && rows.length === 0) {
		return (
			<tbody className={className}>
				<tr>
					<td
						colSpan={table.getVisibleLeafColumns().length}
						className="px-4 py-8 sm:py-12 text-center text-base-content/60 dark:text-base-content/50"
					>
						<div className="flex flex-col items-center gap-2 sm:gap-3">
							<FileText className="h-10 w-10 sm:h-12 sm:w-12 text-base-content/30 dark:text-base-content/20" strokeWidth={1} />
							<p className="text-xs sm:text-sm">No data available</p>
						</div>
					</td>
				</tr>
			</tbody>
		)
	}

	return (
		<tbody className={className}>
			{rows.map((row: Row<TData>) => {
				const isSelected = row.getIsSelected()
				const customClass = getRowClassName ? getRowClassName(row.original) : ''

				return (
					<tr
						key={row.id}
						onClick={() => onRowClick?.(row.original)}
						onDoubleClick={() => onRowDoubleClick?.(row.original)}
						className={`
							border-b border-base-200/50 dark:border-base-content/10
							${isSelected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-base-200/30 dark:hover:bg-base-content/5'}
							${onRowClick || onRowDoubleClick ? 'cursor-pointer active:bg-base-200/50 dark:active:bg-base-content/10' : ''}
							transition-colors
							${customClass}
						`}
						data-selected={isSelected}
					>
						{row.getVisibleCells().map((cell) => (
							<td
								key={cell.id}
								className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-base-content dark:text-base-content/90"
								style={{ width: cell.column.getSize() }}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				)
			})}
		</tbody>
	)
}

export default RichDataGridBody

