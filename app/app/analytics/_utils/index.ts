/**
 * Analytics Utilities Barrel Export
 *
 * Specialized formatting utilities for analytics dashboard display.
 * This barrel file is for EXTERNAL CONSUMERS ONLY.
 *
 * **IMPORTANT - Circular Dependency Prevention:**
 * Code WITHIN this folder should NOT import from this index.
 * Instead, use direct imports to the specific module files.
 *
 * **Architecture:**
 * - Extends @_lib formatters with analytics-specific abbreviated formats
 * - Pure functions with no side effects (tree-shakeable)
 *
 * @see @_lib for core formatting utilities
 * @module analytics/utils
 */

export {
	formatCurrencyAbbreviated,
	formatPercent,
	formatNumberAbbreviated,
	formatChartDate,
	formatPercentageChange,
} from './formatters'

export type { PercentageChangeResult } from './formatters'
