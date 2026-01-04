/**
 * useRangeSelection - Range Selection Hook for RichDataGrid
 *
 * Enables Shift+Click to select a range of rows, following standard
 * spreadsheet/table interaction patterns.
 *
 * @module useRangeSelection
 */

'use client'
'use memo'

import { useState, useRef } from 'react'
import type { Row, RowSelectionState } from '@tanstack/react-table'

// ============================================================================
// TYPES
// ============================================================================

export interface UseRangeSelectionOptions<TData> {
	/** All rows from the table */
	rows: Row<TData>[]
	/** Current row selection state */
	rowSelection: RowSelectionState
	/** Row selection setter */
	setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
}

export interface UseRangeSelectionReturn {
	/** Handle row click with range selection support */
	handleRowClick: (rowIndex: number, event: React.MouseEvent) => void
	/** Handle row keyboard interaction */
	handleRowKeyDown: (rowIndex: number, event: React.KeyboardEvent) => void
	/** Last selected row index (anchor for range selection) */
	lastSelectedIndex: number | null
	/** Clear the anchor selection */
	clearAnchor: () => void
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for enabling range selection in RichDataGrid.
 *
 * @example
 * const { handleRowClick, handleRowKeyDown } = useRangeSelection({
 *   rows: table.getRowModel().rows,
 *   rowSelection,
 *   setRowSelection,
 * })
 *
 * // In row rendering:
 * <tr onClick={(e) => handleRowClick(index, e)} onKeyDown={(e) => handleRowKeyDown(index, e)}>
 */
export function useRangeSelection<TData>({
	rows,
	rowSelection,
	setRowSelection,
}: UseRangeSelectionOptions<TData>): UseRangeSelectionReturn {
	// Track the anchor point for range selection (last clicked row without Shift)
	const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

	/**
	 * Get all row IDs between two indices (inclusive).
	 */
	const getRowIdsBetween = (startIndex: number, endIndex: number): string[] => {
		const start = Math.min(startIndex, endIndex)
		const end = Math.max(startIndex, endIndex)

		return rows
			.slice(start, end + 1)
			.map((row) => row.id)
	}

	/**
	 * Handle row click with Shift/Ctrl/Cmd modifier support.
	 *
	 * - Normal click: Select only this row (deselect others)
	 * - Shift+click: Select range from anchor to clicked row
	 * - Ctrl/Cmd+click: Toggle selection of clicked row
	 */
	const handleRowClick = (rowIndex: number, event: React.MouseEvent) => {
		const row = rows[rowIndex]
		if (!row) return

		const rowId = row.id
		const isShiftKey = event.shiftKey
		const isCtrlKey = event.ctrlKey || event.metaKey

		if (isShiftKey && lastSelectedIndex !== null) {
			// Range selection: select all rows between anchor and current
			event.preventDefault()

			const rowIds = getRowIdsBetween(lastSelectedIndex, rowIndex)
			const newSelection: RowSelectionState = { ...rowSelection }

			for (const id of rowIds) {
				newSelection[id] = true
			}

			setRowSelection(newSelection)
		} else if (isCtrlKey) {
			// Toggle selection: add or remove this row from selection
			event.preventDefault()

			setRowSelection((prev) => {
				const newSelection = { ...prev }
				if (newSelection[rowId]) {
					delete newSelection[rowId]
				} else {
					newSelection[rowId] = true
				}
				return newSelection
			})

			// Update anchor to this row
			setLastSelectedIndex(rowIndex)
		} else {
			// Normal click: select only this row
			setRowSelection({ [rowId]: true })
			setLastSelectedIndex(rowIndex)
		}
	}

	/**
	 * Handle keyboard interactions for row selection.
	 *
	 * - Space/Enter: Toggle selection of focused row
	 * - Shift+Space/Enter: Range select from anchor to focused row
	 */
	const handleRowKeyDown = (rowIndex: number, event: React.KeyboardEvent) => {
		const row = rows[rowIndex]
		if (!row) return

		const rowId = row.id

		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault()

			if (event.shiftKey && lastSelectedIndex !== null) {
				// Range selection
				const rowIds = getRowIdsBetween(lastSelectedIndex, rowIndex)
				const newSelection: RowSelectionState = { ...rowSelection }

				for (const id of rowIds) {
					newSelection[id] = true
				}

				setRowSelection(newSelection)
			} else {
				// Toggle selection
				setRowSelection((prev) => {
					const newSelection = { ...prev }
					if (newSelection[rowId]) {
						delete newSelection[rowId]
					} else {
						newSelection[rowId] = true
					}
					return newSelection
				})

				setLastSelectedIndex(rowIndex)
			}
		}
	}

	/**
	 * Clear the anchor point.
	 */
	const clearAnchor = () => {
		setLastSelectedIndex(null)
	}

	return {
		handleRowClick,
		handleRowKeyDown,
		lastSelectedIndex,
		clearAnchor,
	}
}

export default useRangeSelection
