/**
 * ColumnVisibilityDropdown - Column Show/Hide Toggle
 *
 * Provides a dropdown menu to toggle column visibility.
 * Uses the shared Dropdown component for consistent styling.
 *
 * @module ColumnVisibilityDropdown
 */

'use client'

import { useState } from 'react'
import { Columns3 } from 'lucide-react'

import { Dropdown } from '@_components/ui/Dropdown'
import Button from '@_components/ui/Button'
import { useRichDataGridVisibility } from '../../context/RichDataGridContext'

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
export function ColumnVisibilityDropdown({
	label = 'Columns',
	showCounts = true,
	className = '',
}: ColumnVisibilityDropdownProps) {
	const { columns, columnVisibility, setColumnVisibility, visibleColumnCount, hiddenColumnCount } =
		useRichDataGridVisibility()
	const [isOpen, setIsOpen] = useState(false)

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
		<Dropdown
			open={isOpen}
			onOpenChange={setIsOpen}
			className={className}>
			<Dropdown.Trigger
				variant='ghost'
				leftIcon={<Columns3 className='h-4 w-4' />}
				badge={showCounts && hiddenColumnCount > 0 ? `${hiddenColumnCount} hidden` : undefined}>
				{label}
			</Dropdown.Trigger>

			<Dropdown.Content
				align='end'
				maxHeight='400px'>
				{/* Quick Actions Header */}
				<Dropdown.Header className='gap-2'>
					<Button
						type='button'
						onClick={showAll}
						variant='ghost'
						size='xs'
						className='flex-1 text-primary hover:bg-primary/10'>
						Show All
					</Button>
					<Button
						type='button'
						onClick={hideAll}
						variant='ghost'
						size='xs'
						className='flex-1 text-base-content/70 hover:text-base-content'>
						Hide All
					</Button>
				</Dropdown.Header>

				{/* Column List with Checkboxes */}
				<div className='py-1 overflow-y-auto max-h-[280px]'>
					{toggleableColumns.map((column) => {
						const isVisible = columnVisibility[column.id] !== false
						const header = column.columnDef.header
						const displayName = typeof header === 'string' ? header : column.id

						return (
							<Dropdown.CheckboxItem
								key={column.id}
								checked={isVisible}
								onCheckedChange={() => toggleColumn(column.id)}>
								{displayName}
							</Dropdown.CheckboxItem>
						)
					})}
				</div>

				{/* Footer with counts */}
				{showCounts && (
					<Dropdown.Footer className='py-2'>
						<Dropdown.Label>
							{visibleColumnCount} of {columns.length} columns visible
						</Dropdown.Label>
					</Dropdown.Footer>
				)}
			</Dropdown.Content>
		</Dropdown>
	)
}

export default ColumnVisibilityDropdown
