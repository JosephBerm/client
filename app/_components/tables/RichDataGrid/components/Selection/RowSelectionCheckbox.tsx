/**
 * RowSelectionCheckbox - Individual Row Selection Checkbox
 *
 * Checkbox for selecting individual table rows.
 * Used within row cells.
 *
 * @module RowSelectionCheckbox
 */

'use client'

import type { Row } from '@tanstack/react-table'

import Checkbox from '@_components/ui/Checkbox'

// ============================================================================
// PROPS
// ============================================================================

export interface RowSelectionCheckboxProps<TData> {
	/** TanStack Table row instance */
	row: Row<TData>
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Checkbox for selecting a single row.
 *
 * @example
 * <RowSelectionCheckbox row={row} />
 */
export function RowSelectionCheckbox<TData>({ row, className = '' }: RowSelectionCheckboxProps<TData>) {
	return (
		<div
			className={`flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 ${className}`}>
			<Checkbox
				checked={row.getIsSelected()}
				disabled={!row.getCanSelect()}
				onChange={row.getToggleSelectedHandler()}
				className='checkbox-sm checkbox-primary touch-manipulation'
				aria-label={row.getIsSelected() ? 'Deselect row' : 'Select row'}
				onClick={(e) => e.stopPropagation()}
			/>
		</div>
	)
}

export default RowSelectionCheckbox
