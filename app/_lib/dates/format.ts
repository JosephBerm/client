/**
 * Date Utilities - Formatting
 * 
 * Consistent date formatting utilities using date-fns.
 * All functions handle null/undefined gracefully and provide fallback strings.
 * 
 * @module lib/dates/format
 */

import { format as formatDateFns } from 'date-fns'
import { logger } from '@_core/logger'
import { parseDate } from './parse'
import { DATE_FORMATS, DEFAULT_DATE_FORMAT, DATE_FALLBACK } from './constants'
import type { DateInput, DateFormat } from './types'

/**
 * Formats a date for display using specified format.
 * Returns fallback string ("-") for null/undefined or invalid dates.
 * 
 * **Format Options**:
 * - `short`: "Jan 15, 2024" (default)
 * - `long`: "January 15, 2024"
 * - `datetime`: "Jan 15, 2024, 10:30 AM"
 * - `input`: "2024-01-15" (HTML date input format)
 * - `iso`: "2024-01-15T10:30:00Z"
 * - Custom format string (date-fns tokens)
 * 
 * @param {DateInput} date - Date to format
 * @param {DateFormat} formatType - Format type or custom format string
 * @returns {string} Formatted date string or "-" if invalid
 * 
 * @example
 * ```typescript
 * import { formatDate } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15T10:30:00Z')
 * 
 * formatDate(date)              // "Jan 15, 2024" (default: short)
 * formatDate(date, 'long')      // "January 15, 2024"
 * formatDate(date, 'datetime')  // "Jan 15, 2024, 10:30 AM"
 * formatDate(date, 'input')     // "2024-01-15"
 * formatDate(null)              // "-"
 * 
 * // Custom format
 * formatDate(date, 'yyyy-MM-dd HH:mm')  // "2024-01-15 10:30"
 * ```
 */
export function formatDate(date: DateInput, formatType: DateFormat = 'short'): string {
	// Parse input date
	const parsed = parseDate(date)
	if (!parsed) {
		return DATE_FALLBACK
	}

	try {
		// Map preset format types to format strings
		let formatString: string

		switch (formatType) {
			case 'short':
				formatString = DATE_FORMATS.SHORT
				break
			case 'long':
				formatString = DATE_FORMATS.LONG
				break
			case 'datetime':
				formatString = DATE_FORMATS.DATETIME
				break
			case 'input':
				formatString = DATE_FORMATS.INPUT
				break
			case 'iso':
				formatString = DATE_FORMATS.ISO
				break
			default:
				// Custom format string
				formatString = formatType
		}

		return formatDateFns(parsed, formatString)
	} catch (error) {
		logger.error('date.format.error', {
			date: parsed,
			format: formatType,
			error: error instanceof Error ? error.message : String(error),
			location: 'formatDate',
		})
		return DATE_FALLBACK
	}
}

/**
 * Formats a date in short format: "Jan 15, 2024"
 * Convenience wrapper for `formatDate(date, 'short')`.
 * 
 * @param {DateInput} date - Date to format
 * @returns {string} Short-formatted date or "-"
 * 
 * @example
 * ```typescript
 * import { formatDateShort } from '@_lib/dates'
 * 
 * formatDateShort(new Date('2024-01-15'))  // "Jan 15, 2024"
 * formatDateShort(null)  // "-"
 * ```
 */
export function formatDateShort(date: DateInput): string {
	return formatDate(date, 'short')
}

/**
 * Formats a date in long format: "January 15, 2024"
 * Convenience wrapper for `formatDate(date, 'long')`.
 * 
 * @param {DateInput} date - Date to format
 * @returns {string} Long-formatted date or "-"
 * 
 * @example
 * ```typescript
 * import { formatDateLong } from '@_lib/dates'
 * 
 * formatDateLong(new Date('2024-01-15'))  // "January 15, 2024"
 * formatDateLong(null)  // "-"
 * ```
 */
export function formatDateLong(date: DateInput): string {
	return formatDate(date, 'long')
}

/**
 * Formats a date with time: "Jan 15, 2024, 10:30 AM"
 * Convenience wrapper for `formatDate(date, 'datetime')`.
 * 
 * @param {DateInput} date - Date to format
 * @returns {string} Date and time formatted string or "-"
 * 
 * @example
 * ```typescript
 * import { formatDateTime } from '@_lib/dates'
 * 
 * formatDateTime(new Date('2024-01-15T10:30:00Z'))  // "Jan 15, 2024, 10:30 AM"
 * formatDateTime(null)  // "-"
 * ```
 */
export function formatDateTime(date: DateInput): string {
	return formatDate(date, 'datetime')
}

/**
 * Formats a date for HTML date input: "2024-01-15"
 * Required format for `<input type="date">` elements.
 * 
 * @param {DateInput} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format or empty string
 * 
 * @example
 * ```typescript
 * import { formatDateForInput } from '@_lib/dates'
 * 
 * // In a form component
 * <input
 *   type="date"
 *   value={formatDateForInput(order.deliveryDate)}
 * />
 * 
 * formatDateForInput(new Date('2024-01-15'))  // "2024-01-15"
 * formatDateForInput(null)  // ""
 * ```
 */
export function formatDateForInput(date: DateInput): string {
	const result = formatDate(date, 'input')
	// Return empty string instead of "-" for HTML inputs
	return result === DATE_FALLBACK ? '' : result
}

/**
 * Formats a date in full format: "Monday, January 15, 2024"
 * Used for formal displays and reports.
 * 
 * @param {DateInput} date - Date to format
 * @returns {string} Full-formatted date or "-"
 * 
 * @example
 * ```typescript
 * import { formatDateFull } from '@_lib/dates'
 * 
 * formatDateFull(new Date('2024-01-15'))  // "Monday, January 15, 2024"
 * ```
 */
export function formatDateFull(date: DateInput): string {
	return formatDate(date, DATE_FORMATS.FULL)
}

/**
 * Formats a date as year and month: "January 2024"
 * Used for month selectors and reports.
 * 
 * @param {DateInput} date - Date to format
 * @returns {string} Year and month or "-"
 * 
 * @example
 * ```typescript
 * import { formatYearMonth } from '@_lib/dates'
 * 
 * formatYearMonth(new Date('2024-01-15'))  // "January 2024"
 * ```
 */
export function formatYearMonth(date: DateInput): string {
	return formatDate(date, DATE_FORMATS.YEAR_MONTH)
}

/**
 * Formats a date as year only: "2024"
 * Used for year selectors and summaries.
 * 
 * @param {DateInput} date - Date to format
 * @returns {string} Year or "-"
 * 
 * @example
 * ```typescript
 * import { formatYear } from '@_lib/dates'
 * 
 * formatYear(new Date('2024-01-15'))  // "2024"
 * ```
 */
export function formatYear(date: DateInput): string {
	return formatDate(date, DATE_FORMATS.YEAR)
}

