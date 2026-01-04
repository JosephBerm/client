/**
 * useKeyboardNavigation - Keyboard Navigation Hook for RichDataGrid
 *
 * Enables keyboard navigation through table rows using arrow keys,
 * Home, End, Page Up, and Page Down.
 *
 * @module useKeyboardNavigation
 */

'use client'
'use memo'

import { useState, useRef, useEffect } from 'react'
import type { Row, Table } from '@tanstack/react-table'

// ============================================================================
// TYPES
// ============================================================================

export interface UseKeyboardNavigationOptions<TData> {
	/** TanStack Table instance */
	table: Table<TData>
	/** Enable keyboard navigation (default: true) */
	enabled?: boolean
	/** Number of rows to skip for Page Up/Down (default: 10) */
	pageJumpSize?: number
	/** Callback when focused row changes */
	onFocusChange?: (row: Row<TData> | null, index: number) => void
}

export interface UseKeyboardNavigationReturn {
	/** Currently focused row index (-1 if none) */
	focusedRowIndex: number
	/** Set focused row by index */
	setFocusedRowIndex: (index: number) => void
	/** Handle keyboard events on the table container */
	handleKeyDown: (event: React.KeyboardEvent) => void
	/** Check if a row is focused */
	isRowFocused: (index: number) => boolean
	/** Get props to spread on the table container for keyboard support */
	getContainerProps: () => {
		tabIndex: number
		role: string
		onKeyDown: (event: React.KeyboardEvent) => void
	}
	/** Get props to spread on a row for focus styling */
	getRowProps: (index: number) => {
		'data-focused': boolean
		tabIndex: number
	}
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for enabling keyboard navigation in RichDataGrid.
 *
 * @example
 * const {
 *   handleKeyDown,
 *   isRowFocused,
 *   getContainerProps,
 *   getRowProps,
 * } = useKeyboardNavigation({ table })
 *
 * return (
 *   <div {...getContainerProps()}>
 *     <table>
 *       {rows.map((row, index) => (
 *         <tr {...getRowProps(index)}>...</tr>
 *       ))}
 *     </table>
 *   </div>
 * )
 */
export function useKeyboardNavigation<TData>({
	table,
	enabled = true,
	pageJumpSize = 10,
	onFocusChange,
}: UseKeyboardNavigationOptions<TData>): UseKeyboardNavigationReturn {
	const [focusedRowIndex, setFocusedRowIndexState] = useState(-1)
	const containerRef = useRef<HTMLElement | null>(null)

	const rows = table.getRowModel().rows
	const rowCount = rows.length

	/**
	 * Set focused row index with bounds checking.
	 */
	const setFocusedRowIndex = (index: number) => {
		// Clamp to valid range
		const newIndex = Math.max(-1, Math.min(index, rowCount - 1))
		setFocusedRowIndexState(newIndex)

		// Call callback with new focused row
		if (onFocusChange) {
			const row = newIndex >= 0 ? rows[newIndex] : null
			onFocusChange(row, newIndex)
		}
	}

	/**
	 * Move focus by delta.
	 */
	const moveFocus = (delta: number) => {
		if (rowCount === 0) return

		setFocusedRowIndex(
			focusedRowIndex === -1
				? delta > 0 ? 0 : rowCount - 1
				: focusedRowIndex + delta
		)
	}

	/**
	 * Handle keyboard events for navigation.
	 */
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (!enabled || rowCount === 0) return

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				moveFocus(1)
				break

			case 'ArrowUp':
				event.preventDefault()
				moveFocus(-1)
				break

			case 'Home':
				event.preventDefault()
				if (event.ctrlKey || event.metaKey) {
					// Ctrl+Home: Go to first row
					setFocusedRowIndex(0)
				} else {
					// Home: Go to first row (same behavior for now)
					setFocusedRowIndex(0)
				}
				break

			case 'End':
				event.preventDefault()
				if (event.ctrlKey || event.metaKey) {
					// Ctrl+End: Go to last row
					setFocusedRowIndex(rowCount - 1)
				} else {
					// End: Go to last row (same behavior for now)
					setFocusedRowIndex(rowCount - 1)
				}
				break

			case 'PageUp':
				event.preventDefault()
				moveFocus(-pageJumpSize)
				break

			case 'PageDown':
				event.preventDefault()
				moveFocus(pageJumpSize)
				break

			case 'Escape':
				// Clear focus
				event.preventDefault()
				setFocusedRowIndex(-1)
				break

			default:
				// Don't prevent default for other keys
				break
		}
	}

	/**
	 * Check if a row is currently focused.
	 */
	const isRowFocused = (index: number): boolean => {
		return focusedRowIndex === index
	}

	/**
	 * Get props for the container element.
	 */
	const getContainerProps = () => ({
		tabIndex: 0,
		role: 'grid' as const,
		onKeyDown: handleKeyDown,
	})

	/**
	 * Get props for a row element.
	 */
	const getRowProps = (index: number) => ({
		'data-focused': isRowFocused(index),
		tabIndex: isRowFocused(index) ? 0 : -1,
	})

	// Reset focus when rows change (e.g., after filtering or pagination)
	useEffect(() => {
		if (focusedRowIndex >= rowCount) {
			setFocusedRowIndex(rowCount - 1)
		}
	}, [rowCount, focusedRowIndex])

	return {
		focusedRowIndex,
		setFocusedRowIndex,
		handleKeyDown,
		isRowFocused,
		getContainerProps,
		getRowProps,
	}
}

export default useKeyboardNavigation
