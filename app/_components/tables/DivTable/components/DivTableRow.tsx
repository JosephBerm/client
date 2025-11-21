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
import { flexRender } from '@tanstack/react-table'
import type { DivTableRowProps } from '../types/divTableTypes'
import {
  ARIA_ROLE_ROW,
  TABLE_THEME_CLASSES,
  DRAG_HANDLE_SIZE,
} from '../types/divTableConstants'
import { generateRowARIA, classNames } from '../utils/divTableUtils'
import { DivTableCell } from './DivTableCell'

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
export function DivTableRow<TData>({
  row,
  virtualRow,
  enableDragDrop = false,
  dragHandlePosition = 'left',
  enableComplexCells = false,
}: DivTableRowProps<TData>) {
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Virtualization positioning
    ...(virtualRow
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }
      : {}),
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={enableDragDrop ? setNodeRef : undefined}
      {...rowARIA}
      className={classNames(
        'div-table-row',
        TABLE_THEME_CLASSES.bodyRow,
        row.index % 2 === 0 && TABLE_THEME_CLASSES.bodyRowEven,
        row.getIsSelected() && TABLE_THEME_CLASSES.bodyRowSelected,
        isDragging && TABLE_THEME_CLASSES.dragging
      )}
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
        <DivTableCell
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

