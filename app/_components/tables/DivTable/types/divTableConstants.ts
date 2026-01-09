/**
 * DataGrid Constants
 * 
 * Centralized constants for data grid configuration, following DRY principles.
 * All magic numbers and strings are defined here for maintainability.
 * 
 * @module dataGridConstants
 */

import type { ResponsiveBreakpoints, TableThemeClasses } from './divTableTypes'

// ============================================================================
// Pagination Constants
// ============================================================================

/**
 * Default page size options for table pagination
 * Updated to include larger sizes for > 100 rows requirement
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100, 200, 500] as const

/**
 * Default page size
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Minimum allowed page size
 */
export const MIN_PAGE_SIZE = 1

/**
 * Maximum allowed page size
 */
export const MAX_PAGE_SIZE = 500

// ============================================================================
// Virtualization Constants
// ============================================================================

/**
 * Threshold for enabling virtualization (number of rows)
 */
export const VIRTUALIZATION_THRESHOLD = 100

/**
 * Default estimated row height for virtualization (px)
 */
export const DEFAULT_ROW_HEIGHT = 50

/**
 * Default overscan count (rows to render outside viewport)
 */
export const DEFAULT_OVERSCAN_COUNT = 5

/**
 * Minimum row height (px)
 */
export const MIN_ROW_HEIGHT = 30

/**
 * Maximum row height (px)
 */
export const MAX_ROW_HEIGHT = 200

// ============================================================================
// Performance Constants
// ============================================================================

/**
 * Performance budget: Max render time (ms)
 */
export const PERFORMANCE_BUDGET_RENDER_TIME = 100

/**
 * Performance budget: Max memory usage (MB)
 */
export const PERFORMANCE_BUDGET_MEMORY = 50

/**
 * Performance budget: Target FPS
 */
export const TARGET_FPS = 60

/**
 * Performance budget: Frame time budget (ms) = 1000ms / 60fps
 */
export const FRAME_TIME_BUDGET = 16

// ============================================================================
// Responsive Breakpoints
// ============================================================================

/**
 * Responsive breakpoints (px)
 * Aligned with Tailwind CSS and DaisyUI defaults
 */
export const BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 320,   // Extra small phones
  sm: 640,   // Small tablets / large phones
  md: 768,   // Tablets
  lg: 1024,  // Desktops
  xl: 1280,  // Large desktops
  '2xl': 1536, // Extra large desktops
}

/**
 * MAANG-level responsive breakpoint for card vs table view
 * 
 * **Design Philosophy (Linear, Notion, Stripe pattern):**
 * - Card view: < 1024px (mobile + tablet) - Optimized for touch, vertical scanning
 * - Table view: ≥ 1024px (desktop) - Where columns fit comfortably
 * 
 * This is more elegant than:
 * - Horizontal scroll (not native feeling)
 * - Truncating columns (bad UX, loses context)
 * - Hiding columns (loses data)
 * 
 * Card view provides:
 * - Full data visibility at all screen sizes
 * - Better touch target sizes on tablet
 * - Natural vertical scrolling pattern
 * - Clean, scannable layout
 */
export const CARD_VIEW_BREAKPOINT = BREAKPOINTS.lg // 1024px

// ============================================================================
// ARIA Constants
// ============================================================================

/**
 * ARIA role for interactive tables
 */
export const ARIA_ROLE_GRID = 'grid' as const

/**
 * ARIA role for read-only tables
 */
export const ARIA_ROLE_TABLE = 'table' as const

/**
 * ARIA role for rows
 */
export const ARIA_ROLE_ROW = 'row' as const

/**
 * ARIA role for row groups
 */
export const ARIA_ROLE_ROWGROUP = 'rowgroup' as const

/**
 * ARIA role for column headers
 */
export const ARIA_ROLE_COLUMNHEADER = 'columnheader' as const

/**
 * ARIA role for grid cells (interactive)
 */
export const ARIA_ROLE_GRIDCELL = 'gridcell' as const

/**
 * ARIA role for table cells (read-only)
 */
export const ARIA_ROLE_CELL = 'cell' as const

// ============================================================================
// Messages
// ============================================================================

/**
 * Default empty table message
 */
export const DEFAULT_EMPTY_MESSAGE = 'No data available'

/**
 * Default loading message
 */
export const DEFAULT_LOADING_MESSAGE = 'Loading...'

/**
 * Error messages for table operations
 */
export const TABLE_ERROR_MESSAGES = {
  INVALID_COLUMNS: 'DataGrid rendered with invalid or empty columns array.',
  INVALID_DATA: 'DataGrid rendered with invalid data array. Defaulting to empty array.',
  INVALID_COLUMN_ID: 'Attempted to filter with an invalid column ID.',
  FETCH_ERROR: 'Failed to load table data.',
  DRAG_DROP_ERROR: 'Failed to reorder rows.',
  VIRTUALIZATION_ERROR: 'Virtualization encountered an error.',
  RENDER_ERROR: 'Table rendering failed.',
} as const

/**
 * Announcement messages for screen readers
 */
export const SCREEN_READER_ANNOUNCEMENTS = {
  SORTED_ASC: (columnName: string) => `Sorted by ${columnName} in ascending order`,
  SORTED_DESC: (columnName: string) => `Sorted by ${columnName} in descending order`,
  SORT_CLEARED: (columnName: string) => `Sorting cleared for ${columnName}`,
  FILTER_APPLIED: (columnName: string) => `Filter applied to ${columnName}`,
  FILTER_CLEARED: (columnName: string) => `Filter cleared for ${columnName}`,
  PAGE_CHANGED: (page: number, total: number) => `Page ${page} of ${total} loaded`,
  ROW_MOVED: (from: number, to: number) => `Row moved from position ${from} to position ${to}`,
  LOADING: 'Table loading',
  LOADED: 'Table loaded',
  ERROR: 'An error occurred while loading the table',
} as const

// ============================================================================
// Component Names (for logging)
// ============================================================================

/**
 * Component names for structured logging
 */
export const COMPONENT_NAMES = {
  DATA_GRID: 'DataGrid',
  DATA_GRID_HEADER: 'DataGridHeader',
  DATA_GRID_BODY: 'DataGridBody',
  DATA_GRID_ROW: 'DataGridRow',
  DATA_GRID_CELL: 'DataGridCell',
  DATA_GRID_PAGINATION: 'DataGridPagination',
  MOBILE_CARD: 'MobileCard',
  TABLE_ERROR_BOUNDARY: 'TableErrorBoundary',
} as const

// ============================================================================
// Theme Classes (DaisyUI + Tailwind)
// ============================================================================

/**
 * Theme class names for table elements
 * Using DaisyUI semantic tokens for consistency
 */
export const TABLE_THEME_CLASSES: TableThemeClasses = {
  // Container - Subtle rounded corners, no border when inside card
  container: 'bg-base-100 rounded-lg overflow-hidden',
  
  // Header - Industry-standard: clear separation, good contrast, elegant styling
  header: 'bg-base-200 border-b-2 border-base-300',
  headerCell: 'px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-base-content/80 select-none',
  
  // Body
  body: 'bg-base-100',
  bodyRow: 'border-b border-base-200/50 hover:bg-base-200/40 transition-colors duration-150',
  bodyRowEven: 'bg-base-100',
  bodyRowSelected: 'bg-primary/10 border-l-4 border-l-primary',
  bodyCell: 'px-4 py-3.5 text-sm text-base-content',
  
  // States
  loading: 'opacity-50 pointer-events-none',
  dragging: 'opacity-50 cursor-grabbing',
  
  // Interactive
  sortable: 'cursor-pointer hover:bg-base-300/60 active:bg-base-300',
  focusVisible: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm',
  
  // Mobile Card - MAANG-level styling (Linear, Stripe pattern)
  // Note: Main styling now in MobileCardList component for better control
  mobileCard: 'card bg-base-100/80 backdrop-blur-sm shadow-md border border-base-300/50 rounded-2xl',
  mobileCardTitle: 'text-base font-semibold text-base-content tracking-tight',
  mobileCardLabel: 'text-xs font-medium uppercase tracking-wider text-base-content/50',
  mobileCardValue: 'text-sm font-medium text-base-content',
}

// ============================================================================
// Animation Constants
// ============================================================================

/**
 * Transition duration for animations (ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
} as const

/**
 * Easing functions for animations
 */
export const ANIMATION_EASING = {
  DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  IN: 'cubic-bezier(0.4, 0, 1, 1)',
  OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// ============================================================================
// Focusable Elements
// ============================================================================

/**
 * Selector for focusable elements (for focus management)
 */
export const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

// ============================================================================
// Keyboard Navigation Constants
// ============================================================================

/**
 * Keyboard shortcuts for table navigation
 */
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  TAB: 'Tab',
  SHIFT_TAB: 'Shift+Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  
  // Actions
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
} as const

// ============================================================================
// Drag & Drop Constants
// ============================================================================

/**
 * Drag handle size (px)
 */
export const DRAG_HANDLE_SIZE = 24

/**
 * Drag overlay opacity
 */
export const DRAG_OVERLAY_OPACITY = 0.5

/**
 * Drag collision detection algorithm
 */
export const DRAG_COLLISION_DETECTION = 'closestCenter' as const

// ============================================================================
// Bundle Size Targets (for monitoring)
// ============================================================================

/**
 * Bundle size targets (KB, gzipped)
 */
export const BUNDLE_SIZE_TARGETS = {
  CORE: 15,
  VIRTUALIZATION: 5,
  DRAG_DROP: 10,
  TOTAL: 30,
} as const

// ============================================================================
// Testing Constants
// ============================================================================

/**
 * Test IDs for integration testing
 */
export const TEST_IDS = {
  TABLE: 'data-grid',
  HEADER: 'data-grid-header',
  BODY: 'data-grid-body',
  ROW: 'data-grid-row',
  CELL: 'data-grid-cell',
  PAGINATION: 'data-grid-pagination',
  MOBILE_CARD: 'data-grid-mobile-card',
  DRAG_HANDLE: 'data-grid-drag-handle',
  LOADING_SPINNER: 'data-grid-loading',
  EMPTY_STATE: 'data-grid-empty',
  ERROR_STATE: 'data-grid-error',
} as const

/**
 * Coverage targets for testing
 */
export const COVERAGE_TARGETS = {
  UNIT: 85,
  INTEGRATION: 70,
  ACCESSIBILITY: 100,
} as const
