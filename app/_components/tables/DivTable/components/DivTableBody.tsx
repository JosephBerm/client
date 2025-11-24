/**
 * DataGridBody Component
 * 
 * Renders table body with virtualization support for large datasets.
 * Integrates @tanstack/react-virtual for efficient rendering.
 * Supports drag-drop row reordering with @dnd-kit.
 * 
 * @module DataGridBody
 */

'use client'

import { useRef } from 'react'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'


import { logger } from '@_core'

import {
  ARIA_ROLE_ROWGROUP,
  COMPONENT_NAMES,
  TABLE_THEME_CLASSES,
  SCREEN_READER_ANNOUNCEMENTS,
} from '../types/divTableConstants'
import { announceToScreenReader, classNames, getGridColumnCount } from '../utils/divTableUtils'

import { DataGridRow } from './DivTableRow' // Component renamed internally

import type { DataGridBodyProps } from '../types/divTableTypes'
import type { DragEndEvent } from '@dnd-kit/core';

/**
 * Table Body Component with Virtualization
 * 
 * @example
 * ```tsx
 * <DataGridBody
 *   table={table}
 *   enableVirtualization={true}
 *   enableDragDrop={false}
 *   estimatedRowHeight={50}
 *   overscanCount={5}
 * />
 * ```
 */
export function DataGridBody<TData>({
  table,
  enableVirtualization = false,
  enableDragDrop = false,
  estimatedRowHeight = 50,
  overscanCount = 5,
  onRowReorder,
  dragHandlePosition = 'left',
  enableComplexCells = false,
}: DataGridBodyProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const rows = table.getRowModel().rows

  // ============================================================================
  // Virtualization Setup
  // ============================================================================

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: overscanCount,
    enabled: enableVirtualization,
  })

  const virtualItems = (enableVirtualization && rowVirtualizer)
    ? rowVirtualizer.getVirtualItems()
    : rows.map((_, index) => ({
        index,
        start: index * estimatedRowHeight,
        size: estimatedRowHeight,
        end: (index + 1) * estimatedRowHeight,
        key: index,
      }))

  // Get consistent column count for grid layout
  const gridColumnCount = getGridColumnCount(table)

  // ============================================================================
  // Drag & Drop Handlers
  // ============================================================================

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {return}

    const oldIndex = rows.findIndex((row) => row.id === active.id)
    const newIndex = rows.findIndex((row) => row.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {return}

    // Call parent callback
    onRowReorder?.(oldIndex, newIndex)

    // Announce to screen readers
    announceToScreenReader(
      SCREEN_READER_ANNOUNCEMENTS.ROW_MOVED(oldIndex + 1, newIndex + 1)
    )

    // Log action
    logger.debug('Row reordered', {
      component: COMPONENT_NAMES.DATA_GRID_BODY,
      from: oldIndex,
      to: newIndex,
    })
  }

  // ============================================================================
  // Render: With Drag & Drop
  // ============================================================================

  if (enableDragDrop) {
    return (
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div
          ref={parentRef}
          role={ARIA_ROLE_ROWGROUP}
          className={classNames('data-grid-body', TABLE_THEME_CLASSES.body)}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridColumnCount}, minmax(0, 1fr))`,
            gridColumn: '1 / -1',
            height: enableVirtualization && rowVirtualizer 
              ? `${rowVirtualizer.getTotalSize()}px` 
              : 'auto',
            overflow: enableVirtualization ? 'auto' : 'visible',
            position: 'relative',
            gap: 0,
          }}
        >
          <SortableContext
            items={rows.map((row) => row.id)}
            strategy={verticalListSortingStrategy}
          >
            {virtualItems.map((virtualItem) => {
              const row = rows[virtualItem.index]
              if (!row) {return null}

              return (
                <DataGridRow
                  key={row.id}
                  row={row}
                  virtualRow={virtualItem as VirtualItem}
                  enableDragDrop={true}
                  dragHandlePosition={dragHandlePosition}
                  enableComplexCells={enableComplexCells}
                />
              )
            })}
          </SortableContext>
        </div>
      </DndContext>
    )
  }

  // ============================================================================
  // Render: Without Drag & Drop (Simple)
  // ============================================================================

  return (
    <div
      ref={parentRef}
      role={ARIA_ROLE_ROWGROUP}
      className={classNames('data-grid-body', TABLE_THEME_CLASSES.body)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumnCount}, minmax(0, 1fr))`,
        gridColumn: '1 / -1',
        height: enableVirtualization && rowVirtualizer 
          ? `${rowVirtualizer.getTotalSize()}px` 
          : 'auto',
        overflow: enableVirtualization ? 'auto' : 'visible',
        position: 'relative',
        gap: 0,
      }}
    >
      {virtualItems.map((virtualItem) => {
        const row = rows[virtualItem.index]
        if (!row) {return null}

        return (
          <DataGridRow
            key={row.id}
            row={row}
            virtualRow={virtualItem as VirtualItem}
            enableDragDrop={false}
            enableComplexCells={enableComplexCells}
          />
        )
      })}
    </div>
  )
}

