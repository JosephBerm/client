/**
 * DivTableRow Component
 * 
 * Renders a single table row with optional drag-drop support.
 * Integrates @dnd-kit for draggable rows.
 * 
 * @module DivTableRow
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'


import {
  TABLE_THEME_CLASSES,
  DRAG_HANDLE_SIZE,
} from '../types/divTableConstants'
import { generateRowARIA, classNames } from '../utils/divTableUtils'

import { DataGridCell } from './DivTableCell'

import type { DataGridRowProps } from '../types/divTableTypes'

/**
 * Table Row Component
 * 
 * @example
 * ```tsx
 * <DivTableRow
 *   row={row}
 *   virtualRow={virtualItem}
 *   enableDragDrop={true}
 *   dragHandlePosition="left"
 * />
 * ```
 */
export function DataGridRow<TData>({
  row,
  virtualRow,
  enableDragDrop = false,
  dragHandlePosition = 'left',
  enableComplexCells = false,
}: DataGridRowProps<TData>) {
  // ============================================================================
  // Drag & Drop Setup
  // ============================================================================

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    disabled: !enableDragDrop,
  })

  // ============================================================================
  // ARIA Attributes
  // ============================================================================

  const rowARIA = generateRowARIA(
    row.index,
    row.getIsSelected(),
    row.getIsExpanded?.()
  )

  // ============================================================================
  // Styles
  // ============================================================================

  const columnCount = row.getVisibleCells().length
  
  // Build style object carefully to avoid transform conflicts
  const style: React.CSSProperties = {}
  
  // Add transition (always present)
  if (transition) {
    style.transition = transition
  }
  
  // Virtualization: Absolute positioning with translateY
  if (virtualRow) {
    style.position = 'absolute'
    style.top = 0
    style.left = 0
    style.width = '100%'
    style.height = `${virtualRow.size}px`
    style.display = 'grid'
    style.gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`
    style.gridColumn = '1 / -1'
    
    // Handle transforms properly for virtualized rows
    // Combine virtualization offset with drag-drop transform
    if (enableDragDrop && transform) {
      // Get the drag transform values
      const dragTransform = CSS.Transform.toString(transform)
      // Combine with virtualization offset
      style.transform = `translateY(${virtualRow.start}px) ${dragTransform}`
    } else {
      // Only virtualization offset
      style.transform = `translateY(${virtualRow.start}px)`
    }
  } else {
    // Non-virtualized: Use contents display to participate in parent grid
    style.display = 'contents'
    
    // Apply drag transform if enabled (no virtualization offset needed)
    if (enableDragDrop && transform) {
      style.transform = CSS.Transform.toString(transform)
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  // Use contents display for non-virtualized rows to participate in parent grid
  const rowClassName = classNames(
    'data-grid-row',
    TABLE_THEME_CLASSES.bodyRow,
    row.index % 2 === 0 && TABLE_THEME_CLASSES.bodyRowEven,
    row.getIsSelected() && TABLE_THEME_CLASSES.bodyRowSelected,
    isDragging && TABLE_THEME_CLASSES.dragging
  )

  return (
    <div
      ref={enableDragDrop ? setNodeRef : undefined}
      {...rowARIA}
      className={rowClassName}
      style={style}
      data-row-index={row.index}
      data-is-dragging={isDragging}
    >
      {/* Drag handle (left) */}
      {enableDragDrop && dragHandlePosition === 'left' && (
        <div
          className="drag-handle drag-handle-left"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder row"
          style={{
            width: `${DRAG_HANDLE_SIZE}px`,
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GripVertical className="w-4 h-4 text-base-content/50" aria-hidden="true" />
        </div>
      )}

      {/* Table cells */}
      {row.getVisibleCells().map((cell, columnIndex) => (
        <DataGridCell
          key={cell.id}
          cell={cell}
          columnIndex={columnIndex}
          enableComplexContent={enableComplexCells}
        />
      ))}

      {/* Drag handle (right) */}
      {enableDragDrop && dragHandlePosition === 'right' && (
        <div
          className="drag-handle drag-handle-right"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder row"
          style={{
            width: `${DRAG_HANDLE_SIZE}px`,
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GripVertical className="w-4 h-4 text-base-content/50" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

