/**
 * DivTable - Div-Based Table Component
 * 
 * Modern, high-performance table component using <div> elements instead of <table>.
 * Built on TanStack Table v8 with virtualization, drag-drop, and mobile card views.
 * 
 * **Key Features:**
 * - Virtualization for > 100 rows (@tanstack/react-virtual)
 * - Drag-drop row reordering (@dnd-kit)
 * - Mobile-first responsive design with card views
 * - Complex cell content support (charts, nested components)
 * - Full WCAG AA accessibility with ARIA grid role
 * - React 19 concurrent features (useOptimistic, use)
 * - Performance optimized with memoization
 * 
 * @module DivTable
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { logger } from '@_core'

// Internal imports
import type { DivTableProps, CellPosition } from './types/divTableTypes'
import {
  COMPONENT_NAMES,
  DEFAULT_PAGE_SIZE,
  DEFAULT_ROW_HEIGHT,
  DEFAULT_OVERSCAN_COUNT,
  DEFAULT_EMPTY_MESSAGE,
  DEFAULT_LOADING_MESSAGE,
  TABLE_ERROR_MESSAGES,
  VIRTUALIZATION_THRESHOLD,
  MOBILE_BREAKPOINT,
  TABLE_THEME_CLASSES,
} from './types/divTableConstants'
import {
  validateColumns,
  validateData,
  normalizeArray,
  calculateTotalItems,
  generateTableARIA,
  announceToScreenReader,
  classNames,
} from './utils/divTableUtils'

// Component imports (will be implemented next)
import { DivTableHeader } from './components/DivTableHeader'
import { DivTableBody } from './components/DivTableBody'
import { DivTablePagination } from './components/DivTablePagination'
import { MobileCardList } from './components/MobileCardList'

// Hook imports
import { useMobileDetection } from './hooks/useMobileDetection'
import { usePerformanceBudget } from './hooks/usePerformanceBudget'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useFocusManagement } from './hooks/useFocusManagement'

/**
 * Main DivTable Component
 * 
 * @example
 * ```tsx
 * // Basic table
 * <DivTable
 *   columns={columns}
 *   data={data}
 *   ariaLabel="Users table"
 *   enableSorting
 * />
 * 
 * // With virtualization (auto-enabled for > 100 rows)
 * <DivTable
 *   columns={columns}
 *   data={largeDataset}
 *   ariaLabel="Large dataset"
 *   enableVirtualization
 * />
 * 
 * // With drag-drop
 * <DivTable
 *   columns={columns}
 *   data={data}
 *   ariaLabel="Sortable table"
 *   enableDragDrop
 *   onRowReorder={handleReorder}
 * />
 * ```
 */
export function DivTable<TData>({
  // Required
  columns,
  data,
  ariaLabel,

  // Feature toggles
  enableSorting = false,
  enableFiltering = false,
  enablePagination = false,
  enablePageSize = false,
  enableVirtualization = false,
  enableDragDrop = false,
  enableComplexCells = false,

  // Manual modes (server-side)
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,

  // Server-side props
  pageCount,
  totalItems: propTotalItems,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  columnFilters: controlledFilters,
  onColumnFiltersChange,

  // UI states
  isLoading = false,
  error = null,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,

  // Virtualization config
  estimatedRowHeight = DEFAULT_ROW_HEIGHT,
  overscanCount = DEFAULT_OVERSCAN_COUNT,

  // Drag-drop config
  onRowReorder,
  dragHandlePosition = 'left',

  // Mobile config
  mobileBreakpoint = MOBILE_BREAKPOINT,
  mobileCardRenderer,

  // Accessibility
  ariaDescribedBy,

  // Styling
  className,
  style,
}: DivTableProps<TData>) {
  // ============================================================================
  // Validation & Defensive Programming
  // ============================================================================

  // Validate columns
  if (!validateColumns(columns)) {
    logger.error(TABLE_ERROR_MESSAGES.INVALID_COLUMNS, {
      component: COMPONENT_NAMES.DIV_TABLE,
      columns,
    })
    return (
      <div role="alert" className="alert alert-error">
        <span>{TABLE_ERROR_MESSAGES.INVALID_COLUMNS}</span>
      </div>
    )
  }

  // Normalize data (allow empty arrays)
  const normalizedData = useMemo(() => {
    if (!validateData(data)) {
      logger.warn(TABLE_ERROR_MESSAGES.INVALID_DATA, {
        component: COMPONENT_NAMES.DIV_TABLE,
        data,
      })
      return []
    }
    return normalizeArray(data)
  }, [data])

  // ============================================================================
  // Refs
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null)
  const captionId = `${ariaLabel.replace(/\s+/g, '-')}-caption`

  // ============================================================================
  // State Management
  // ============================================================================

  // Local pagination state (client-side or uncontrolled)
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  // Local sorting state (client-side or uncontrolled)
  const [localSorting, setLocalSorting] = useState<SortingState>([])

  // Local filter state (client-side or uncontrolled)
  const [localFilters, setLocalFilters] = useState<ColumnFiltersState>([])

  // UI state
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null)

  // Determine actual state (controlled vs uncontrolled)
  const pagination = controlledPagination ?? localPagination
  const sorting = controlledSorting ?? localSorting
  const columnFilters = controlledFilters ?? localFilters

  // ============================================================================
  // Mobile Detection
  // ============================================================================

  const { isMobile } = useMobileDetection(mobileBreakpoint)

  // ============================================================================
  // TanStack Table Initialization
  // ============================================================================

  const table = useReactTable({
    data: normalizedData,
    columns,
    
    // State
    state: {
      pagination,
      sorting,
      columnFilters,
    },

    // State updaters
    onPaginationChange: onPaginationChange ?? setLocalPagination,
    onSortingChange: onSortingChange ?? setLocalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setLocalFilters,

    // Manual modes
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount,

    // Row models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,

    // Options
    enableSorting,
    enableFilters: enableFiltering,
    enableColumnFilters: enableFiltering,

    // Debug
    debugTable: process.env.NODE_ENV === 'development',
  })

  // ============================================================================
  // Computed Values
  // ============================================================================

  const rows = useMemo(() => table.getRowModel().rows, [table])
  
  const totalItemsCount = useMemo(
    () =>
      calculateTotalItems(
        propTotalItems,
        manualPagination,
        pageCount,
        pagination,
        table.getFilteredRowModel().rows.length
      ),
    [propTotalItems, manualPagination, pageCount, pagination, table]
  )

  // Auto-enable virtualization for large datasets
  const shouldVirtualize = useMemo(() => {
    return enableVirtualization || rows.length > VIRTUALIZATION_THRESHOLD
  }, [enableVirtualization, rows.length])

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  usePerformanceBudget(COMPONENT_NAMES.DIV_TABLE, {
    renderTime: 100, // ms
  })

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  const { focusCell, navigate, getCurrentPosition } = useKeyboardNav({
    tableRef: containerRef,
    rowCount: rows.length,
    columnCount: columns.length,
    enabled: !isMobile, // Disable on mobile
    enablePageNav: enablePagination,
    pageSize: pagination.pageSize,
    onCellFocus: useCallback((position: CellPosition) => {
      setFocusedCell(position)
      logger.debug('Cell focused', {
        component: COMPONENT_NAMES.DIV_TABLE,
        position,
      })
    }, []),
    onBoundaryReached: useCallback((direction: string) => {
      logger.debug('Navigation boundary reached', {
        component: COMPONENT_NAMES.DIV_TABLE,
        direction,
      })
    }, []),
  })

  // ============================================================================
  // Focus Management
  // ============================================================================

  useFocusManagement({
    containerRef,
    autoFocus: undefined, // Don't auto-focus by default
    saveFocusOnUnmount: false,
    restoreFocusOnMount: false,
  })

  // ============================================================================
  // Logging
  // ============================================================================

  useEffect(() => {
    logger.debug('DivTable initialized', {
      component: COMPONENT_NAMES.DIV_TABLE,
      columns: columns.length,
      rows: normalizedData.length,
      features: {
        sorting: enableSorting,
        filtering: enableFiltering,
        pagination: enablePagination,
        virtualization: shouldVirtualize,
        dragDrop: enableDragDrop,
      },
    })
  }, [
    columns.length,
    normalizedData.length,
    enableSorting,
    enableFiltering,
    enablePagination,
    shouldVirtualize,
    enableDragDrop,
  ])

  // ============================================================================
  // ARIA Attributes
  // ============================================================================

  const tableARIA = useMemo(
    () => ({
      ...generateTableARIA(
        totalItemsCount,
        columns.length,
        isLoading,
        ariaLabel
      ),
      ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
    }),
    [totalItemsCount, columns.length, isLoading, ariaLabel, ariaDescribedBy]
  )

  // ============================================================================
  // Announcements for Screen Readers
  // ============================================================================

  useEffect(() => {
    if (isLoading) {
      announceToScreenReader(DEFAULT_LOADING_MESSAGE)
    }
  }, [isLoading])

  useEffect(() => {
    if (error) {
      announceToScreenReader(`Error: ${error.message}`, 'assertive')
    }
  }, [error])

  // ============================================================================
  // Render: Error State
  // ============================================================================

  if (error) {
    return (
      <div role="alert" className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error.message}</span>
      </div>
    )
  }

  // ============================================================================
  // Render: Mobile Card View
  // ============================================================================

  if (isMobile && rows.length > 0) {
    return (
      <div
        ref={containerRef}
        className={classNames('div-table-mobile-container', className)}
        style={style}
      >
        <MobileCardList
          rows={rows}
          columns={columns}
          ariaLabel={ariaLabel}
          customRenderer={mobileCardRenderer}
        />
        {enablePagination && (
          <DivTablePagination
            table={table}
            totalItems={totalItemsCount}
            enablePageSize={enablePageSize}
          />
        )}
      </div>
    )
  }

  // ============================================================================
  // Render: Desktop Grid View
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className={classNames(
        'div-table-container',
        TABLE_THEME_CLASSES.container,
        isLoading && TABLE_THEME_CLASSES.loading,
        className
      )}
      style={style}
    >
      {/* Hidden caption for screen readers */}
      <div id={captionId} className="sr-only">
        {ariaLabel} with {totalItemsCount} rows and {columns.length} columns
      </div>

      {/* Main grid table */}
      <div
        {...tableARIA}
        aria-describedby={ariaDescribedBy || captionId}
        className="div-table"
        data-columns={columns.length}
      >
        {/* Header */}
        <DivTableHeader
          table={table}
          enableSorting={enableSorting}
          stickyHeader={true}
        />

        {/* Body */}
        {rows.length === 0 ? (
          // Empty state
          <div role="status" className="div-table-empty p-8 text-center">
            {typeof emptyMessage === 'string' ? (
              <p className="text-base-content/60">{emptyMessage}</p>
            ) : (
              emptyMessage
            )}
          </div>
        ) : (
          <DivTableBody
            table={table}
            enableVirtualization={shouldVirtualize}
            enableDragDrop={enableDragDrop}
            estimatedRowHeight={estimatedRowHeight}
            overscanCount={overscanCount}
            onRowReorder={onRowReorder}
            dragHandlePosition={dragHandlePosition}
            enableComplexCells={enableComplexCells}
          />
        )}
      </div>

      {/* Pagination */}
      {enablePagination && rows.length > 0 && (
        <DivTablePagination
          table={table}
          totalItems={totalItemsCount}
          enablePageSize={enablePageSize}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="div-table-loading-overlay absolute inset-0 flex items-center justify-center bg-base-100/50">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}
    </div>
  )
}

// Export for convenience
export type { DivTableProps }

