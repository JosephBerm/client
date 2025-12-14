/**
 * DataGrid - Barrel Export
 * 
 * Centralized exports for the modern data grid implementation.
 * Industry-standard naming convention for div-based tables.
 * 
 * @module DataGrid
 */

// Main Component (exported as DataGrid for industry-standard naming)
// Note: DataGrid is exported from '../DataGrid/index.ts' - this file exports sub-components only
export type { DataGridProps } from './types/divTableTypes'

// Sub-Components (exported with DataGrid naming)
export { DataGridHeader } from './components/DivTableHeader'
export { DataGridBody } from './components/DivTableBody'
export { DataGridRow } from './components/DivTableRow'
export { DataGridCell } from './components/DivTableCell'
export { DataGridPagination } from './components/DivTablePagination'
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
  DataGridContextValue,
  MobileCardProps,
  DataGridHeaderProps,
  DataGridBodyProps,
  DataGridRowProps,
  DataGridCellProps,
} from './types/divTableTypes'

// Constants
export {
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  VIRTUALIZATION_THRESHOLD,
  DEFAULT_ROW_HEIGHT,
  DEFAULT_OVERSCAN_COUNT,
  MOBILE_BREAKPOINT,
  CARD_VIEW_BREAKPOINT, // MAANG-level container-based responsive breakpoint
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

