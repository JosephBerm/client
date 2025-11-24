/**
 * DataGrid Utility Functions
 * 
 * Reusable utility functions for data grid logic, calculations, and transformations.
 * Follows functional programming principles with pure functions.
 * 
 * @module dataGridUtils
 */


import {
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  FOCUSABLE_ELEMENTS_SELECTOR,
} from '../types/divTableConstants'

import type { AriaSort, PaginationRange } from '../types/divTableTypes'
import type { Column, PaginationState } from '@tanstack/react-table'

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Sanitize and trim string input
 * @param value - Unknown input value
 * @returns Sanitized string
 */
export function sanitizeString(value: unknown): string {
  return String(value || '').trim()
}

/**
 * Truncate string to max length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {return str}
  return `${str.slice(0, maxLength - 3)}...`
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Clamp number between min and max
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Check if value is a positive number
 * @param value - Unknown value
 * @returns True if positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0
}

/**
 * Check if value is a valid page size
 * @param size - Page size to validate
 * @returns True if valid
 */
export function isValidPageSize(size: number): boolean {
  return typeof size === 'number' && size >= MIN_PAGE_SIZE && size <= MAX_PAGE_SIZE
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Check if value is a valid non-empty array
 * @param arr - Unknown array
 * @returns True if valid array
 */
export function isValidArray(arr: unknown): arr is unknown[] {
  return Array.isArray(arr) && arr.length > 0
}

/**
 * Normalize value to array, returning empty array if invalid
 * @param arr - Input array or unknown
 * @returns Normalized array
 */
export function normalizeArray<T>(arr: T[] | unknown): T[] {
  return Array.isArray(arr) ? arr : []
}

/**
 * Move array element from one index to another
 * @param array - Input array
 * @param fromIndex - Source index
 * @param toIndex - Destination index
 * @returns New array with element moved
 */
/**
 * Move array element from one index to another
 * @param array - Input array
 * @param fromIndex - Source index
 * @param toIndex - Destination index
 * @returns New array with element moved
 */
export function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  // Validate indices
  if (fromIndex < 0 || fromIndex >= array.length) {
    // Note: Using console.warn instead of logger to avoid circular dependency
    // This is a pure utility function that should not depend on logger
    if (process.env.NODE_ENV === 'development') {
      console.warn('arrayMove: Invalid fromIndex', { fromIndex, length: array.length })
    }
    return array // Return unchanged
  }
  if (toIndex < 0 || toIndex >= array.length) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('arrayMove: Invalid toIndex', { toIndex, length: array.length })
    }
    return array // Return unchanged
  }
  if (fromIndex === toIndex) {
    return array // No move needed
  }

  const newArray = [...array]
  const [removed] = newArray.splice(fromIndex, 1)
  newArray.splice(toIndex, 0, removed)
  return newArray
}

// ============================================================================
// Pagination Calculations
// ============================================================================

/**
 * Calculate total items count
 * Handles both server-side and client-side pagination
 * 
 * @param propTotalItems - Total items from props (server-side)
 * @param manualPagination - Is pagination manual (server-side)?
 * @param pageCount - Total page count (server-side)
 * @param pagination - Current pagination state
 * @param filteredRowCount - Filtered row count (client-side)
 * @returns Total items count
 */
export function calculateTotalItems(
  propTotalItems: number | undefined,
  manualPagination: boolean,
  pageCount: number | undefined,
  pagination: PaginationState | undefined,
  filteredRowCount: number
): number {
  // Priority 1: Use explicit totalItems prop (most accurate for server-side)
  if (propTotalItems !== undefined && isPositiveNumber(propTotalItems)) {
    return propTotalItems
  }

  // Priority 2: Calculate from pageCount (server-side approximation)
  if (manualPagination && pageCount !== undefined && pagination) {
    return pageCount * pagination.pageSize
  }

  // Priority 3: Use filtered row count (client-side)
  return filteredRowCount
}

/**
 * Calculate last page index
 * @param totalItems - Total number of items
 * @param pageSize - Items per page
 * @returns Last page index (0-based)
 */
export function calculateLastPageIndex(totalItems: number, pageSize: number): number {
  if (totalItems === 0 || pageSize === 0) {return 0}
  return Math.max(Math.ceil(totalItems / pageSize) - 1, 0)
}

/**
 * Calculate pagination range for display (e.g., "Showing 11-20 of 100")
 * @param pageIndex - Current page index (0-based)
 * @param pageSize - Items per page
 * @param totalItems - Total number of items
 * @returns Start and end indices for display
 */
export function calculatePaginationRange(
  pageIndex: number,
  pageSize: number,
  totalItems: number
): PaginationRange {
  if (totalItems === 0) {
    return { start: 0, end: 0 }
  }

  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalItems)

  return { start, end }
}

// ============================================================================
// Column Width Calculations
// ============================================================================

/**
 * Calculate column widths based on column definitions
 * @param columns - Column definitions
 * @param containerWidth - Container width (px)
 * @returns CSS grid template columns string
 */
export function calculateColumnWidths(
  columns: Array<{ size?: number; minSize?: number; maxSize?: number }>,
  containerWidth: number
): string {
  const totalFlex = columns.reduce((sum, col) => sum + (col.size || 1), 0)

  return columns
    .map((col) => {
      const size = col.size || 1
      const width = (size / totalFlex) * containerWidth
      const minWidth = col.minSize || 100
      const maxWidth = col.maxSize || Infinity

      const finalWidth = clamp(width, minWidth, maxWidth)
      return `${finalWidth}px`
    })
    .join(' ')
}

// ============================================================================
// Grid Layout Utilities
// ============================================================================

/**
 * Get the consistent grid column count for a table
 * Returns the number of visible leaf columns that should be rendered in the grid
 * 
 * IMPORTANT: Use this function consistently across all grid layout calculations
 * to prevent misalignment issues when columns are hidden/shown dynamically
 * 
 * @param table - The TanStack Table instance
 * @returns The number of visible columns to use in CSS Grid template
 * 
 * @example
 * ```ts
 * const columnCount = getGridColumnCount(table)
 * gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
 * ```
 */
export function getGridColumnCount(table: any): number {
  // Use getVisibleLeafColumns which correctly handles:
  // - Hidden columns (excluded from count)
  // - Column groups (only counts leaf columns, not group headers)
  // - Dynamic column visibility changes
  const visibleColumns = table.getVisibleLeafColumns()
  return visibleColumns.length || 0
}

// ============================================================================
// ARIA Utilities
// ============================================================================

/**
 * Get ARIA sort state from column sort
 * @param column - TanStack Table column
 * @returns ARIA sort attribute value
 */
export function getAriaSortState(column: Column<any>): AriaSort {
  const sort = column.getIsSorted()
  if (sort === 'asc') {return 'ascending'}
  if (sort === 'desc') {return 'descending'}
  return 'none'
}

/**
 * Get accessible sort label for column
 * @param column - TanStack Table column
 * @param columnName - Column name for display
 * @returns Accessible label describing sort state
 */
export function getSortLabel(column: Column<any>, columnName: string): string {
  const sort = column.getIsSorted()
  
  if (sort === 'asc') {
    return `${columnName}, sorted ascending. Click to sort descending.`
  }
  
  if (sort === 'desc') {
    return `${columnName}, sorted descending. Click to clear sort.`
  }
  
  return `${columnName}, not sorted. Click to sort ascending.`
}

/**
 * Generate ARIA attributes for table container
 * @param totalRows - Total number of rows (including header)
 * @param columnCount - Number of columns
 * @param isLoading - Is table loading?
 * @param ariaLabel - Table label
 * @returns ARIA attributes object
 */
export function generateTableARIA(
  totalRows: number,
  columnCount: number,
  isLoading: boolean,
  ariaLabel: string
) {
  return {
    role: 'grid' as const,
    'aria-label': ariaLabel,
    'aria-rowcount': totalRows + 1, // +1 for header
    'aria-colcount': columnCount,
    'aria-busy': isLoading,
  }
}

/**
 * Generate ARIA attributes for header cell
 * @param column - TanStack Table column
 * @param columnIndex - Column index (0-based)
 * @returns ARIA attributes object
 */
export function generateHeaderCellARIA(column: Column<any>, columnIndex: number) {
  const ariaSort = getAriaSortState(column)

  return {
    role: 'columnheader' as const,
    'aria-colindex': columnIndex + 1, // 1-based
    'aria-sort': ariaSort,
    tabIndex: 0,
  }
}

/**
 * Generate ARIA attributes for data row
 * @param rowIndex - Row index (0-based)
 * @param isSelected - Is row selected?
 * @param isExpanded - Is row expanded?
 * @returns ARIA attributes object
 */
export function generateRowARIA(
  rowIndex: number,
  isSelected: boolean,
  isExpanded?: boolean
) {
  return {
    role: 'row' as const,
    'aria-rowindex': rowIndex + 2, // +2 for header (1-based)
    'aria-selected': isSelected ? true : undefined,
    'aria-expanded': isExpanded !== undefined ? isExpanded : undefined,
  }
}

/**
 * Generate ARIA attributes for data cell
 * @param columnIndex - Column index (0-based)
 * @returns ARIA attributes object
 */
export function generateCellARIA(columnIndex: number) {
  return {
    role: 'gridcell' as const,
    'aria-colindex': columnIndex + 1, // 1-based
  }
}

// ============================================================================
// Accessibility Announcements
// ============================================================================

/**
 * Announce message to screen readers using live region
 * Creates a temporary live region, announces, then removes
 * 
 * @param message - Message to announce
 * @param priority - ARIA live priority
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only' // Visually hidden
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement (giving screen readers time to read)
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// ============================================================================
// Keyboard Navigation Utilities
// ============================================================================

/**
 * Check if element is an input element (to avoid interfering with typing)
 * @param target - Event target
 * @returns True if input element
 */
export function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {return false}
  
  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

/**
 * Get all focusable elements within container
 * @param container - Container element
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR))
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Debounce function execution
 * @param func - Function to debounce
 * @param wait - Wait time (ms)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {clearTimeout(timeout)}
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function execution
 * @param func - Function to throttle
 * @param limit - Time limit (ms)
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============================================================================
// CSS Class Utilities
// ============================================================================

/**
 * Conditionally join class names (like classnames library but simpler)
 * @param classes - Object with class names as keys and boolean conditions as values
 * @returns Joined class string
 */
export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate column definitions
 * @param columns - Column definitions
 * @returns True if valid
 */
export function validateColumns(columns: unknown): boolean {
  if (!Array.isArray(columns) || columns.length === 0) {
    return false
  }

  return columns.every(
    (col) =>
      col !== null &&
      typeof col === 'object' &&
      ('accessorKey' in col || 'id' in col || 'header' in col)
  )
}

/**
 * Validate data array
 * @param data - Data array
 * @returns True if valid
 */
export function validateData(data: unknown): boolean {
  return Array.isArray(data)
}

