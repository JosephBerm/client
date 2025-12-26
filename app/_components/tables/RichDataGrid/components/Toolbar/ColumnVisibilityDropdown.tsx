/**
 * ColumnVisibilityDropdown - Column Show/Hide Toggle
 *
 * Provides a dropdown menu to toggle column visibility.
 * Follows AG Grid pattern with checkbox list.
 *
 * @module ColumnVisibilityDropdown
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Columns3, Check, ChevronDown } from 'lucide-react'
import { useRichDataGridVisibility } from '../../context/RichDataGridContext'
import { useClickOutside, useEscapeKey } from '../../hooks/useClickOutside'

// ============================================================================
// PROPS
// ============================================================================

export interface ColumnVisibilityDropdownProps {
	/** Button label */
	label?: string
	/** Show column counts */
	showCounts?: boolean
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dropdown menu for toggling column visibility.
 * Persists to localStorage via RichDataGrid context.
 *
 * @example
 * <ColumnVisibilityDropdown label="Columns" showCounts />
 */
export function ColumnVisibilityDropdown({ label = 'Columns', showCounts = true, className = '' }: ColumnVisibilityDropdownProps) {
	const { columns, columnVisibility, setColumnVisibility, visibleColumnCount, hiddenColumnCount } = useRichDataGridVisibility()
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Shared hook for click outside and escape key handling (DRY)
	const closeDropdown = useCallback(() => setIsOpen(false), [])
	useClickOutside(dropdownRef, closeDropdown, isOpen)
	useEscapeKey(closeDropdown, isOpen)

	// Toggle column visibility
	const toggleColumn = (columnId: string) => {
		setColumnVisibility((prev) => ({
			...prev,
			[columnId]: prev[columnId] === false ? true : false,
		}))
	}

	// Show all columns
	const showAll = () => {
		const newVisibility: Record<string, boolean> = {}
		columns.forEach((col) => {
			newVisibility[col.id] = true
		})
		setColumnVisibility(newVisibility)
	}

	// Hide all columns (except first)
	const hideAll = () => {
		const newVisibility: Record<string, boolean> = {}
		columns.forEach((col, index) => {
			// Keep first column visible
			newVisibility[col.id] = index === 0
		})
		setColumnVisibility(newVisibility)
	}

	// Filter to only toggleable columns (columns with headers)
	const toggleableColumns = columns.filter((col) => {
		// Skip selection checkbox column and columns without headers
		const header = col.columnDef.header
		return typeof header === 'string' || typeof header === 'function'
	})

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="btn btn-ghost btn-sm gap-2"
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				<Columns3 className="h-4 w-4" />
				<span>{label}</span>
				{showCounts && hiddenColumnCount > 0 && (
					<span className="badge badge-primary badge-sm">{hiddenColumnCount} hidden</span>
				)}
				<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div
					className="absolute right-0 top-full mt-1 z-50 
						bg-base-100 dark:bg-base-200
						border border-base-300 dark:border-base-content/20 
						rounded-lg shadow-lg dark:shadow-2xl
						min-w-[200px] max-w-[90vw] sm:max-w-[280px] 
						max-h-[60vh] sm:max-h-[400px] overflow-auto"
					role="menu"
					aria-orientation="vertical"
				>
					{/* Quick Actions */}
					<div className="p-2 border-b border-base-300 dark:border-base-content/10 flex gap-2">
						<button type="button" onClick={showAll} className="btn btn-xs btn-ghost flex-1 touch-manipulation min-h-[36px]">
							Show All
						</button>
						<button type="button" onClick={hideAll} className="btn btn-xs btn-ghost flex-1 touch-manipulation min-h-[36px]">
							Hide All
						</button>
					</div>

					{/* Column List */}
					<div className="p-2">
						{toggleableColumns.map((column) => {
							const isVisible = columnVisibility[column.id] !== false
							const header = column.columnDef.header
							const displayName = typeof header === 'string' ? header : column.id

							return (
								<button
									key={column.id}
									type="button"
									onClick={() => toggleColumn(column.id)}
									className="w-full flex items-center gap-2 px-3 py-2.5 sm:py-2 rounded-md
										hover:bg-base-200 dark:hover:bg-base-content/10
										active:bg-base-300 dark:active:bg-base-content/15
										transition-colors text-left touch-manipulation"
									role="menuitemcheckbox"
									aria-checked={isVisible}
								>
									<div
										className={`
											w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
											transition-colors
											${isVisible 
												? 'bg-primary border-primary text-primary-content' 
												: 'border-base-300 dark:border-base-content/30'}
										`}
									>
										{isVisible && <Check className="h-3 w-3" />}
									</div>
									<span className="text-sm truncate">{displayName}</span>
								</button>
							)
						})}
					</div>

					{/* Footer with counts */}
					{showCounts && (
						<div className="p-2 border-t border-base-300 dark:border-base-content/10 text-xs text-base-content/60 dark:text-base-content/50 text-center">
							{visibleColumnCount} of {columns.length} columns visible
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default ColumnVisibilityDropdown

