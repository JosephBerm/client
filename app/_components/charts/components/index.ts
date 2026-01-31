/**
 * Chart Components (Composition Layer)
 *
 * Shared components used across all chart types.
 *
 * @module charts/components
 */

export { ChartTooltip, ChartTooltipContainer } from './ChartTooltip'
export type { TooltipData } from './ChartTooltip'

export { ChartLegend, ChartLegendCompact } from './ChartLegend'
export type { LegendItem } from './ChartLegend'

export {
	ChartHeader,
	TimeRangeSelector,
	DEFAULT_TIME_RANGES,
} from './ChartHeader'
export type { TimeRangeOption } from './ChartHeader'

export { ChartEmptyState } from './ChartEmptyState'
export { ChartLoadingState, ChartLoadingCompact } from './ChartLoadingState'
export { ChartErrorBoundary } from './ChartErrorBoundary'
