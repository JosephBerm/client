/**
 * Analytics Formatters
 *
 * Specialized formatting utilities for analytics dashboard display.
 * Complements @_lib formatters with analytics-specific abbreviated formats.
 *
 * @module analytics/utils/formatters
 */

import { formatCurrency as formatCurrencyStandard, formatDate } from '@_lib'

/**
 * Formats currency with intelligent abbreviation for dashboard display.
 * - Values >= 1M: "$1.23M"
 * - Values >= 1K: "$12.3K"
 * - Values < 1K: Standard formatting via @_lib
 *
 * @param value - Number to format
 * @returns Abbreviated currency string
 *
 * @example
 * ```typescript
 * formatCurrencyAbbreviated(1234567)  // "$1.23M"
 * formatCurrencyAbbreviated(12345)    // "$12.3K"
 * formatCurrencyAbbreviated(123)      // "$123.00"
 * formatCurrencyAbbreviated(0)        // "$0.00"
 * ```
 */
export function formatCurrencyAbbreviated(value: number): string {
	if (!Number.isFinite(value) || value < 0) {
		return formatCurrencyStandard(0)
	}

	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(2)}M`
	}

	if (value >= 1_000) {
		return `$${(value / 1_000).toFixed(1)}K`
	}

	return formatCurrencyStandard(value)
}

/**
 * Formats a percentage with optional sign.
 *
 * @param value - Percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @param showSign - Whether to show + for positive values (default: false)
 * @returns Formatted percentage string
 *
 * @example
 * ```typescript
 * formatPercent(15.5)           // "15.5%"
 * formatPercent(15.5, 0)        // "16%"
 * formatPercent(15.5, 1, true)  // "+15.5%"
 * formatPercent(-5.2, 1, true)  // "-5.2%"
 * ```
 */
export function formatPercent(value: number, decimals = 1, showSign = false): string {
	if (!Number.isFinite(value)) {
		return '0%'
	}

	const formatted = value.toFixed(decimals)
	const sign = showSign && value > 0 ? '+' : ''

	return `${sign}${formatted}%`
}

/**
 * Formats a number with intelligent abbreviation for large values.
 * - Values >= 1M: "1.2M"
 * - Values >= 1K: "12.3K"
 * - Values < 1K: Standard locale formatting
 *
 * @param value - Number to format
 * @returns Abbreviated number string
 *
 * @example
 * ```typescript
 * formatNumberAbbreviated(1234567)  // "1.2M"
 * formatNumberAbbreviated(12345)    // "12.3K"
 * formatNumberAbbreviated(123)      // "123"
 * ```
 */
export function formatNumberAbbreviated(value: number): string {
	if (!Number.isFinite(value) || value < 0) {
		return '0'
	}

	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1)}M`
	}

	if (value >= 1_000) {
		return `${(value / 1_000).toFixed(1)}K`
	}

	return value.toLocaleString()
}

/**
 * Formats a date for chart axis labels.
 * Format: "Jan '24" (month abbreviation + 2-digit year)
 *
 * @param dateStr - ISO date string or Date object
 * @returns Formatted chart label
 *
 * @example
 * ```typescript
 * formatChartDate('2024-01-15')  // "Jan '24"
 * formatChartDate('2024-12-01')  // "Dec '24"
 * ```
 */
export function formatChartDate(dateStr: string | Date): string {
	return formatDate(dateStr, "MMM ''yy")
}

/**
 * Result of formatting a percentage change for display.
 * Provides all necessary data for rendering trend indicators.
 */
export interface PercentageChangeResult {
	/** Whether to show the change indicator at all */
	shouldShow: boolean
	/** Formatted display text (e.g., "+15.3%", "N/A") */
	displayText: string
	/** Whether the change is positive (for coloring) */
	isPositive: boolean
	/** Whether the change represents no meaningful data */
	isNeutral: boolean
	/** Accessible label for screen readers */
	ariaLabel: string
}

/**
 * Formats a percentage change for analytics display with intelligent edge case handling.
 *
 * Handles edge cases that would otherwise show misleading information:
 * - 0 current value with 0 previous → "No data" (not +100% or 0%)
 * - 0 current value with positive change → "No data" (misleading)
 * - Undefined/NaN/Infinity → "N/A"
 * - Very small changes (< 0.1%) → Shows as 0% to avoid noise
 *
 * This ensures enterprise-grade analytics that don't mislead users,
 * which is critical for our B2B white-label platform positioning.
 *
 * @param change - The percentage change value
 * @param currentValue - The current metric value (used to detect edge cases)
 * @param options - Configuration options
 * @returns Formatted result with display text and metadata
 *
 * @example
 * ```typescript
 * // Normal case
 * formatPercentageChange(15.3, 100)
 * // { shouldShow: true, displayText: "+15.3%", isPositive: true, isNeutral: false }
 *
 * // Edge case: 0 orders with "100%" change
 * formatPercentageChange(100, 0)
 * // { shouldShow: true, displayText: "No data", isPositive: false, isNeutral: true }
 *
 * // Edge case: undefined change
 * formatPercentageChange(undefined, 50)
 * // { shouldShow: false, displayText: "", isPositive: false, isNeutral: true }
 * ```
 */
export function formatPercentageChange(
	change: number | undefined | null,
	currentValue: number | undefined | null,
	options: {
		/** Number of decimal places (default: 1) */
		decimals?: number
		/** Minimum absolute change to display (default: 0.1) */
		minThreshold?: number
		/** Text to show when data is not meaningful (default: "No data") */
		noDataText?: string
	} = {}
): PercentageChangeResult {
	const { decimals = 1, minThreshold = 0.1, noDataText = 'No data' } = options

	// Handle undefined/null change
	if (change === undefined || change === null) {
		return {
			shouldShow: false,
			displayText: '',
			isPositive: false,
			isNeutral: true,
			ariaLabel: 'No comparison data available',
		}
	}

	// Handle non-finite values (NaN, Infinity)
	if (!Number.isFinite(change)) {
		return {
			shouldShow: true,
			displayText: 'N/A',
			isPositive: false,
			isNeutral: true,
			ariaLabel: 'Comparison data not available',
		}
	}

	// Edge case: Current value is 0 or undefined but showing a percentage change
	// This is misleading (e.g., "0 completed orders, +100% vs prev period")
	const currentValueIsZeroOrMissing =
		currentValue === undefined ||
		currentValue === null ||
		(typeof currentValue === 'number' && currentValue === 0)

	if (currentValueIsZeroOrMissing && change !== 0) {
		return {
			shouldShow: true,
			displayText: noDataText,
			isPositive: false,
			isNeutral: true,
			ariaLabel: 'No data to compare',
		}
	}

	// Handle very small changes (noise reduction)
	if (Math.abs(change) < minThreshold) {
		return {
			shouldShow: true,
			displayText: '0%',
			isPositive: false,
			isNeutral: true,
			ariaLabel: 'No significant change from previous period',
		}
	}

	// Normal case: format the change
	const sign = change > 0 ? '+' : ''
	const formattedValue =
		Math.abs(change) >= 1000
			? `${sign}${(change / 1000).toFixed(1)}K%`
			: `${sign}${change.toFixed(decimals)}%`

	return {
		shouldShow: true,
		displayText: formattedValue,
		isPositive: change > 0,
		isNeutral: false,
		ariaLabel: `${change > 0 ? 'Increased' : 'Decreased'} by ${Math.abs(change).toFixed(decimals)} percent compared to previous period`,
	}
}

