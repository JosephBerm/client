/**
 * @file useKeyboardNav.ts
 * @description Advanced keyboard navigation for grid tables (role="grid")
 * Implements WCAG 2.1 keyboard navigation patterns for data grids
 * 
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */

'use client'

import type { RefObject } from 'react';
import { useEffect, useCallback } from 'react'

import { logger } from '@_core'

/**
 * Cell position in the grid
 */
interface CellPosition {
  rowIndex: number
  colIndex: number
}

/**
 * Navigation direction
 */
type NavDirection = 'up' | 'down' | 'left' | 'right' | 'home' | 'end' | 'pageUp' | 'pageDown' | 'ctrlHome' | 'ctrlEnd'

/**
 * Hook configuration
 */
interface UseKeyboardNavOptions {
  /**
   * Reference to the table container element
   */
  tableRef: RefObject<HTMLDivElement | null>
  
  /**
   * Total number of rows in the grid
   */
  rowCount: number
  
  /**
   * Total number of columns in the grid
   */
  columnCount: number
  
  /**
   * Whether keyboard navigation is enabled
   * @default true
   */
  enabled?: boolean
  
  /**
   * Whether to enable page up/down navigation
   * @default true
   */
  enablePageNav?: boolean
  
  /**
   * Number of rows to jump on page up/down
   * @default 10
   */
  pageSize?: number
  
  /**
   * Callback when cell focus changes
   */
  onCellFocus?: (position: CellPosition) => void
  
  /**
   * Callback when navigation is attempted outside grid bounds
   */
  onBoundaryReached?: (direction: NavDirection) => void
}

/**
 * Custom hook for advanced keyboard navigation in grid tables
 * 
 * Implements WCAG 2.1 keyboard interaction patterns:
 * - Arrow keys: Navigate between cells
 * - Home/End: Jump to first/last cell in row
 * - Ctrl+Home/End: Jump to first/last cell in table
 * - Page Up/Down: Scroll by page size (optional)
 * 
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * const tableRef = useRef<HTMLDivElement>(null)
 * 
 * useKeyboardNav({
 *   tableRef,
 *   rowCount: rows.length,
 *   columnCount: columns.length,
 *   onCellFocus: (pos) => logger.debug('Cell focused', { pos })
 * })
 * ```
 */
export function useKeyboardNav({
  tableRef,
  rowCount,
  columnCount,
  enabled = true,
  enablePageNav = true,
  pageSize = 10,
  onCellFocus,
  onBoundaryReached,
}: UseKeyboardNavOptions) {
  /**
   * Get the current focused cell position
   */
  const getCurrentCellPosition = useCallback((): CellPosition | null => {
    if (!tableRef.current) {return null}

    const {activeElement} = document
    if (!activeElement || !tableRef.current.contains(activeElement)) {
      return null
    }

    // Find the cell element (might be the active element or a parent)
    const cellElement = activeElement.closest('[role="gridcell"]') as HTMLElement
    if (!cellElement) {return null}

    // Find the row element
    const rowElement = cellElement.closest('[role="row"]') as HTMLElement
    if (!rowElement) {return null}

    // Get row index from aria-rowindex (1-based, convert to 0-based)
    const rowIndexAttr = rowElement.getAttribute('aria-rowindex')
    const rowIndexParsed = rowIndexAttr ? parseInt(rowIndexAttr, 10) : NaN
    if (isNaN(rowIndexParsed)) {
      logger.warn('Invalid aria-rowindex', {
        hook: 'useKeyboardNav',
        rowIndexAttr,
      })
      return null
    }
    const rowIndex = rowIndexParsed - 2 // -2 because header is row 1

    // Get column index from aria-colindex (1-based, convert to 0-based)
    const colIndexAttr = cellElement.getAttribute('aria-colindex')
    const colIndexParsed = colIndexAttr ? parseInt(colIndexAttr, 10) : NaN
    if (isNaN(colIndexParsed)) {
      logger.warn('Invalid aria-colindex', {
        hook: 'useKeyboardNav',
        colIndexAttr,
      })
      return null
    }
    const colIndex = colIndexParsed - 1

    return { rowIndex, colIndex }
  }, [tableRef])

  /**
   * Focus a cell at the given position
   */
  const focusCell = useCallback(
    (position: CellPosition): boolean => {
      if (!tableRef.current) {return false}

      // Validate table dimensions
      if (rowCount <= 0 || columnCount <= 0) {
        logger.warn('Invalid table dimensions', {
          hook: 'useKeyboardNav',
          rowCount,
          columnCount,
        })
        return false
      }

      // Validate position
      if (
        position.rowIndex < 0 ||
        position.rowIndex >= rowCount ||
        position.colIndex < 0 ||
        position.colIndex >= columnCount
      ) {
        return false
      }

      try {
        // Find the cell using aria-rowindex and aria-colindex
        // aria-rowindex is 1-based and includes header, so add 2 to rowIndex
        const targetRow = tableRef.current.querySelector(
          `[role="row"][aria-rowindex="${position.rowIndex + 2}"]`
        )

        if (!targetRow) {return false}

        // aria-colindex is 1-based, so add 1 to colIndex
        const targetCell = targetRow.querySelector(
          `[role="gridcell"][aria-colindex="${position.colIndex + 1}"]`
        ) as HTMLElement

        if (!targetCell) {return false}

        // Focus the cell or first focusable element within
        const focusableElement =
          targetCell.querySelector<HTMLElement>(
            'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) || targetCell

        focusableElement.focus()

        // Scroll into view if needed
        focusableElement.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        })

        // Call callback
        onCellFocus?.(position)

        logger.debug('Cell focused', {
          hook: 'useKeyboardNav',
          rowIndex: position.rowIndex,
          colIndex: position.colIndex,
        })

        return true
      } catch (error) {
        logger.error('Failed to focus cell', {
          hook: 'useKeyboardNav',
          error,
          position,
        })
        return false
      }
    },
    [tableRef, rowCount, columnCount, onCellFocus]
  )

  /**
   * Navigate in the specified direction
   */
  const navigate = useCallback(
    (direction: NavDirection): boolean => {
      const currentPos = getCurrentCellPosition()
      if (!currentPos) {
        // No current focus, focus first cell
        return focusCell({ rowIndex: 0, colIndex: 0 })
      }

      let newPos: CellPosition | null = null

      switch (direction) {
        case 'up':
          if (currentPos.rowIndex > 0) {
            newPos = { ...currentPos, rowIndex: currentPos.rowIndex - 1 }
          } else {
            onBoundaryReached?.('up')
          }
          break

        case 'down':
          if (currentPos.rowIndex < rowCount - 1) {
            newPos = { ...currentPos, rowIndex: currentPos.rowIndex + 1 }
          } else {
            onBoundaryReached?.('down')
          }
          break

        case 'left':
          if (currentPos.colIndex > 0) {
            newPos = { ...currentPos, colIndex: currentPos.colIndex - 1 }
          } else {
            onBoundaryReached?.('left')
          }
          break

        case 'right':
          if (currentPos.colIndex < columnCount - 1) {
            newPos = { ...currentPos, colIndex: currentPos.colIndex + 1 }
          } else {
            onBoundaryReached?.('right')
          }
          break

        case 'home':
          newPos = { ...currentPos, colIndex: 0 }
          break

        case 'end':
          newPos = { ...currentPos, colIndex: columnCount - 1 }
          break

        case 'pageUp':
          if (enablePageNav) {
            newPos = {
              ...currentPos,
              rowIndex: Math.max(0, currentPos.rowIndex - pageSize),
            }
          }
          break

        case 'pageDown':
          if (enablePageNav) {
            newPos = {
              ...currentPos,
              rowIndex: Math.min(rowCount - 1, currentPos.rowIndex + pageSize),
            }
          }
          break

        case 'ctrlHome':
          newPos = { rowIndex: 0, colIndex: 0 }
          break

        case 'ctrlEnd':
          newPos = { rowIndex: rowCount - 1, colIndex: columnCount - 1 }
          break
      }

      if (newPos) {
        return focusCell(newPos)
      }

      return false
    },
    [
      getCurrentCellPosition,
      focusCell,
      rowCount,
      columnCount,
      enablePageNav,
      pageSize,
      onBoundaryReached,
    ]
  )

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !tableRef.current) {return}

      // Check if the event target is within our table
      const target = event.target as HTMLElement
      if (!tableRef.current.contains(target)) {return}

      // Check if we're in an input/textarea (allow normal typing)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      let handled = false

      // Determine direction based on key
      if (event.key === 'ArrowUp') {
        handled = navigate('up')
      } else if (event.key === 'ArrowDown') {
        handled = navigate('down')
      } else if (event.key === 'ArrowLeft') {
        handled = navigate('left')
      } else if (event.key === 'ArrowRight') {
        handled = navigate('right')
      } else if (event.key === 'Home') {
        if (event.ctrlKey) {
          handled = navigate('ctrlHome')
        } else {
          handled = navigate('home')
        }
      } else if (event.key === 'End') {
        if (event.ctrlKey) {
          handled = navigate('ctrlEnd')
        } else {
          handled = navigate('end')
        }
      } else if (event.key === 'PageUp') {
        handled = navigate('pageUp')
      } else if (event.key === 'PageDown') {
        handled = navigate('pageDown')
      }

      // Prevent default if we handled the event
      if (handled) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    [enabled, tableRef, navigate]
  )

  /**
   * Set up keyboard event listener
   */
  useEffect(() => {
    if (!enabled || !tableRef.current) {return}

    const tableElement = tableRef.current

    tableElement.addEventListener('keydown', handleKeyDown)

    return () => {
      tableElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, tableRef, handleKeyDown])

  /**
   * Return utility functions for programmatic navigation
   */
  return {
    /**
     * Focus a specific cell
     */
    focusCell,

    /**
     * Navigate in a direction
     */
    navigate,

    /**
     * Get current focused cell position
     */
    getCurrentPosition: getCurrentCellPosition,
  }
}

