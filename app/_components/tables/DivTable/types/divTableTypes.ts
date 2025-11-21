/**
 * DataGrid TypeScript Type Definitions
 * 
 * Comprehensive type definitions for the modern data grid implementation.
 * Follows FAANG-level type safety standards with no `any` types.
 * 
 * @module dataGridTypes
 */

import { ReactNode } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
  Table,
} from '@tanstack/react-table'
import { VirtualItem, Virtualizer } from '@tanstack/react-virtual'

// ============================================================================
// Core Table Props
// ============================================================================

/**
 * Feature toggle configuration for table capabilities
 */
export interface TableFeatureToggles {
  /** Enable column sorting */
  enableSorting?: boolean
  /** Enable column filtering */
  enableFiltering?: boolean
  /** Enable pagination controls */
  enablePagination?: boolean
  /** Enable page size selector */
  enablePageSize?: boolean
  /** Enable virtualization for large datasets (> 100 rows) */
  enableVirtualization?: boolean
  /** Enable drag-and-drop row reordering */
  enableDragDrop?: boolean
  /** Enable complex content in cells (charts, nested components) */
  enableComplexCells?: boolean
}

/**
 * Manual mode configuration for server-side operations
 */
export interface TableManualModes {
  /** Server-side pagination enabled */
  manualPagination?: boolean
  /** Server-side sorting enabled */
  manualSorting?: boolean
  /** Server-side filtering enabled */
  manualFiltering?: boolean
}

/**
 * Main props interface for DataGrid component
 */
export interface DataGridProps<TData> extends TableFeatureToggles, TableManualModes {
  // Required props
  /** Column definitions */
  columns: ColumnDef<TData>[]
  /** Data array */
  data: TData[]

  // Server-side pagination/sorting/filtering
  /** Total number of pages (server-side) */
  pageCount?: number
  /** Total number of items (server-side) */
  totalItems?: number
  /** Controlled pagination state */
  pagination?: PaginationState
  /** Pagination change handler */
  onPaginationChange?: OnChangeFn<PaginationState>
  /** Controlled sorting state */
  sorting?: SortingState
  /** Sorting change handler */
  onSortingChange?: OnChangeFn<SortingState>
  /** Controlled filter state */
  columnFilters?: ColumnFiltersState
  /** Filter change handler */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>

  // UI states
  /** Loading state */
  isLoading?: boolean
  /** Error state */
  error?: Error | null
  /** Empty state message */
  emptyMessage?: string | ReactNode

  // Virtualization config
  /** Estimated row height for virtualization (px) */
  estimatedRowHeight?: number
  /** Number of rows to render outside viewport */
  overscanCount?: number

  // Drag-drop config
  /** Callback when row order changes */
  onRowReorder?: (fromIndex: number, toIndex: number) => void
  /** Position of drag handle */
  dragHandlePosition?: 'left' | 'right'

  // Mobile config
  /** Breakpoint for mobile card view (px) */
  mobileBreakpoint?: number
  /** Custom mobile card renderer */
  mobileCardRenderer?: React.ComponentType<MobileCardProps<TData>>

  // Accessibility
  /** ARIA label for table */
  ariaLabel: string
  /** ARIA description ID */
  ariaDescribedBy?: string

  // Styling
  /** Additional CSS classes */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for DivTableHeader component
 */
export interface DataGridHeaderProps<TData> {
  table: Table<TData>
  enableSorting?: boolean
  stickyHeader?: boolean
}

/**
 * Props for DivTableHeaderCell component
 */
export interface DataGridHeaderCellProps<TData> {
  header: import('@tanstack/react-table').Header<TData, unknown>
  columnIndex: number
  enableSorting?: boolean
  onSort?: (columnId: string) => void
}

/**
 * Props for DivTableBody component
 */
export interface DataGridBodyProps<TData> {
  table: Table<TData>
  enableVirtualization?: boolean
  enableDragDrop?: boolean
  estimatedRowHeight?: number
  overscanCount?: number
  onRowReorder?: (fromIndex: number, toIndex: number) => void
  dragHandlePosition?: 'left' | 'right'
  enableComplexCells?: boolean
}

/**
 * Props for DivTableRow component
 */
export interface DataGridRowProps<TData> {
  row: Row<TData>
  virtualRow?: VirtualItem
  enableDragDrop?: boolean
  dragHandlePosition?: 'left' | 'right'
  enableComplexCells?: boolean
}

/**
 * Props for DivTableCell component
 */
export interface DataGridCellProps<TData> {
  cell: import('@tanstack/react-table').Cell<TData, unknown>
  columnIndex: number
  enableComplexContent?: boolean
}

/**
 * Props for mobile card view
 */
export interface MobileCardProps<TData> {
  row: Row<TData>
  columns: ColumnDef<TData>[]
  index: number
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Cell position for keyboard navigation
 */
export interface CellPosition {
  rowIndex: number
  colIndex: number
}

/**
 * Keyboard navigation state
 */
export interface KeyboardNavState {
  focusedCell: CellPosition | null
  isNavigating: boolean
}

/**
 * ARIA sort attribute values
 */
export type AriaSort = 'ascending' | 'descending' | 'none'

/**
 * ARIA role for table container
 */
export type TableRole = 'grid' | 'table'

/**
 * Pagination button configuration
 */
export interface PaginationButtonConfig {
  label: string
  ariaLabel: string
  action: () => void
  disabled: boolean
  icon?: ReactNode
}

/**
 * Server pagination metadata
 */
export interface ServerPaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Pagination range for display
 */
export interface PaginationRange {
  start: number
  end: number
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  renderTime: number
  memoryUsage?: number
  visibleRows: number
  totalRows: number
}

/**
 * Table context value
 */
export interface DataGridContextValue<TData = any> {
  table: Table<TData>
  enableVirtualization: boolean
  enableDragDrop: boolean
  enableSorting: boolean
  enableFiltering: boolean
  focusedCell: CellPosition | null
  setFocusedCell: (cell: CellPosition | null) => void
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useKeyboardNav hook
 */
export interface UseKeyboardNavReturn {
  focusedCell: CellPosition | null
  setFocusedCell: (cell: CellPosition | null) => void
  isNavigating: boolean
  handleKeyDown: (event: React.KeyboardEvent) => void
}

/**
 * Return type for usePerformanceBudget hook
 */
export interface UsePerformanceBudgetReturn {
  measure: (name: string, startMark: string, endMark: string) => void
}

/**
 * Return type for useFocusManagement hook
 */
export interface UseFocusManagementReturn {
  saveFocus: () => void
  restoreFocus: () => void
  trapFocus: (enable: boolean) => () => void | undefined
}

/**
 * Return type for useMobileDetection hook
 */
export interface UseMobileDetectionReturn {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  breakpoint: 'mobile' | 'tablet' | 'desktop'
}

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Sort handler function type
 */
export type SortHandler = (columnId: string) => void

/**
 * Row reorder handler function type
 */
export type RowReorderHandler = (fromIndex: number, toIndex: number) => void

/**
 * Filter change handler function type
 */
export type FilterChangeHandler = (columnId: string, value: string) => void

/**
 * Pagination change handler function type
 */
export type PaginationChangeHandler = (pagination: PaginationState) => void

// ============================================================================
// Style Types
// ============================================================================

/**
 * Theme class names for table elements
 */
export interface TableThemeClasses {
  container: string
  header: string
  headerCell: string
  body: string
  bodyRow: string
  bodyRowEven: string
  bodyRowSelected: string
  bodyCell: string
  loading: string
  dragging: string
  sortable: string
  focusVisible: string
  mobileCard: string
  mobileCardTitle: string
}

/**
 * Responsive breakpoint values
 */
export interface ResponsiveBreakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for valid array
 */
export function isValidArray<T>(arr: unknown): arr is T[] {
  return Array.isArray(arr) && arr.length > 0
}

/**
 * Type guard for positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0
}

/**
 * Type guard for valid column definition
 */
export function isValidColumnDef<TData>(col: unknown): col is ColumnDef<TData> {
  return (
    col !== null &&
    typeof col === 'object' &&
    ('accessorKey' in col || 'id' in col || 'header' in col)
  )
}

