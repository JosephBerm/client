/**
 * Chart Utilities
 *
 * @module charts/utils
 */

export {
	formatCurrency,
	formatNumber,
	formatPercent,
	formatAxisDate,
	formatTooltipDate,
	formatTooltipValue,
	createYAxisFormatter,
	generateNiceTicks,
} from './formatters'

export {
	DEFAULT_MARGIN,
	COMPACT_MARGIN,
	MARGIN_WITH_LEGEND,
	ANIMATION_CONFIG,
	CHART_SIZES,
	AXIS_CONFIG,
	GRID_CONFIG,
	TOOLTIP_CONFIG,
	CHART_COLORS,
	SEQUENTIAL_COLORS,
	DIVERGING_COLORS,
	A11Y_CONFIG,
} from './constants'

export {
	downsampleLTTB,
	downsampleMinMax,
	memoizeChartData,
	shouldDownsample,
	measureRenderPerformance,
	debounce,
	throttle,
} from './performance'

export {
	generateDataTable,
	generateChartSummary,
	meetsContrastRequirement,
	getChartAriaAttributes,
	getKeyboardInstructions,
	COLOR_BLIND_SAFE_PALETTE,
	PATTERN_DEFINITIONS,
	generatePatternDef,
} from './accessibility'

export {
	exportToCSV,
	exportToPNG,
	exportToSVG,
	copyToClipboard,
} from './export'
