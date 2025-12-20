/**
 * Analytics Time Range Presets
 *
 * Constants for time range selection in the analytics dashboard.
 * Extended presets beyond core @_lib/dates for business intelligence needs.
 *
 * @module analytics/constants/timeRangePresets
 */

import type { TimeRangePreset } from '@_types/analytics.types'

/**
 * Time range preset configuration with labels.
 */
export interface TimeRangeOption {
	/** Preset value */
	value: TimeRangePreset
	/** Display label */
	label: string
	/** Short label for compact displays */
	shortLabel: string
}

/**
 * Available time range presets for analytics filtering.
 * Ordered from shortest to longest duration, with custom at the end.
 */
export const TIME_RANGE_PRESETS: readonly TimeRangeOption[] = [
	{ value: '7d', label: 'Last 7 Days', shortLabel: '7D' },
	{ value: '30d', label: 'Last 30 Days', shortLabel: '30D' },
	{ value: '90d', label: 'Last 90 Days', shortLabel: '90D' },
	{ value: '6m', label: 'Last 6 Months', shortLabel: '6M' },
	{ value: '12m', label: 'Last 12 Months', shortLabel: '12M' },
	{ value: 'ytd', label: 'Year to Date', shortLabel: 'YTD' },
	{ value: 'custom', label: 'Custom Range', shortLabel: 'Custom' },
] as const

/**
 * Map of preset values to their labels.
 * Useful for quick label lookups.
 */
export const TIME_RANGE_LABELS: Record<TimeRangePreset, string> = {
	'7d': 'Last 7 Days',
	'30d': 'Last 30 Days',
	'90d': 'Last 90 Days',
	'6m': 'Last 6 Months',
	'12m': 'Last 12 Months',
	'ytd': 'Year to Date',
	'custom': 'Custom Range',
}

/**
 * Default time range for analytics dashboard.
 */
export const DEFAULT_TIME_RANGE: TimeRangePreset = '12m'

