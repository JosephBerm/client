/**
 * DataGrid - Modern Data Grid Component
 * 
 * Industry-standard data grid component using <div> elements with ARIA grid role.
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
 * @module DataGrid
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
import type { DataGridProps, CellPosition } from '../DivTable/types/divTableTypes'
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
} from '../DivTable/types/divTableConstants'
import {
  validateColumns,
  validateData,
  normalizeArray,
  calculateTotalItems,
  generateTableARIA,
  announceToScreenReader,
  classNames,
  getGridColumnCount,
} from '../DivTable/utils/divTableUtils'

// Component imports
import { DataGridHeader } from '../DivTable/components/DivTableHeader'
import { DataGridBody } from '../DivTable/components/DivTableBody'
import { DataGridPagination } from '../DivTable/components/DivTablePagination'
import { MobileCardList } from '../DivTable/components/MobileCardList'

// Hook imports
import { useMobileDetection } from '../DivTable/hooks/useMobileDetection'
import { usePerformanceBudget } from '../DivTable/hooks/usePerformanceBudget'
import { useKeyboardNav } from '../DivTable/hooks/useKeyboardNav'
import { useFocusManagement } from '../DivTable/hooks/useFocusManagement'

/**
 * Main DataGrid Component
 * 
 * @example
 * ```tsx
 * // Basic grid
 * <DataGrid
 *   columns={columns}
 *   data={data}
 *   ariaLabel="Users grid"
 *   enableSorting
 * />
 * 
 * // With virtualization (auto-enabled for > 100 rows)
 * <DataGrid
 *   columns={columns}
 *   data={largeDataset}
 *   ariaLabel="Large dataset"
 *   enableVirtualization
 * />
 * 
 * // With drag-drop
 * <DataGrid
 *   columns={columns}
 *   data={data}
 *   ariaLabel="Sortable grid"
 *   enableDragDrop
 *   onRowReorder={handleReorder}
 * />
 * ```
 */
export function DataGrid<TData>({
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
}: DataGridProps<TData>) {
  // ============================================================================
  // Refs (must be called before any conditional returns)
  // ============================================================================

  const containerRef = useRef<HTMLDivElement | null>(null)
  const captionId = useMemo(() => `${ariaLabel.replace(/\s+/g, '-')}-caption`, [ariaLabel])

  // ============================================================================
  // State Management (must be called before any conditional returns)
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

  // ============================================================================
  // Validation & Data Normalization
  // ============================================================================

  // Validate columns (but don't return early - render error conditionally)
  const isValidColumns = useMemo(() => validateColumns(columns), [columns])

  // Normalize data (allow empty arrays)
  const normalizedData = useMemo<TData[]>(() => {
    if (!validateData(data)) {
      logger.warn(TABLE_ERROR_MESSAGES.INVALID_DATA, {
        component: COMPONENT_NAMES.DATA_GRID,
        data,
      })
      return []
    }
    return normalizeArray<TData>(data)
  }, [data])

  // ============================================================================
  // Mobile Detection (must be called before any conditional returns)
  // ============================================================================

  const { isMobile } = useMobileDetection(mobileBreakpoint)

  // ============================================================================
  // Determine actual state (controlled vs uncontrolled)
  // ============================================================================

  const pagination = controlledPagination ?? localPagination
  const sorting = controlledSorting ?? localSorting
  const columnFilters = controlledFilters ?? localFilters

  // ============================================================================
  // TanStack Table Initialization
  // ============================================================================

  const table = useReactTable<TData>({
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
  
  // Get consistent column count for grid layout
  const gridColumnCount = useMemo(() => getGridColumnCount(table), [table])
  
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

  usePerformanceBudget(COMPONENT_NAMES.DATA_GRID, {
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
        component: COMPONENT_NAMES.DATA_GRID,
        position,
      })
    }, []),
    onBoundaryReached: useCallback((direction: string) => {
      logger.debug('Navigation boundary reached', {
        component: COMPONENT_NAMES.DATA_GRID,
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
    logger.debug('DataGrid initialized', {
      component: COMPONENT_NAMES.DATA_GRID,
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
        gridColumnCount, // Use visible column count for accuracy
        isLoading,
        ariaLabel
      ),
      ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
    }),
    [totalItemsCount, gridColumnCount, isLoading, ariaLabel, ariaDescribedBy]
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
  // Render: Validation Error
  // ============================================================================

  if (!isValidColumns) {
    logger.error(TABLE_ERROR_MESSAGES.INVALID_COLUMNS, {
      component: COMPONENT_NAMES.DATA_GRID,
      columns,
    })
    return (
      <div role="alert" className="alert alert-error">
        <span>{TABLE_ERROR_MESSAGES.INVALID_COLUMNS}</span>
      </div>
    )
  }

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
        className={classNames('data-grid-mobile-container', className)}
        style={style}
      >
        <MobileCardList
          rows={rows}
          columns={columns}
          ariaLabel={ariaLabel}
          customRenderer={mobileCardRenderer}
        />
        {enablePagination && (
          <DataGridPagination
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
        'data-grid-container',
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
        aria-describedby={
          [ariaDescribedBy, captionId].filter(Boolean).join(' ') || undefined
        }
        className="data-grid w-full"
        data-columns={gridColumnCount}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridColumnCount}, minmax(0, 1fr))`,
          gap: 0,
        }}
      >
        {/* Header */}
        <DataGridHeader
          table={table}
          enableSorting={enableSorting}
          stickyHeader={true}
        />

        {/* Body */}
        {rows.length === 0 ? (
          // Empty state
          <div 
            role="status" 
            className="data-grid-empty col-span-full py-12 px-4 text-center"
          >
            {typeof emptyMessage === 'string' ? (
              <p className="text-base text-base-content/60 font-medium">{emptyMessage}</p>
            ) : (
              emptyMessage
            )}
          </div>
        ) : (
          <DataGridBody
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
        <DataGridPagination
          table={table}
          totalItems={totalItemsCount}
          enablePageSize={enablePageSize}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="data-grid-loading-overlay absolute inset-0 flex items-center justify-center bg-base-100/50">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}
    </div>
  )
}

// Export for convenience
export type { DataGridProps }

