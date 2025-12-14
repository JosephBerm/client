/**
 * DataGridPagination Component
 * 
 * Renders pagination controls with page size selector.
 * Supports both client-side and server-side pagination.
 * Full WCAG AA accessibility compliance.
 * 
 * @module DataGridPagination
 */

'use client'

import { useMemo } from 'react'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { logger } from '@_core'

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

import type { PaginationState, Table } from '@tanstack/react-table'

interface DataGridPaginationProps<TData> {
  table: Table<TData>
  totalItems: number
  enablePageSize?: boolean
  /**
   * Controlled pagination state from parent.
   * Using this prop ensures pagination UI stays in sync with controlled state.
   * If not provided, falls back to table.getState().pagination.
   */
  pagination?: PaginationState
  /**
   * Total page count from server (for server-side pagination).
   * If not provided, falls back to table.getPageCount().
   */
  serverPageCount?: number
}

/**
 * Pagination Component
 * 
 * Displays pagination controls with page size selector.
 * Supports both client-side and server-side (controlled) pagination.
 * 
 * **IMPORTANT**: For server-side pagination with controlled state,
 * pass the `pagination` prop directly from the parent component
 * to ensure the UI stays in sync with the controlled state.
 * 
 * @example
 * ```tsx
 * // Client-side pagination
 * <DataGridPagination
 *   table={table}
 *   totalItems={100}
 *   enablePageSize={true}
 * />
 * 
 * // Server-side pagination (controlled)
 * <DataGridPagination
 *   table={table}
 *   totalItems={100}
 *   pagination={pagination}
 *   serverPageCount={10}
 *   enablePageSize={true}
 * />
 * ```
 */
export function DataGridPagination<TData>({
  table,
  totalItems,
  enablePageSize = false,
  pagination: controlledPagination,
  serverPageCount,
}: DataGridPaginationProps<TData>) {
  // Use controlled pagination if provided, otherwise fall back to table state
  // This ensures sync with parent's controlled state for server-side pagination
  const { pageIndex, pageSize } = controlledPagination ?? table.getState().pagination
  
  // Use server page count if provided (for server-side pagination),
  // otherwise fall back to table's calculated page count
  const pageCount = serverPageCount ?? table.getPageCount()
  const lastPageIndex = calculateLastPageIndex(totalItems, pageSize)
  
  // Compute button disabled states based on controlled state
  // For server-side pagination, we can't rely on table.getCanPreviousPage/getCanNextPage
  // because TanStack Table's internal state may not be in sync with controlled state
  const isControlled = controlledPagination !== undefined
  const canPreviousPage = isControlled 
    ? pageIndex > 0 
    : table.getCanPreviousPage()
  const canNextPage = isControlled 
    ? pageIndex < pageCount - 1 
    : table.getCanNextPage()

  // ============================================================================
  // Pagination Range
  // ============================================================================

  const paginationRange = useMemo(
    () => calculatePaginationRange(pageIndex, pageSize, totalItems),
    [pageIndex, pageSize, totalItems]
  )

  // ============================================================================
  // Helpers
  // ============================================================================

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value)
    table.setPageSize(newSize)

    logger.debug('Page size changed', {
      component: COMPONENT_NAMES.DATA_GRID_PAGINATION,
      pageSize: newSize,
    })

    announceToScreenReader(`Page size changed to ${newSize} rows per page`)
  }

  // ============================================================================
  // Pagination Buttons Configuration
  // ============================================================================

  const navigationButtons = useMemo(
    () => {
      function announcePageChange(page: number, total: number) {
        announceToScreenReader(SCREEN_READER_ANNOUNCEMENTS.PAGE_CHANGED(page, total))
        
        logger.debug('Page changed', {
          component: COMPONENT_NAMES.DATA_GRID_PAGINATION,
          page,
          pageSize,
        })
      }

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

      return [
        {
          label: 'First',
          ariaLabel: 'Go to first page',
          icon: <ChevronsLeft className="w-4 h-4" />,
          onClick: goToFirstPage,
          disabled: !canPreviousPage,
        },
        {
          label: 'Previous',
          ariaLabel: 'Go to previous page',
          icon: <ChevronLeft className="w-4 h-4" />,
          onClick: goToPreviousPage,
          disabled: !canPreviousPage,
        },
        {
          label: 'Next',
          ariaLabel: 'Go to next page',
          icon: <ChevronRight className="w-4 h-4" />,
          onClick: goToNextPage,
          disabled: !canNextPage,
        },
        {
          label: 'Last',
          ariaLabel: 'Go to last page',
          icon: <ChevronsRight className="w-4 h-4" />,
          onClick: goToLastPage,
          disabled: !canNextPage,
        },
      ]
    },
    [table, pageIndex, pageCount, lastPageIndex, pageSize, canPreviousPage, canNextPage]
  )

  // ============================================================================
  // Render
  // ============================================================================

  // Hide pagination controls if no data
  if (totalItems === 0) {
    return (
      <div className="data-grid-pagination flex items-center justify-center p-4 border-t border-base-300">
        <div className="text-sm text-base-content/70" aria-live="polite" aria-atomic="true">
          No results to display
        </div>
      </div>
    )
  }

  return (
    <div className="data-grid-pagination flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-base-300">
      {/* Page info */}
      <div className="text-sm text-base-content/70 whitespace-nowrap" aria-live="polite" aria-atomic="true">
        Showing <span className="font-semibold">{paginationRange.start}</span> to{' '}
        <span className="font-semibold">{paginationRange.end}</span> of{' '}
        <span className="font-semibold">{totalItems}</span> results
      </div>

      {/* Navigation controls - responsive flex wrap */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
        {/* Page size selector */}
        {enablePageSize && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-select" className="text-sm text-base-content/70 whitespace-nowrap hidden sm:inline">
              Rows:
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="select select-bordered select-sm min-w-16"
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
        <div className="text-sm text-base-content/70 whitespace-nowrap">
          Page <span className="font-semibold">{pageIndex + 1}</span> of{' '}
          <span className="font-semibold">{Math.max(pageCount, 1)}</span>
        </div>
      </div>
    </div>
  )
}

