/**
 * SelectAllCheckbox - Header Checkbox for Row Selection
 *
 * Provides select all/none functionality in table header.
 * Supports indeterminate state when some rows selected.
 *
 * @module SelectAllCheckbox
 */

'use client'

import { useRef, useEffect } from 'react'
import { useRichDataGridContext } from '../../context/RichDataGridContext'

import Checkbox from '@_components/ui/Checkbox'

// ============================================================================
// PROPS
// ============================================================================

export interface SelectAllCheckboxProps {
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Checkbox for selecting all rows.
 * Shows indeterminate state when some but not all rows selected.
 *
 * @example
 * <SelectAllCheckbox />
 */
export function SelectAllCheckbox({ className = '' }: SelectAllCheckboxProps) {
	const { table } = useRichDataGridContext()
	const checkboxRef = useRef<HTMLInputElement>(null)

	const isAllSelected = table.getIsAllPageRowsSelected()
	const isSomeSelected = table.getIsSomePageRowsSelected()

	// Set indeterminate state (can't be set via attribute)
	useEffect(() => {
		if (checkboxRef.current) {
			checkboxRef.current.indeterminate = isSomeSelected && !isAllSelected
		}
	}, [isSomeSelected, isAllSelected])

	return (
		<div
			className={`flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 ${className}`}>
			<Checkbox
				ref={checkboxRef}
				checked={isAllSelected}
				onChange={table.getToggleAllPageRowsSelectedHandler()}
				className='checkbox-sm checkbox-primary touch-manipulation'
				aria-label={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
			/>
		</div>
	)
}

export default SelectAllCheckbox
