/**
 * Chart Formatters
 *
 * Utility functions for formatting chart data, labels, and values.
 * Extends @_lib formatters with chart-specific variants.
 *
 * **DRY Compliance**: Imports base formatters from @_lib and extends
 * for chart-specific use cases (abbreviated axis labels, etc.)
 *
 * @module charts/utils/formatters
 */

import { format, parseISO, isValid } from 'date-fns'
import { formatCurrency as formatCurrencyFull } from '@_lib'
import { formatDate } from '@_lib'

// ============================================================================
// CONSTANTS (extracted from magic numbers)
// ============================================================================

/** Threshold values for abbreviation */
const ABBREVIATION_THRESHOLDS = {
	BILLION: 1_000_000_000,
	MILLION: 1_000_000,
	THOUSAND: 1_000,
} as const

/** Default decimal precision by scale */
const DEFAULT_DECIMALS = {
	LARGE: 1, // For K, M, B values
	SMALL: 2, // For values < 1K
} as const

/** Minimum percentage to display (noise reduction) */
const MIN_PERCENT_THRESHOLD = 0.1

// ============================================================================
// CURRENCY FORMATTERS
// ============================================================================

/**
 * Format a number as currency with abbreviation.
 * For chart axis labels and compact displays.
 *
 * Examples: $1.2M, $45.3K, $123.00
 *
 * @param value - Number to format
 * @param decimals - Decimal places (default: 2 for values < 1K, 1 otherwise)
 *
 * @see formatCurrencyFull from @_lib for full precision formatting
 */
export function formatCurrency(value: number, decimals?: number): string {
	if (value === 0) return '$0'

	const absValue = Math.abs(value)
	const sign = value < 0 ? '-' : ''

	if (absValue >= ABBREVIATION_THRESHOLDS.BILLION) {
		const d = decimals ?? DEFAULT_DECIMALS.LARGE
		return `${sign}$${(absValue / ABBREVIATION_THRESHOLDS.BILLION).toFixed(d)}B`
	}
	if (absValue >= ABBREVIATION_THRESHOLDS.MILLION) {
		const d = decimals ?? DEFAULT_DECIMALS.LARGE
		return `${sign}$${(absValue / ABBREVIATION_THRESHOLDS.MILLION).toFixed(d)}M`
	}
	if (absValue >= ABBREVIATION_THRESHOLDS.THOUSAND) {
		const d = decimals ?? DEFAULT_DECIMALS.LARGE
		return `${sign}$${(absValue / ABBREVIATION_THRESHOLDS.THOUSAND).toFixed(d)}K`
	}

	const d = decimals ?? DEFAULT_DECIMALS.SMALL
	return `${sign}$${absValue.toFixed(d)}`
}

// ============================================================================
// NUMBER FORMATTERS
// ============================================================================

/**
 * Format a number with abbreviation (no currency symbol).
 * For chart axis labels and compact displays.
 *
 * Examples: 1.2M, 45.3K, 123
 *
 * @param value - Number to format
 * @param decimals - Decimal places
 */
export function formatNumber(value: number, decimals?: number): string {
	if (value === 0) return '0'

	const absValue = Math.abs(value)
	const sign = value < 0 ? '-' : ''

	if (absValue >= ABBREVIATION_THRESHOLDS.BILLION) {
		const d = decimals ?? DEFAULT_DECIMALS.LARGE
		return `${sign}${(absValue / ABBREVIATION_THRESHOLDS.BILLION).toFixed(d)}B`
	}
	if (absValue >= ABBREVIATION_THRESHOLDS.MILLION) {
		const d = decimals ?? DEFAULT_DECIMALS.LARGE
		return `${sign}${(absValue / ABBREVIATION_THRESHOLDS.MILLION).toFixed(d)}M`
	}
	if (absValue >= ABBREVIATION_THRESHOLDS.THOUSAND) {
		const d = decimals ?? DEFAULT_DECIMALS.LARGE
		return `${sign}${(absValue / ABBREVIATION_THRESHOLDS.THOUSAND).toFixed(d)}K`
	}

	// For small numbers, show as-is
	if (Number.isInteger(value)) {
		return `${sign}${absValue}`
	}

	const d = decimals ?? DEFAULT_DECIMALS.SMALL
	return `${sign}${absValue.toFixed(d)}`
}

// ============================================================================
// PERCENT FORMATTERS
// ============================================================================

/**
 * Format a percentage value.
 *
 * @param value - Percentage value (e.g., 0.15 for 15% or 15 for 15%)
 * @param options - Formatting options
 */
export function formatPercent(
	value: number,
	options?: {
		/** Whether input is already a percentage (true) or decimal (false) */
		isPercentage?: boolean
		/** Decimal places */
		decimals?: number
		/** Show + sign for positive values */
		showSign?: boolean
	}
): string {
	const { isPercentage = true, decimals = 1, showSign = false } = options ?? {}

	// Convert if value is decimal (e.g., 0.15 -> 15)
	const percentValue = isPercentage ? value : value * 100

	if (Math.abs(percentValue) < MIN_PERCENT_THRESHOLD) {
		return '0%'
	}

	const sign = showSign && percentValue > 0 ? '+' : ''
	return `${sign}${percentValue.toFixed(decimals)}%`
}

// ============================================================================
// DATE FORMATTERS
// ============================================================================

/** Date format patterns by granularity */
const DATE_FORMAT_PATTERNS = {
	day: 'MMM d', // "Jan 15"
	week: "MMM d ''yy", // "Jan 15 '24"
	month: "MMM ''yy", // "Jan '24"
	year: 'yyyy', // "2024"
	tooltip: 'MMMM d, yyyy', // "January 15, 2024"
} as const

/**
 * Format a date for chart axis labels.
 * Adapts format based on context.
 *
 * @param date - Date to format (ISO string or Date)
 * @param granularity - Time granularity
 */
export function formatAxisDate(
	date: string | Date,
	granularity: 'day' | 'week' | 'month' | 'year' = 'month'
): string {
	const d = typeof date === 'string' ? parseISO(date) : date

	if (!isValid(d)) return ''

	const pattern = DATE_FORMAT_PATTERNS[granularity] ?? DATE_FORMAT_PATTERNS.month
	return format(d, pattern)
}

/**
 * Format a date for tooltips (more detailed).
 *
 * @param date - Date to format
 */
export function formatTooltipDate(date: string | Date): string {
	const d = typeof date === 'string' ? parseISO(date) : date

	if (!isValid(d)) return ''

	return format(d, DATE_FORMAT_PATTERNS.tooltip)
}

// ============================================================================
// TOOLTIP FORMATTERS
// ============================================================================

/**
 * Format a value for display in tooltips.
 * Uses full precision (not abbreviated) for detailed view.
 *
 * @param value - Value to format
 * @param type - Type of formatting
 */
export function formatTooltipValue(
	value: number,
	type: 'currency' | 'percent' | 'number' = 'number'
): string {
	switch (type) {
		case 'currency':
			// Full precision for tooltips - use @_lib formatter
			return formatCurrencyFull(value) ?? '$0.00'
		case 'percent':
			return formatPercent(value, { decimals: 2 })
		case 'number':
		default:
			return new Intl.NumberFormat('en-US').format(value)
	}
}

// ============================================================================
// AXIS UTILITIES
// ============================================================================

/**
 * Create tick formatter for Y-axis based on value range.
 *
 * @param maxValue - Maximum value in the data
 * @param type - Type of values
 */
export function createYAxisFormatter(
	maxValue: number,
	type: 'currency' | 'percent' | 'number' = 'number'
): (value: number) => string {
	return (value: number) => {
		switch (type) {
			case 'currency':
				return formatCurrency(value)
			case 'percent':
				return formatPercent(value)
			case 'number':
			default:
				return formatNumber(value)
		}
	}
}

/**
 * Generate nice axis tick values.
 * Creates evenly spaced, round numbers.
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @param count - Desired number of ticks
 */
export function generateNiceTicks(min: number, max: number, count: number): number[] {
	if (min === max) {
		return [min]
	}

	const range = max - min
	const roughStep = range / (count - 1)

	// Round step to nice number
	const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
	const normalizedStep = roughStep / magnitude

	let niceStep: number
	if (normalizedStep <= 1) {
		niceStep = magnitude
	} else if (normalizedStep <= 2) {
		niceStep = 2 * magnitude
	} else if (normalizedStep <= 5) {
		niceStep = 5 * magnitude
	} else {
		niceStep = 10 * magnitude
	}

	// Generate ticks
	const niceMin = Math.floor(min / niceStep) * niceStep
	const niceMax = Math.ceil(max / niceStep) * niceStep
	const ticks: number[] = []

	for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
		ticks.push(tick)
	}

	return ticks
}
