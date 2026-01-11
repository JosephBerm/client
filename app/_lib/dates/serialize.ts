/**
 * Date Utilities - Serialization
 *
 * Utilities for serializing dates for API requests and data exchange.
 * Ensures consistent ISO 8601 format across all API communications.
 *
 * @module lib/dates/serialize
 */

import { formatISO, format as formatDateFns } from 'date-fns'

import { logger } from '@_core/logger'

import { DATE_FORMATS } from './constants'
import { parseDate } from './parse'

import type { DateInput } from './types'

/**
 * Serializes a date to ISO 8601 format with timezone.
 * Returns null for invalid or missing dates.
 *
 * **Output Format**: "2024-01-15T10:30:00.000Z"
 *
 * **Use Cases**:
 * - API request bodies
 * - JSON serialization
 * - Database timestamps
 *
 * @param {DateInput} date - Date to serialize
 * @returns {string | null} ISO 8601 string or null
 *
 * @example
 * ```typescript
 * import { serializeDate } from '@_lib/dates'
 *
 * serializeDate(new Date('2024-01-15T10:30:00Z'))
 * // Returns: "2024-01-15T10:30:00.000Z"
 *
 * serializeDate(null)  // Returns: null
 *
 * // In API requests
 * const payload = {
 *   name: 'Order #123',
 *   createdAt: serializeDate(order.createdAt)
 * }
 * ```
 */
export function serializeDate(date: DateInput): string | null {
	const parsed = parseDate(date)
	if (!parsed) {
		return null
	}

	try {
		return formatISO(parsed)
	} catch (error) {
		logger.error('date.serialize.error', {
			date: parsed,
			error: error instanceof Error ? error.message : String(error),
			location: 'serializeDate',
		})
		return null
	}
}

/**
 * Serializes a date to date-only format (no time).
 * Returns null for invalid or missing dates.
 *
 * **Output Format**: "2024-01-15"
 *
 * **IMPORTANT (Timezone-Safe):**
 * This function uses UTC components to prevent timezone shift issues.
 * When a date is stored as "2001-09-05T00:00:00Z" (midnight UTC),
 * using local time formatting could produce "2001-09-04" in western timezones.
 *
 * **Use Cases**:
 * - HTML date input values
 * - Date-only API fields (birthdate, etc.)
 * - Date range filters
 *
 * @param {DateInput} date - Date to serialize
 * @returns {string | null} Date string in YYYY-MM-DD format (UTC) or null
 *
 * @example
 * ```typescript
 * import { serializeDateOnly } from '@_lib/dates'
 *
 * serializeDateOnly(new Date('2024-01-15T10:30:00Z'))
 * // Returns: "2024-01-15"
 *
 * serializeDateOnly(null)  // Returns: null
 *
 * // In HTML date inputs
 * <input
 *   type="date"
 *   value={serializeDateOnly(filter.fromDate) ?? ''}
 * />
 *
 * // In API requests for date-only fields
 * const payload = {
 *   dateOfBirth: serializeDateOnly(user.dateOfBirth)
 * }
 * ```
 */
export function serializeDateOnly(date: DateInput): string | null {
	const parsed = parseDate(date)
	if (!parsed) {
		return null
	}

	try {
		// INDUSTRY BEST PRACTICE: Use UTC components for date-only fields
		// This prevents timezone shift issues where "2001-09-05T00:00:00Z"
		// would serialize as "2001-09-04" in western timezones (like EST/PST)
		const year = parsed.getUTCFullYear()
		const month = String(parsed.getUTCMonth() + 1).padStart(2, '0')
		const day = String(parsed.getUTCDate()).padStart(2, '0')

		return `${year}-${month}-${day}`
	} catch (error) {
		logger.error('date.serialize.error', {
			date: parsed,
			error: error instanceof Error ? error.message : String(error),
			location: 'serializeDateOnly',
		})
		return null
	}
}

/**
 * Serializes a date for API requests.
 * Alias for `serializeDate()` with explicit API context.
 *
 * **Output Format**: "2024-01-15T10:30:00.000Z" (ISO 8601)
 *
 * @param {DateInput} date - Date to serialize
 * @returns {string | null} ISO 8601 string or null
 *
 * @example
 * ```typescript
 * import { serializeDateForAPI } from '@_lib/dates'
 *
 * // Before API request
 * const requestData = {
 *   validUntil: serializeDateForAPI(quote.validUntil),
 *   createdAt: serializeDateForAPI(new Date())
 * }
 *
 * await API.Quotes.create(requestData)
 * ```
 */
export function serializeDateForAPI(date: DateInput): string | null {
	return serializeDate(date)
}

/**
 * Serializes a date range for API requests.
 * Returns null if either date is invalid.
 *
 * @param {DateInput} from - Start date
 * @param {DateInput} to - End date
 * @returns {{ from: string; to: string } | null} Serialized date range or null
 *
 * @example
 * ```typescript
 * import { serializeDateRange } from '@_lib/dates'
 *
 * const range = serializeDateRange(
 *   filter.fromDate,
 *   filter.toDate
 * )
 *
 * if (range) {
 *   const response = await API.Analytics.getFinanceNumbers(range)
 * }
 * ```
 */
export function serializeDateRange(from: DateInput, to: DateInput): { from: string; to: string } | null {
	const fromSerialized = serializeDate(from)
	const toSerialized = serializeDate(to)

	if (!fromSerialized || !toSerialized) {
		return null
	}

	return {
		from: fromSerialized,
		to: toSerialized,
	}
}

/**
 * Serializes a date to Unix timestamp (milliseconds since epoch).
 * Returns null for invalid or missing dates.
 *
 * @param {DateInput} date - Date to serialize
 * @returns {number | null} Unix timestamp or null
 *
 * @example
 * ```typescript
 * import { serializeTimestamp } from '@_lib/dates'
 *
 * serializeTimestamp(new Date('2024-01-15T10:30:00Z'))
 * // Returns: 1705318200000
 *
 * // For APIs that expect Unix timestamps
 * const payload = {
 *   createdAt: serializeTimestamp(new Date())
 * }
 * ```
 */
export function serializeTimestamp(date: DateInput): number | null {
	const parsed = parseDate(date)
	if (!parsed) {
		return null
	}

	return parsed.getTime()
}
