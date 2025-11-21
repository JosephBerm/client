/**
 * DivTablePagination Component
 * 
 * Renders pagination controls with page size selector.
 * Supports both client-side and server-side pagination.
 * Full WCAG AA accessibility compliance.
 * 
 * @module DivTablePagination
 */

'use client'

import { useMemo } from 'react'
import type { Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  COMPONENT_NAMES,
  TABLE_THEME_CLASSES,
  SCREEN_READER_ANNOUNCEMENTS,
} from '../types/divTableConstants'
import {
  calculateLastPageIndex,
  calculatePaginationRange,
  announceToScreenReader,
  classNames,
} from '../utils/divTableUtils'
import { logger } from '@_core'

interface DivTablePaginationProps<TData> {
  table: Table<TData>
  totalItems: number
  enablePageSize?: boolean
}

/**
 * Pagination Component
 * 
 * @example
 * ```tsx
 * <DivTablePagination
 *   table={table}
 *   totalItems={100}
 *   enablePageSize={true}
 * />
 * ```
 */
export function DivTablePagination<TData>({
  table,
  totalItems,
  enablePageSize = false,
}: DivTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const lastPageIndex = calculateLastPageIndex(totalItems, pageSize)

  // ============================================================================
  // Pagination Range
  // ============================================================================

  const paginationRange = useMemo(
    () => calculatePaginationRange(pageIndex, pageSize, totalItems),
    [pageIndex, pageSize, totalItems]
  )

  // ============================================================================
  // Navigation Handlers
  // ============================================================================

  const goToFirstPage = () => {
    table.setPageIndex(0)
    announcePageChange(1, pageCount)
  }

  const goToPreviousPage = () => {
    table.previousPage()
    announcePageChange(pageIndex, pageCount)
  }

  const goToNextPage = () => {
    table.nextPage()
    announcePageChange(pageIndex + 2, pageCount)
  }

  const goToLastPage = () => {
    table.setPageIndex(lastPageIndex)
    announcePageChange(pageCount, pageCount)
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value)
    table.setPageSize(newSize)

    logger.debug('Page size changed', {
      component: COMPONENT_NAMES.DIV_TABLE,
      pageSize: newSize,
    })

    announceToScreenReader(`Page size changed to ${newSize} rows per page`)
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  function announcePageChange(page: number, total: number) {
    announceToScreenReader(SCREEN_READER_ANNOUNCEMENTS.PAGE_CHANGED(page, total))
    
    logger.debug('Page changed', {
      component: COMPONENT_NAMES.DIV_TABLE,
      page,
      pageSize,
    })
  }

  // ============================================================================
  // Pagination Buttons Configuration
  // ============================================================================

  const navigationButtons = useMemo(
    () => [
      {
        label: 'First',
        ariaLabel: 'Go to first page',
        icon: <ChevronsLeft className="w-4 h-4" />,
        onClick: goToFirstPage,
        disabled: !table.getCanPreviousPage(),
      },
      {
        label: 'Previous',
        ariaLabel: 'Go to previous page',
        icon: <ChevronLeft className="w-4 h-4" />,
        onClick: goToPreviousPage,
        disabled: !table.getCanPreviousPage(),
      },
      {
        label: 'Next',
        ariaLabel: 'Go to next page',
        icon: <ChevronRight className="w-4 h-4" />,
        onClick: goToNextPage,
        disabled: !table.getCanNextPage(),
      },
      {
        label: 'Last',
        ariaLabel: 'Go to last page',
        icon: <ChevronsRight className="w-4 h-4" />,
        onClick: goToLastPage,
        disabled: !table.getCanNextPage(),
      },
    ],
    [table, pageCount]
  )

  // ============================================================================
  // Render
  // ============================================================================

  // Hide pagination controls if no data
  if (totalItems === 0) {
    return (
      <div className="div-table-pagination flex items-center justify-center p-4 border-t border-base-300">
        <div className="text-sm text-base-content/70" aria-live="polite" aria-atomic="true">
          No results to display
        </div>
      </div>
    )
  }

  return (
    <div className="div-table-pagination flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
      {/* Page info */}
      <div className="text-sm text-base-content/70" aria-live="polite" aria-atomic="true">
        Showing <span className="font-semibold">{paginationRange.start}</span> to{' '}
        <span className="font-semibold">{paginationRange.end}</span> of{' '}
        <span className="font-semibold">{totalItems}</span> results
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        {enablePageSize && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-select" className="text-sm text-base-content/70">
              Rows per page:
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="select select-bordered select-sm"
              aria-label="Select number of rows per page"
            >
              {DEFAULT_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation buttons */}
        <div className="join">
          {navigationButtons.map((button) => (
            <button
              key={button.label}
              onClick={button.onClick}
              disabled={button.disabled}
              aria-label={button.ariaLabel}
              className={classNames(
                'join-item btn btn-sm',
                TABLE_THEME_CLASSES.focusVisible
              )}
              type="button"
            >
              {button.icon}
              <span className="sr-only">{button.label}</span>
            </button>
          ))}
        </div>

        {/* Page number display */}
        <div className="text-sm text-base-content/70">
          Page <span className="font-semibold">{pageIndex + 1}</span> of{' '}
          <span className="font-semibold">{Math.max(pageCount, 1)}</span>
        </div>
      </div>
    </div>
  )
}

