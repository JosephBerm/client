/**
 * Chart Hooks
 *
 * @module charts/hooks
 */

export { useChartColors, getColorByIndex, generatePalette } from './useChartColors'
export type { ChartColors } from './useChartColors'

export {
	useChartResponsive,
	useReducedMotion,
	getInnerDimensions,
	getResponsiveMargin,
	getResponsiveConfig,
	BREAKPOINTS,
} from './useChartResponsive'
export type { ResponsiveChartConfig, Breakpoint, ChartMargin } from './useChartResponsive'

export { useChartValueFormatter } from './useChartValueFormatter'
export type { ChartValueType } from './useChartValueFormatter'
