/**
 * Date Utilities - Manipulation
 * 
 * Safe date arithmetic and manipulation utilities using date-fns.
 * All functions are immutable and return new Date objects.
 * 
 * @module lib/dates/manipulate
 */

import {
	addDays as addDaysFns,
	subDays as subDaysFns,
	addMonths as addMonthsFns,
	subMonths as subMonthsFns,
	addYears as addYearsFns,
	subYears as subYearsFns,
	startOfDay,
	endOfDay,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
} from 'date-fns'

import { logger } from '@_core/logger'

import type { DateRangePreset, DateRange } from './types'

/**
 * Adds days to a date (immutable).
 * Returns a new Date object without modifying the original.
 * 
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add (positive or negative)
 * @returns {Date} New Date with days added
 * 
 * @example
 * ```typescript
 * import { addDays } from '@_lib/dates'
 * 
 * const today = new Date('2024-01-15')
 * const nextWeek = addDays(today, 7)  // 2024-01-22
 * const yesterday = addDays(today, -1)  // 2024-01-14
 * 
 * // Original date is unchanged
 * console.log(today)  // 2024-01-15
 * ```
 */
export function addDays(date: Date, days: number): Date {
	return addDaysFns(date, days)
}

/**
 * Subtracts days from a date (immutable).
 * Convenience wrapper for `addDays(date, -days)`.
 * 
 * @param {Date} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New Date with days subtracted
 * 
 * @example
 * ```typescript
 * import { subtractDays } from '@_lib/dates'
 * 
 * const today = new Date('2024-01-15')
 * const lastWeek = subtractDays(today, 7)  // 2024-01-08
 * ```
 */
export function subtractDays(date: Date, days: number): Date {
	return subDaysFns(date, days)
}

/**
 * Adds months to a date (immutable).
 * Handles month-end dates intelligently (e.g., Jan 31 + 1 month = Feb 28/29).
 * 
 * @param {Date} date - Base date
 * @param {number} months - Number of months to add
 * @returns {Date} New Date with months added
 * 
 * @example
 * ```typescript
 * import { addMonths } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15')
 * const nextMonth = addMonths(date, 1)  // 2024-02-15
 * const nextYear = addMonths(date, 12)  // 2025-01-15
 * ```
 */
export function addMonths(date: Date, months: number): Date {
	return addMonthsFns(date, months)
}

/**
 * Subtracts months from a date (immutable).
 * Convenience wrapper for `addMonths(date, -months)`.
 * 
 * @param {Date} date - Base date
 * @param {number} months - Number of months to subtract
 * @returns {Date} New Date with months subtracted
 * 
 * @example
 * ```typescript
 * import { subtractMonths } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15')
 * const lastMonth = subtractMonths(date, 1)  // 2023-12-15
 * ```
 */
export function subtractMonths(date: Date, months: number): Date {
	return subMonthsFns(date, months)
}

/**
 * Adds years to a date (immutable).
 * Handles leap years correctly.
 * 
 * @param {Date} date - Base date
 * @param {number} years - Number of years to add
 * @returns {Date} New Date with years added
 * 
 * @example
 * ```typescript
 * import { addYears } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15')
 * const nextYear = addYears(date, 1)  // 2025-01-15
 * ```
 */
export function addYears(date: Date, years: number): Date {
	return addYearsFns(date, years)
}

/**
 * Subtracts years from a date (immutable).
 * Convenience wrapper for `addYears(date, -years)`.
 * 
 * @param {Date} date - Base date
 * @param {number} years - Number of years to subtract
 * @returns {Date} New Date with years subtracted
 * 
 * @example
 * ```typescript
 * import { subtractYears } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15')
 * const lastYear = subtractYears(date, 1)  // 2023-01-15
 * ```
 */
export function subtractYears(date: Date, years: number): Date {
	return subYearsFns(date, years)
}

/**
 * Gets a date range based on preset (e.g., "7d", "30d", "90d", "1y").
 * Returns date range from N days/years ago to now.
 * 
 * **Presets**:
 * - `7d`: Last 7 days
 * - `30d`: Last 30 days
 * - `90d`: Last 90 days
 * - `1y`: Last 1 year
 * - `ytd`: Year to date (Jan 1 to today)
 * - `mtd`: Month to date (1st of month to today)
 * 
 * @param {DateRangePreset} preset - Date range preset
 * @param {Date} [baseDate=new Date()] - Base date (defaults to now)
 * @returns {DateRange} Date range object
 * 
 * @example
 * ```typescript
 * import { getDateRange } from '@_lib/dates'
 * 
 * // Last 7 days
 * const range = getDateRange('7d')
 * // Returns: { from: Date(7 days ago), to: Date(now) }
 * 
 * // Last 30 days
 * const range30 = getDateRange('30d')
 * 
 * // Year to date
 * const ytd = getDateRange('ytd')
 * // Returns: { from: Date(Jan 1), to: Date(now) }
 * 
 * // Use in filters
 * const filter = new FinanceSearchFilter()
 * const range = getDateRange('30d')
 * filter.FromDate = range.from
 * filter.ToDate = range.to
 * ```
 */
export function getDateRange(preset: DateRangePreset, baseDate: Date = new Date()): DateRange {
	const to = baseDate

	let from: Date

	switch (preset) {
		case '7d':
			from = subtractDays(to, 7)
			break
		case '30d':
			from = subtractDays(to, 30)
			break
		case '90d':
			from = subtractDays(to, 90)
			break
		case '1y':
			from = subtractYears(to, 1)
			break
		case 'ytd':
			from = startOfYear(to)
			break
		case 'mtd':
			from = startOfMonth(to)
			break
		default:
			logger.warn('date.range.invalid', {
				preset,
				location: 'getDateRange',
			})
			from = subtractDays(to, 30) // Default to 30 days
	}

	return { from, to }
}

/**
 * Gets start of day (00:00:00.000).
 * 
 * @param {Date} date - Base date
 * @returns {Date} Date set to start of day
 * 
 * @example
 * ```typescript
 * import { getStartOfDay } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15T10:30:00Z')
 * const start = getStartOfDay(date)  // 2024-01-15T00:00:00.000Z
 * ```
 */
export function getStartOfDay(date: Date): Date {
	return startOfDay(date)
}

/**
 * Gets end of day (23:59:59.999).
 * 
 * @param {Date} date - Base date
 * @returns {Date} Date set to end of day
 * 
 * @example
 * ```typescript
 * import { getEndOfDay } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15T10:30:00Z')
 * const end = getEndOfDay(date)  // 2024-01-15T23:59:59.999Z
 * ```
 */
export function getEndOfDay(date: Date): Date {
	return endOfDay(date)
}

/**
 * Gets start of month (1st day, 00:00:00.000).
 * 
 * @param {Date} date - Base date
 * @returns {Date} Date set to start of month
 * 
 * @example
 * ```typescript
 * import { getStartOfMonth } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15')
 * const start = getStartOfMonth(date)  // 2024-01-01T00:00:00.000Z
 * ```
 */
export function getStartOfMonth(date: Date): Date {
	return startOfMonth(date)
}

/**
 * Gets end of month (last day, 23:59:59.999).
 * 
 * @param {Date} date - Base date
 * @returns {Date} Date set to end of month
 * 
 * @example
 * ```typescript
 * import { getEndOfMonth } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15')
 * const end = getEndOfMonth(date)  // 2024-01-31T23:59:59.999Z
 * ```
 */
export function getEndOfMonth(date: Date): Date {
	return endOfMonth(date)
}

/**
 * Gets start of year (Jan 1, 00:00:00.000).
 * 
 * @param {Date} date - Base date
 * @returns {Date} Date set to start of year
 * 
 * @example
 * ```typescript
 * import { getStartOfYear } from '@_lib/dates'
 * 
 * const date = new Date('2024-06-15')
 * const start = getStartOfYear(date)  // 2024-01-01T00:00:00.000Z
 * ```
 */
export function getStartOfYear(date: Date): Date {
	return startOfYear(date)
}

/**
 * Gets end of year (Dec 31, 23:59:59.999).
 * 
 * @param {Date} date - Base date
 * @returns {Date} Date set to end of year
 * 
 * @example
 * ```typescript
 * import { getEndOfYear } from '@_lib/dates'
 * 
 * const date = new Date('2024-06-15')
 * const end = getEndOfYear(date)  // 2024-12-31T23:59:59.999Z
 * ```
 */
export function getEndOfYear(date: Date): Date {
	return endOfYear(date)
}

