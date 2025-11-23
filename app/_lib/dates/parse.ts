/**
 * Date Utilities - Parsing
 * 
 * Safe, defensive date parsing utilities that handle various input formats.
 * All functions are null-safe and provide structured error handling.
 * 
 * @module lib/dates/parse
 */

import { parseISO, isValid as isValidDateFns } from 'date-fns'
import { logger } from '@_core/logger'
import type { DateInput } from './types'

/**
 * Safely parses a date from various input formats.
 * Returns null for invalid or missing input.
 * Logs warnings for parsing failures.
 * 
 * **Supported Input Formats**:
 * - Date object (returned as-is if valid)
 * - ISO 8601 string: "2024-01-15T10:30:00Z"
 * - Date-only string: "2024-01-15"
 * - Unix timestamp (number): milliseconds since epoch
 * - null/undefined: returns null
 * 
 * **Error Handling**:
 * - Invalid input → returns null, logs warning
 * - null/undefined → returns null, no logging
 * 
 * @param {DateInput} input - Date input to parse
 * @returns {Date | null} Parsed Date object or null if invalid
 * 
 * @example
 * ```typescript
 * import { parseDate } from '@_lib/dates'
 * 
 * // Date object
 * parseDate(new Date())  // Returns: Date object
 * 
 * // ISO string
 * parseDate('2024-01-15T10:30:00Z')  // Returns: Date object
 * 
 * // Date-only string
 * parseDate('2024-01-15')  // Returns: Date object (midnight UTC)
 * 
 * // Unix timestamp
 * parseDate(1705318200000)  // Returns: Date object
 * 
 * // Invalid input
 * parseDate('invalid')  // Returns: null (logs warning)
 * parseDate(null)  // Returns: null
 * ```
 */
export function parseDate(input: DateInput): Date | null {
	// Handle null/undefined
	if (input == null) {
		return null
	}

	try {
		// Handle Date object
		if (input instanceof Date) {
			return isValidDateFns(input) ? input : null
		}

		// Handle number (Unix timestamp)
		if (typeof input === 'number') {
			const date = new Date(input)
			return isValidDateFns(date) ? date : null
		}

		// Handle string (ISO 8601 or date-only)
		if (typeof input === 'string') {
			// Try parsing as ISO 8601
			const date = parseISO(input)
			if (isValidDateFns(date)) {
				return date
			}

			// Try native Date constructor as fallback
			const fallbackDate = new Date(input)
			if (isValidDateFns(fallbackDate)) {
				return fallbackDate
			}
		}

		// Invalid input
		logger.warn('date.parse.failed', {
			input,
			reason: 'Invalid date format',
			location: 'parseDate',
		})
		return null
	} catch (error) {
		logger.warn('date.parse.error', {
			input,
			error: error instanceof Error ? error.message : String(error),
			location: 'parseDate',
		})
		return null
	}
}

/**
 * Safely parses a date with guaranteed non-throwing behavior.
 * Identical to `parseDate()` but explicitly designed for error recovery.
 * 
 * Use this when you want to emphasize defensive programming.
 * 
 * @param {DateInput} input - Date input to parse
 * @returns {Date | null} Parsed Date object or null if invalid
 * 
 * @example
 * ```typescript
 * import { parseDateSafe } from '@_lib/dates'
 * 
 * // In class constructors (never throws)
 * constructor(data: any) {
 *   this.createdAt = parseDateSafe(data.createdAt) ?? new Date()
 * }
 * ```
 */
export function parseDateSafe(input: DateInput): Date | null {
	return parseDate(input)
}

/**
 * Parses a date or returns the current date/time if invalid.
 * Useful for fallback scenarios where a date is always required.
 * 
 * **Use Cases**:
 * - Default timestamps when API doesn't provide one
 * - Fallback for missing created_at fields
 * - Ensuring non-null dates in constructors
 * 
 * @param {DateInput} input - Date input to parse
 * @returns {Date} Parsed Date object or current date if invalid
 * 
 * @example
 * ```typescript
 * import { parseDateOrNow } from '@_lib/dates'
 * 
 * // With valid input
 * parseDateOrNow('2024-01-15')  // Returns: Date for 2024-01-15
 * 
 * // With invalid input
 * parseDateOrNow(null)  // Returns: new Date() (current time)
 * parseDateOrNow('invalid')  // Returns: new Date() (current time)
 * 
 * // In class constructors
 * this.createdAt = parseDateOrNow(data.createdAt)
 * ```
 */
export function parseDateOrNow(input: DateInput): Date {
	const parsed = parseDate(input)
	return parsed ?? new Date()
}

/**
 * Parses a date with a custom fallback value.
 * More flexible than `parseDateOrNow()` for specific default scenarios.
 * 
 * @param {DateInput} input - Date input to parse
 * @param {Date} fallback - Fallback date if parsing fails
 * @returns {Date} Parsed Date object or fallback
 * 
 * @example
 * ```typescript
 * import { parseDateWithFallback } from '@_lib/dates'
 * 
 * // Use epoch as fallback
 * const date = parseDateWithFallback(input, new Date(0))
 * 
 * // Use specific date as fallback
 * const startDate = parseDateWithFallback(
 *   filter.fromDate,
 *   new Date('2024-01-01')
 * )
 * ```
 */
export function parseDateWithFallback(input: DateInput, fallback: Date): Date {
	const parsed = parseDate(input)
	return parsed ?? fallback
}

/**
 * Parses multiple date inputs into an array of Date objects.
 * Filters out invalid dates automatically.
 * 
 * @param {DateInput[]} inputs - Array of date inputs to parse
 * @returns {Date[]} Array of valid Date objects (invalid inputs excluded)
 * 
 * @example
 * ```typescript
 * import { parseDates } from '@_lib/dates'
 * 
 * const inputs = [
 *   '2024-01-15',
 *   'invalid',
 *   new Date(),
 *   null,
 *   '2024-02-20'
 * ]
 * 
 * const dates = parseDates(inputs)
 * // Returns: [Date(2024-01-15), Date(now), Date(2024-02-20)]
 * ```
 */
export function parseDates(inputs: DateInput[]): Date[] {
	return inputs.map(parseDate).filter((date): date is Date => date !== null)
}

/**
 * Parses a required timestamp field with environment-aware error handling.
 * 
 * **Hybrid Approach (FAANG Best Practice):**
 * - **Development**: Throws error (fail fast - exposes API bugs immediately)
 * - **Production**: Returns fallback + logs critical error (defensive - maintains uptime)
 * 
 * **Use Cases:**
 * - Entity `createdAt` fields (server-generated, should never be null)
 * - Entity `updatedAt` fields (server-generated, should never be null)
 * - Any timestamp that is required for business logic (sorting, filtering, audit trail)
 * 
 * **Benefits:**
 * - ✅ Data Integrity: Exposes missing data in development
 * - ✅ Uptime: Prevents crashes in production
 * - ✅ Observability: All failures logged with full context
 * - ✅ Audit Compliance: Fallback decisions are logged for compliance
 * - ✅ Business Continuity: Sorting/filtering continues to work
 * 
 * @param {DateInput} input - Date input to parse
 * @param {string} entity - Entity class name for error context (e.g., 'Order', 'Product')
 * @param {string} field - Field name for error context (e.g., 'createdAt', 'updatedAt')
 * @returns {Date} Parsed Date object or current date (with critical error logging)
 * @throws {Error} In development environment when input is null/invalid
 * 
 * @example
 * ```typescript
 * import { parseRequiredTimestamp } from '@_lib/dates'
 * 
 * // In entity constructors:
 * class Order {
 *   public createdAt: Date = new Date()
 * 
 *   constructor(param?: Partial<Order>) {
 *     if (param?.createdAt) {
 *       // Throws in dev, logs + returns fallback in prod
 *       this.createdAt = parseRequiredTimestamp(
 *         param.createdAt,
 *         'Order',
 *         'createdAt'
 *       )
 *     }
 *   }
 * }
 * 
 * // Development behavior:
 * new Order({ createdAt: null })  // ❌ Throws Error
 * 
 * // Production behavior:
 * new Order({ createdAt: null })  // ✅ Returns new Date() + logs critical error
 * ```
 */
export function parseRequiredTimestamp(
	input: DateInput,
	entity: string,
	field: string
): Date {
	const parsed = parseDate(input)
	
	if (!parsed) {
		const isDevelopment = process.env.NODE_ENV === 'development'
		
		const context = {
			input,
			entity,
			field,
			location: 'parseRequiredTimestamp',
		}
		
		if (isDevelopment) {
			// Development: Fail fast - expose API bugs immediately
			logger.error('date.required_timestamp_missing', {
				...context,
				behavior: 'throw',
				message: 'Required timestamp is null/invalid - throwing error in development',
			})
			
			throw new Error(
				`[${entity}] Required timestamp field "${field}" is null or invalid. ` +
				`Input: ${JSON.stringify(input)}. ` +
				`This indicates an API contract violation. ` +
				`Fix the backend to always provide ${entity}.${field}.`
			)
		} else {
			// Production: Defensive - prevent crashes, maintain uptime
			logger.error('date.required_timestamp_missing_fallback', {
				...context,
				fallback: 'now',
				severity: 'critical',
				behavior: 'fallback',
				message: 'Required timestamp is null/invalid - using fallback in production',
				action_required: 'Investigate backend API response',
			})
			
			// Return current timestamp as fallback
			return new Date()
		}
	}
	
	return parsed
}

