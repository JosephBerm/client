/**
 * VirtualizedBody - Virtualized Table Body Component
 *
 * Uses @tanstack/react-virtual for efficient rendering of large datasets.
 * Only renders rows that are visible in the viewport plus overscan.
 *
 * Following TanStack Virtual best practices and React 19 patterns.
 *
 * @module VirtualizedBody
 */

'use client'
'use memo'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { flexRender, type Row } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { useRichDataGridContext } from '../../context/RichDataGridContext'
import { type VirtualizationConfig, DEFAULT_VIRTUALIZATION_CONFIG } from '../../types'

// ============================================================================
// PROPS
// ============================================================================

export interface VirtualizedBodyProps<TData> {
	/** Row click handler */
	onRowClick?: (row: TData) => void
	/** Row double-click handler */
	onRowDoubleClick?: (row: TData) => void
	/** Custom row class getter */
	getRowClassName?: (row: TData) => string
	/** Custom empty state component */
	emptyState?: React.ReactNode
	/** Virtualization configuration */
	virtualizationConfig?: Partial<VirtualizationConfig>
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Virtualized table body component.
 * Renders only visible rows for optimal performance with large datasets.
 *
 * @example
 * <VirtualizedBody
 *   onRowClick={(row) => console.log('Clicked:', row)}
 *   virtualizationConfig={{ estimatedRowHeight: 56, overscan: 10 }}
 * />
 */
export function VirtualizedBody<TData>({
	onRowClick,
	onRowDoubleClick,
	getRowClassName,
	emptyState,
	virtualizationConfig,
	className = '',
}: VirtualizedBodyProps<TData>) {
	const { table, isLoading } = useRichDataGridContext<TData>()
	const parentRef = useRef<HTMLDivElement>(null)

	// Merge config with defaults
	const config: VirtualizationConfig = {
		...DEFAULT_VIRTUALIZATION_CONFIG,
		...virtualizationConfig,
	}

	const rows = table.getRowModel().rows

	// Initialize virtualizer
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => config.estimatedRowHeight,
		overscan: config.overscan,
	})

	const virtualRows = virtualizer.getVirtualItems()
	const totalSize = virtualizer.getTotalSize()

	// Empty state - use custom emptyState if provided, otherwise show default
	if (!isLoading && rows.length === 0) {
		return (
			<div className={`px-4 py-8 sm:py-12 text-center text-base-content/60 dark:text-base-content/50 ${className}`}>
				{emptyState ?? (
					<div className="flex flex-col items-center gap-2 sm:gap-3">
						<FileText className="h-10 w-10 sm:h-12 sm:w-12 text-base-content/30 dark:text-base-content/20" strokeWidth={1} />
						<p className="text-xs sm:text-sm">No data available</p>
					</div>
				)}
			</div>
		)
	}

	return (
		<div
			ref={parentRef}
			className={`overflow-auto ${className}`}
			style={{ maxHeight: config.maxHeight }}
		>
			{/* Spacer div to create correct scroll height */}
			<div style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}>
				{/* Render only visible rows */}
				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index] as Row<TData>
					const isSelected = row.getIsSelected()
					const customClass = getRowClassName ? getRowClassName(row.original) : ''

					return (
						<div
							key={row.id}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							onClick={() => onRowClick?.(row.original)}
							onDoubleClick={() => onRowDoubleClick?.(row.original)}
							className={`
								absolute left-0 w-full flex
								border-b border-base-200/50 dark:border-base-content/10
								${isSelected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-base-200/30 dark:hover:bg-base-content/5'}
								${onRowClick || onRowDoubleClick ? 'cursor-pointer active:bg-base-200/50 dark:active:bg-base-content/10' : ''}
								transition-colors
								${customClass}
							`}
							style={{
								height: `${virtualRow.size}px`,
								transform: `translateY(${virtualRow.start}px)`,
							}}
							data-selected={isSelected}
						>
							{row.getVisibleCells().map((cell) => (
								<div
									key={cell.id}
									className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-base-content dark:text-base-content/90 flex items-center"
									style={{
										width: cell.column.getSize(),
										minWidth: cell.column.getSize(),
										maxWidth: cell.column.getSize(),
									}}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</div>
							))}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default VirtualizedBody
