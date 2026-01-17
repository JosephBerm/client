/**
 * SelectionStatusBar - Shows Selected Row Count
 *
 * Displays count of selected rows with clear action.
 * Following AG Grid pattern.
 *
 * @module SelectionStatusBar
 */

'use client'

import { useRichDataGridSelection } from '../../context/RichDataGridContext'
import Button from '@_components/ui/Button'

// ============================================================================
// PROPS
// ============================================================================

export interface SelectionStatusBarProps {
	/** Show clear button */
	showClear?: boolean
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Status bar showing selected row count.
 * Only visible when rows are selected.
 *
 * @example
 * <SelectionStatusBar showClear />
 */
export function SelectionStatusBar({ showClear = true, className = '' }: SelectionStatusBarProps) {
	const { selectedCount, clearSelection } = useRichDataGridSelection()

	if (selectedCount === 0) {
		return null
	}

	return (
		<div
			className={`
				flex items-center justify-between gap-3
				px-3 sm:px-4 py-2 sm:py-2.5
				bg-primary/10 dark:bg-primary/20
				border-t border-primary/20 dark:border-primary/30
				text-xs sm:text-sm text-primary dark:text-primary
				${className}
			`}>
			<span className='font-medium'>
				{selectedCount} row{selectedCount > 1 ? 's' : ''} selected
			</span>

			{showClear && (
				<Button
					type='button'
					onClick={clearSelection}
					variant='ghost'
					size='xs'
					className='text-primary/80 hover:text-primary dark:text-primary/70 dark:hover:text-primary underline text-xs touch-manipulation min-h-[44px] sm:min-h-0 flex items-center h-auto p-0'>
					Clear selection
				</Button>
			)}
		</div>
	)
}

export default SelectionStatusBar
