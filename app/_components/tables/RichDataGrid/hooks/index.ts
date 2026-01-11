/**
 * RichDataGrid Hooks Barrel Export
 *
 * @module Hooks
 */

export { useRichDataGrid } from './useRichDataGrid'
export type { UseRichDataGridOptions } from './useRichDataGrid'

// Note: useClickOutside and useEscapeKey are shared hooks - import from @_shared
// They are re-exported from the main RichDataGrid barrel for convenience

export { useGridUrlState } from './useGridUrlState'
export type { GridUrlStateConfig, GridUrlState, UseGridUrlStateReturn } from './useGridUrlState'

export { useRangeSelection } from './useRangeSelection'
export type { UseRangeSelectionOptions, UseRangeSelectionReturn } from './useRangeSelection'

export { useKeyboardNavigation } from './useKeyboardNavigation'
export type { UseKeyboardNavigationOptions, UseKeyboardNavigationReturn } from './useKeyboardNavigation'
