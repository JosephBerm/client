/**
 * DivTableCell Component
 * 
 * Renders a single table cell with support for complex content.
 * Uses ARIA gridcell role for proper accessibility.
 * 
 * @module DivTableCell
 */

'use client'

import { flexRender } from '@tanstack/react-table'
import type { DataGridCellProps } from '../types/divTableTypes'
import { TABLE_THEME_CLASSES } from '../types/divTableConstants'
import { generateCellARIA, classNames } from '../utils/divTableUtils'

/**
 * Table Cell Component
 * 
 * @example
 * ```tsx
 * <DivTableCell
 *   cell={cell}
 *   columnIndex={0}
 *   enableComplexContent={true}
 * />
 * ```
 */
export function DataGridCell<TData>({
  cell,
  columnIndex,
  enableComplexContent = false,
}: DataGridCellProps<TData>) {
  // ============================================================================
  // ARIA Attributes
  // ============================================================================

  const cellARIA = generateCellARIA(columnIndex)

  // ============================================================================
  // Cell Content
  // ============================================================================

  const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext())

  // ============================================================================
  // Alignment from column meta
  // ============================================================================

  const align = (cell.column.columnDef.meta as any)?.align || 'left'

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      {...cellARIA}
      className={classNames(
        'data-grid-cell',
        TABLE_THEME_CLASSES.bodyCell,
        TABLE_THEME_CLASSES.focusVisible
      )}
      data-column-id={cell.column.id}
      data-align={align}
      style={{
        textAlign: align,
        // gridColumn removed - cells auto-place by default (redundant with default behavior)
      }}
    >
      <div
        className={classNames(
          'cell-content',
          enableComplexContent && 'cell-content-complex'
        )}
      >
        {cellContent}
      </div>
    </div>
  )
}

