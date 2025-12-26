/**
 * RichDataGridHeader - Table Header Component
 *
 * Renders table headers with sorting indicators.
 * Following TanStack Table patterns.
 *
 * @module RichDataGridHeader
 */

'use client'

import { flexRender, type HeaderGroup } from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react'
import { useRichDataGridContext } from '../../context/RichDataGridContext'

// ============================================================================
// PROPS
// ============================================================================

export interface RichDataGridHeaderProps {
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Table header component with sorting support.
 *
 * @example
 * <RichDataGridHeader />
 */
export function RichDataGridHeader({ className = '' }: RichDataGridHeaderProps) {
	const { table } = useRichDataGridContext()

	return (
		<thead className={`bg-base-200/50 dark:bg-base-content/5 sticky top-0 z-10 ${className}`}>
			{table.getHeaderGroups().map((headerGroup: HeaderGroup<unknown>) => (
				<tr key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						const canSort = header.column.getCanSort()
						const sortDirection = header.column.getIsSorted()

						return (
							<th
								key={header.id}
								className={`
									px-3 py-2.5 sm:px-4 sm:py-3
									text-left text-xs sm:text-sm font-semibold
									text-base-content/80 dark:text-base-content/70
									${canSort ? 'cursor-pointer select-none hover:bg-base-200 dark:hover:bg-base-content/10 active:bg-base-300 dark:active:bg-base-content/15' : ''}
									transition-colors whitespace-nowrap
								`}
								style={{ width: header.getSize() }}
								onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
								aria-sort={sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
							>
								<div className="flex items-center gap-1.5 sm:gap-2">
									{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}

									{/* Sort Indicator */}
									{canSort && (
										<span className="text-base-content/40 flex-shrink-0">
											{sortDirection === 'asc' ? (
												<ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
											) : sortDirection === 'desc' ? (
												<ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
											) : (
												<ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100" />
											)}
										</span>
									)}
								</div>
							</th>
						)
					})}
				</tr>
			))}
		</thead>
	)
}

export default RichDataGridHeader

