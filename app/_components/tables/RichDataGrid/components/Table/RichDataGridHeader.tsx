/**
 * RichDataGridHeader - Table Header Component
 *
 * Renders table headers with sorting indicators, column filters, and resize handles.
 * Following TanStack Table patterns.
 *
 * @module RichDataGridHeader
 */

'use client'

import { flexRender, type HeaderGroup } from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react'
import { useRichDataGridContext, useRichDataGridFilters, useRichDataGridPinning, useRichDataGridFacets } from '../../context/RichDataGridContext'
import { FilterType, createColumnId, type RichColumnExtensions } from '../../types'
import { FilterPopover } from '../Filter'
import { ResizeHandle } from '../Header'

// ============================================================================
// PROPS
// ============================================================================

export interface RichDataGridHeaderProps {
	/** Additional CSS classes */
	className?: string
	/** Enable column filters UI */
	enableColumnFilters?: boolean
	/** Enable column resizing */
	enableColumnResizing?: boolean
	/** Enable column pinning */
	enableColumnPinning?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Table header component with sorting, filtering, and resizing support.
 *
 * @example
 * <RichDataGridHeader enableColumnFilters enableColumnResizing />
 */
export function RichDataGridHeader({
	className = '',
	enableColumnFilters = false,
	enableColumnResizing = false,
	enableColumnPinning = false,
}: RichDataGridHeaderProps) {
	const { table } = useRichDataGridContext()
	const { setColumnFilter, getColumnFilter } = useRichDataGridFilters()
	const { isPinned } = useRichDataGridPinning()
	const { getFacetData } = useRichDataGridFacets()

	return (
		<thead className={`bg-base-200/50 dark:bg-base-content/5 sticky top-0 z-10 ${className}`}>
			{table.getHeaderGroups().map((headerGroup: HeaderGroup<unknown>) => (
				<tr key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						const canSort = header.column.getCanSort()
						const sortDirection = header.column.getIsSorted()
						const canResize = enableColumnResizing && header.column.getCanResize()

						// Get filter options from column meta
						const columnMeta = header.column.columnDef.meta as RichColumnExtensions<unknown> | undefined
						const filterOptions = columnMeta?.filterOptions
						const canFilter = enableColumnFilters && filterOptions?.filterType !== undefined
						const filterType = filterOptions?.filterType ?? FilterType.Text

						// Column pinning
						const pinned = enableColumnPinning ? isPinned(header.column.id) : false
						const pinnedStyles = pinned ? {
							position: 'sticky' as const,
							left: pinned === 'left' ? `${header.getStart('left')}px` : undefined,
							right: pinned === 'right' ? `${header.getStart('right')}px` : undefined,
							zIndex: 11, // Above other headers
						} : {}

						return (
							<th
								key={header.id}
								className={`
									px-3 py-2.5 sm:px-4 sm:py-3
									text-left text-xs sm:text-sm font-semibold
									text-base-content/80 dark:text-base-content/70
									transition-colors whitespace-nowrap
									${canResize ? 'relative group' : ''}
									${pinned ? 'bg-base-200 dark:bg-base-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}
								`}
								style={{ width: header.getSize(), ...pinnedStyles }}
								aria-sort={sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
							>
								<div className="flex items-center gap-1.5 sm:gap-2">
									{/* Header Label + Sort Indicator - entire area clickable for sorting (MAANG pattern) */}
									<div
										className={`flex items-center gap-1 ${canSort ? 'cursor-pointer select-none group' : ''}`}
										onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
										onKeyDown={canSort ? (e: React.KeyboardEvent) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault()
												header.column.getToggleSortingHandler()?.(e)
											}
										} : undefined}
										role={canSort ? 'button' : undefined}
										tabIndex={canSort ? 0 : undefined}
										aria-label={canSort ? `Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}, currently ${sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'unsorted'}` : undefined}
									>
										{/* Header Label */}
										<span className={canSort ? 'group-hover:text-base-content' : ''}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</span>

										{/* Sort Indicator - visual only, parent handles click */}
										{canSort && (
											<span className="text-base-content/40 flex-shrink-0">
												{sortDirection === 'asc' ? (
													<ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
												) : sortDirection === 'desc' ? (
													<ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
												) : (
													<ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-40 group-hover:opacity-100" />
												)}
											</span>
										)}
									</div>

									{/* Filter Popover - separate clickable area */}
									{canFilter && (
										<FilterPopover
											columnId={createColumnId(header.column.id)}
											filterType={filterType}
											filterOptions={filterOptions}
											facetData={getFacetData(header.column.id)}
											currentValue={getColumnFilter(header.column.id)}
											onApply={(value) => setColumnFilter(header.column.id, value)}
											columnLabel={
												typeof header.column.columnDef.header === 'string'
													? header.column.columnDef.header
													: header.column.id
											}
										/>
									)}
								</div>

								{/* Resize Handle */}
								{canResize && <ResizeHandle header={header} />}
							</th>
						)
					})}
				</tr>
			))}
		</thead>
	)
}

export default RichDataGridHeader

