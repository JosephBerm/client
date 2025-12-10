/**
 * DataGridHeader Component
 * 
 * Renders data grid header with sortable columns and proper ARIA attributes.
 * Supports sticky header positioning and keyboard interaction.
 * 
 * @module DataGridHeader
 */

'use client'

import { flexRender } from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

import { logger } from '@_core'

import {
  ARIA_ROLE_ROWGROUP,
  ARIA_ROLE_ROW,
  COMPONENT_NAMES,
  TABLE_THEME_CLASSES,
  SCREEN_READER_ANNOUNCEMENTS,
} from '../types/divTableConstants'
import {
  generateHeaderCellARIA,
  getAriaSortState,
  getSortLabel,
  announceToScreenReader,
  classNames,
  getGridColumnCount,
} from '../utils/divTableUtils'

import type { DataGridHeaderProps } from '../types/divTableTypes'


/**
 * Table Header Component
 * 
 * @example
 * ```tsx
 * <DataGridHeader
 *   table={table}
 *   enableSorting={true}
 *   stickyHeader={true}
 * />
 * ```
 */
export function DataGridHeader<TData>({
  table,
  enableSorting = false,
  stickyHeader = true,
}: DataGridHeaderProps<TData>) {
  const headerGroups = table.getHeaderGroups()
  const gridColumnCount = getGridColumnCount(table)

  return (
    <div
      role={ARIA_ROLE_ROWGROUP}
      className={classNames(
        'data-grid-header',
        TABLE_THEME_CLASSES.header,
        stickyHeader && 'sticky top-0 z-10 shadow-sm'
      )}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumnCount}, minmax(0, 1fr))`,
        gridColumn: '1 / -1',
      }}
    >
      {headerGroups.map((headerGroup) => (
        <div
          key={headerGroup.id}
          role={ARIA_ROLE_ROW}
          aria-rowindex={1} // Header is always row 1
          className="data-grid-header-row contents"
        >
          {headerGroup.headers.map((header, columnIndex) => {
            const canSort = header.column.getCanSort() && enableSorting
            const isSorted = header.column.getIsSorted()
            const _ariaSort = getAriaSortState(header.column)
            const sortLabel = getSortLabel(
              header.column,
              typeof header.column.columnDef.header === 'string'
                ? header.column.columnDef.header
                : header.column.id
            )

            // ARIA attributes
            const headerARIA = generateHeaderCellARIA(header.column, columnIndex)

            // Click handler for sorting
            const handleClick = () => {
              if (!canSort) {return}

              const currentSort = header.column.getIsSorted()
              header.column.toggleSorting()

              // Announce to screen readers
              const columnName =
                typeof header.column.columnDef.header === 'string'
                  ? header.column.columnDef.header
                  : header.column.id

              if (currentSort === false) {
                announceToScreenReader(
                  SCREEN_READER_ANNOUNCEMENTS.SORTED_ASC(columnName)
                )
              } else if (currentSort === 'asc') {
                announceToScreenReader(
                  SCREEN_READER_ANNOUNCEMENTS.SORTED_DESC(columnName)
                )
              } else {
                announceToScreenReader(
                  SCREEN_READER_ANNOUNCEMENTS.SORT_CLEARED(columnName)
                )
              }

              // Log sort action
              logger.debug('Column sorted', {
                component: COMPONENT_NAMES.DATA_GRID_HEADER,
                columnId: header.column.id,
                direction: header.column.getIsSorted() || 'none',
              })
            }

            // Keyboard handler
            const handleKeyDown = (event: React.KeyboardEvent) => {
              if (!canSort) {return}

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick()
              }
            }

            return (
              <div
                key={header.id}
                {...headerARIA}
                role={canSort ? 'button' : 'columnheader'}
                onClick={canSort ? handleClick : undefined}
                onKeyDown={canSort ? handleKeyDown : undefined}
                tabIndex={canSort ? 0 : undefined}
                aria-label={sortLabel}
                className={classNames(
                  'data-grid-header-cell',
                  TABLE_THEME_CLASSES.headerCell,
                  canSort && TABLE_THEME_CLASSES.sortable,
                  TABLE_THEME_CLASSES.focusVisible
                )}
                data-sortable={canSort}
                data-sorted={isSorted || 'false'}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  {/* Header content */}
                  <span className="truncate">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </span>

                  {/* Sort indicator */}
                  {canSort && (
                    <span
                      className="sort-indicator shrink-0 text-base-content/50"
                      aria-hidden="true"
                      data-direction={isSorted || 'none'}
                    >
                      {isSorted === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5" />
                      ) : isSorted === 'desc' ? (
                        <ArrowDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

