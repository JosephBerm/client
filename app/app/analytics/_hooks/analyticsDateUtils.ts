/**
 * Analytics Date Utilities
 *
 * Shared date handling utilities for analytics hooks.
 * Wraps existing @_lib date utilities for analytics-specific use cases.
 *
 * @see @_lib/dates for core date utilities
 * @module analytics/hooks/analyticsDateUtils
 */

import { getDateRange, serializeDateOnly, type DateRangePreset } from '@_lib'

import type { TimeRangePreset } from '@_types/analytics.types'

/**
 * Maps TimeRangePreset to DateRangePreset or handles custom/extended presets.
 * Some analytics presets (6m, 12m) don't exist in core DateRangePreset.
 */
const PRESET_MAP: Record<Exclude<TimeRangePreset, 'custom'>, DateRangePreset | 'extended'> = {
	'7d': '7d',
	'30d': '30d',
	'90d': '90d',
	'6m': 'extended', // Not in DateRangePreset, handle manually
	'12m': '1y',
	'ytd': 'ytd',
}

/**
 * Converts a TimeRangePreset to API-ready date strings.
 * Leverages @_lib/getDateRange for core presets.
 *
 * @param preset - Time range preset
 * @returns Object with startDate and endDate as ISO date strings
 *
 * @example
 * ```typescript
 * const { startDate, endDate } = getAnalyticsDateRange('30d')
 * // Returns: { startDate: '2024-11-20', endDate: '2024-12-20' }
 * ```
 */
export function getAnalyticsDateRange(preset: Exclude<TimeRangePreset, 'custom'>): {
	startDate: string
	endDate: string
} {
	const now = new Date()
	const endDate = serializeDateOnly(now) ?? new Date().toISOString().split('T')[0]

	// Handle extended presets not in core DateRangePreset
	const mappedPreset = PRESET_MAP[preset]

	if (mappedPreset === 'extended') {
		// Handle 6m preset manually
		if (preset === '6m') {
			const sixMonthsAgo = new Date(now)
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
			return {
				startDate: serializeDateOnly(sixMonthsAgo) ?? sixMonthsAgo.toISOString().split('T')[0],
				endDate,
			}
		}
	}

	// Use core @_lib/getDateRange for standard presets
	const range = getDateRange(mappedPreset as DateRangePreset, now)
	return {
		startDate: serializeDateOnly(range.from) ?? range.from.toISOString().split('T')[0],
		endDate,
	}
}

/**
 * Generates a cache key for analytics data based on date range.
 *
 * @param prefix - Cache key prefix (e.g., 'analytics-summary')
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Unique cache key
 */
export function getAnalyticsCacheKey(prefix: string, startDate?: string, endDate?: string): string {
	return `${prefix}-${startDate ?? 'all'}-${endDate ?? 'all'}`
}

