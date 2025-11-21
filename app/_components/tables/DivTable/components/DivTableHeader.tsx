/**
 * DivTableHeader Component
 * 
 * Renders table header with sortable columns and proper ARIA attributes.
 * Supports sticky header positioning and keyboard interaction.
 * 
 * @module DivTableHeader
 */

'use client'

import { flexRender } from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { DivTableHeaderProps } from '../types/divTableTypes'
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
} from '../utils/divTableUtils'
import { logger } from '@_core'

/**
 * Table Header Component
 * 
 * @example
 * ```tsx
 * <DivTableHeader
 *   table={table}
 *   enableSorting={true}
 *   stickyHeader={true}
 * />
 * ```
 */
export function DivTableHeader<TData>({
  table,
  enableSorting = false,
  stickyHeader = true,
}: DivTableHeaderProps<TData>) {
  const headerGroups = table.getHeaderGroups()

  return (
    <div
      role={ARIA_ROLE_ROWGROUP}
      className={classNames(
        'div-table-header',
        TABLE_THEME_CLASSES.header,
        stickyHeader && 'sticky top-0 z-10'
      )}
    >
      {headerGroups.map((headerGroup) => (
        <div
          key={headerGroup.id}
          role={ARIA_ROLE_ROW}
          aria-rowindex={1} // Header is always row 1
          className="div-table-header-row"
          style={{
            display: 'contents', // Participate in parent grid
          }}
        >
          {headerGroup.headers.map((header, columnIndex) => {
            const canSort = header.column.getCanSort() && enableSorting
            const isSorted = header.column.getIsSorted()
            const ariaSort = getAriaSortState(header.column)
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
              if (!canSort) return

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
                component: COMPONENT_NAMES.DIV_TABLE_HEADER,
                columnId: header.column.id,
                direction: header.column.getIsSorted() || 'none',
              })
            }

            // Keyboard handler
            const handleKeyDown = (event: React.KeyboardEvent) => {
              if (!canSort) return

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick()
              }
            }

            return (
              <div
                key={header.id}
                {...headerARIA}
                onClick={canSort ? handleClick : undefined}
                onKeyDown={handleKeyDown}
                aria-label={sortLabel}
                className={classNames(
                  'div-table-header-cell',
                  TABLE_THEME_CLASSES.headerCell,
                  canSort && TABLE_THEME_CLASSES.sortable,
                  TABLE_THEME_CLASSES.focusVisible
                )}
                data-sortable={canSort}
                data-sorted={isSorted || 'false'}
              >
                <div className="flex items-center gap-2">
                  {/* Header content */}
                  <span className="flex-1">
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
                      className="sort-indicator"
                      aria-hidden="true"
                      data-direction={isSorted || 'none'}
                    >
                      {isSorted === 'asc' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : isSorted === 'desc' ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
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

