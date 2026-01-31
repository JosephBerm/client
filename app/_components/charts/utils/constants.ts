/**
 * Chart Constants
 *
 * Shared constants for chart styling and configuration.
 *
 * @module charts/utils/constants
 */

/**
 * Default chart margins.
 * Provides space for axes and labels.
 */
export const DEFAULT_MARGIN = {
	top: 20,
	right: 20,
	bottom: 40,
	left: 50,
} as const

/**
 * Compact margins for smaller charts (sparklines, etc.)
 */
export const COMPACT_MARGIN = {
	top: 4,
	right: 4,
	bottom: 4,
	left: 4,
} as const

/**
 * Margins with space for legend at bottom.
 */
export const MARGIN_WITH_LEGEND = {
	top: 20,
	right: 20,
	bottom: 60,
	left: 50,
} as const

/**
 * Default animation configuration.
 */
export const ANIMATION_CONFIG = {
	/** Duration in milliseconds */
	duration: 300,
	/** Easing function */
	easing: 'easeInOut',
	/** Stagger delay between elements */
	staggerDelay: 50,
} as const

/**
 * Chart sizing defaults.
 */
export const CHART_SIZES = {
	/** Minimum chart height */
	minHeight: 200,
	/** Default chart height */
	defaultHeight: 300,
	/** Default sparkline height */
	sparklineHeight: 40,
	/** Default bar width */
	barWidth: 20,
	/** Bar padding ratio (0-1) */
	barPadding: 0.3,
} as const

/**
 * Axis configuration.
 */
export const AXIS_CONFIG = {
	/** Number of Y-axis ticks */
	numYTicks: 5,
	/** Number of X-axis ticks */
	numXTicks: 6,
	/** Tick label padding */
	tickPadding: 8,
	/** Axis line stroke width */
	strokeWidth: 1,
	/** Hide axis domain line */
	hideAxisLine: true,
	/** Hide zero tick */
	hideZero: false,
} as const

/**
 * Grid configuration.
 */
export const GRID_CONFIG = {
	/** Grid line stroke color (CSS variable) */
	stroke: 'oklch(var(--bc) / 0.1)',
	/** Grid line stroke width */
	strokeWidth: 1,
	/** Grid line dash array */
	strokeDasharray: '2,4',
} as const

/**
 * Tooltip configuration.
 */
export const TOOLTIP_CONFIG = {
	/** Offset from cursor */
	offsetX: 10,
	offsetY: 10,
	/** Z-index for tooltip */
	zIndex: 50,
} as const

/**
 * Color palette for multi-series charts.
 * Computed values for direct SVG use.
 */
export const CHART_COLORS = {
	primary: '#6366f1', // Indigo-500
	secondary: '#8b5cf6', // Violet-500
	accent: '#ec4899', // Pink-500
	success: '#22c55e', // Green-500
	warning: '#f59e0b', // Amber-500
	error: '#ef4444', // Red-500
	info: '#3b82f6', // Blue-500
	neutral: '#6b7280', // Gray-500
} as const

/**
 * Sequential color scale for heatmaps/gradients.
 */
export const SEQUENTIAL_COLORS = [
	'#eef2ff', // Indigo-50
	'#c7d2fe', // Indigo-200
	'#818cf8', // Indigo-400
	'#4f46e5', // Indigo-600
	'#3730a3', // Indigo-800
] as const

/**
 * Diverging color scale for positive/negative values.
 */
export const DIVERGING_COLORS = {
	negative: ['#fee2e2', '#fca5a5', '#ef4444'], // Red scale
	neutral: '#f3f4f6', // Gray-100
	positive: ['#bbf7d0', '#4ade80', '#22c55e'], // Green scale
} as const

/**
 * Accessibility-related constants.
 */
export const A11Y_CONFIG = {
	/** Minimum touch target size (px) */
	minTouchTarget: 44,
	/** Focus ring offset */
	focusRingOffset: 2,
	/** Focus ring width */
	focusRingWidth: 2,
} as const

// ============================================================================
// SCALE CONFIGURATION (extracted from magic numbers)
// ============================================================================

/**
 * Scale domain padding multipliers.
 * Used to add headroom above max values.
 */
export const SCALE_CONFIG = {
	/** Y-axis top padding multiplier (e.g., 1.1 = 10% above max) */
	yAxisPaddingMultiplier: 1.1,
	/** SparkLine Y padding ratio for min/max */
	sparklineYPadding: 0.1,
} as const

// ============================================================================
// PIE/DONUT CHART CONFIGURATION
// ============================================================================

/**
 * Pie and donut chart configuration.
 */
export const PIE_CONFIG = {
	/** Padding angle between segments (radians) */
	padAngle: 0.02,
	/** Inner radius ratio for donut (0 = pie, >0 = donut) */
	donutInnerRadiusRatio: 0.6,
	/** Corner radius for segments */
	cornerRadius: 3,
} as const

// ============================================================================
// LEGEND CONFIGURATION
// ============================================================================

/**
 * Legend styling configuration.
 */
export const LEGEND_CONFIG = {
	/** Default indicator size (Tailwind class) */
	indicatorSize: 'w-3 h-3',
	/** Compact indicator size (Tailwind class) */
	indicatorSizeCompact: 'w-2 h-2',
	/** Gap between legend items */
	itemGap: 4,
} as const

// ============================================================================
// HEADER/ICON CONFIGURATION
// ============================================================================

/**
 * Chart header styling.
 */
export const HEADER_CONFIG = {
	/** Icon background class */
	iconBgClass: 'bg-primary/10',
	/** Icon size (Tailwind class) */
	iconSize: 'h-5 w-5',
} as const

// ============================================================================
// MOBILE MARGINS
// ============================================================================

/**
 * Mobile-specific margins for responsive charts.
 */
export const MOBILE_MARGIN = {
	top: 16,
	right: 16,
	bottom: 32,
	left: 48,
} as const

// ============================================================================
// TOOLTIP STYLING
// ============================================================================

/**
 * Extended tooltip configuration including styling.
 */
export const TOOLTIP_STYLE_CONFIG = {
	/** Border radius */
	borderRadius: '0.5rem',
	/** Minimum width */
	minWidth: '120px',
	/** Box shadow */
	boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
} as const
