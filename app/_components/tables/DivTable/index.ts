/**
 * DivTable - Barrel Export
 * 
 * Centralized exports for the div-based table implementation.
 * 
 * @module DivTable
 */

// Main Component
export { DivTable } from './DivTable'
export type { DivTableProps } from './types/divTableTypes'

// Sub-Components
export { DivTableHeader } from './components/DivTableHeader'
export { DivTableBody } from './components/DivTableBody'
export { DivTableRow } from './components/DivTableRow'
export { DivTableCell } from './components/DivTableCell'
export { DivTablePagination } from './components/DivTablePagination'
export { MobileCardList } from './components/MobileCardList'
export { TableErrorBoundary } from './components/TableErrorBoundary'

// Types
export type {
  TableFeatureToggles,
  TableManualModes,
  CellPosition,
  KeyboardNavState,
  AriaSort,
  TableRole,
  PaginationButtonConfig,
  ServerPaginationMeta,
  PaginationRange,
  PerformanceMetrics,
  DivTableContextValue,
  MobileCardProps,
  DivTableHeaderProps,
  DivTableBodyProps,
  DivTableRowProps,
  DivTableCellProps,
} from './types/divTableTypes'

// Constants
export {
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  VIRTUALIZATION_THRESHOLD,
  DEFAULT_ROW_HEIGHT,
  DEFAULT_OVERSCAN_COUNT,
  MOBILE_BREAKPOINT,
  BREAKPOINTS,
  ARIA_ROLE_GRID,
  ARIA_ROLE_TABLE,
  ARIA_ROLE_GRIDCELL,
  TABLE_ERROR_MESSAGES,
  TABLE_THEME_CLASSES,
  FOCUSABLE_ELEMENTS_SELECTOR,
} from './types/divTableConstants'

// Utilities
export {
  calculateTotalItems,
  calculateLastPageIndex,
  calculatePaginationRange,
  generateTableARIA,
  generateHeaderCellARIA,
  generateRowARIA,
  generateCellARIA,
  getAriaSortState,
  getSortLabel,
  announceToScreenReader,
  validateColumns,
  validateData,
  classNames,
} from './utils/divTableUtils'

// Hooks
export { useMobileDetection } from './hooks/useMobileDetection'
export { usePerformanceBudget } from './hooks/usePerformanceBudget'
export { useKeyboardNav } from './hooks/useKeyboardNav'
export { useFocusManagement } from './hooks/useFocusManagement'

// Re-export TanStack Table types for convenience
export type { ColumnDef, Row, Table, Cell } from '@tanstack/react-table'

