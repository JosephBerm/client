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

