/**
 * Date Utilities - Validation
 * 
 * Date validation utilities for forms and business logic.
 * All functions handle null/undefined safely.
 * 
 * @module lib/dates/validate
 */

import { isValid as isValidDateFns, isBefore, isAfter, isWithinInterval } from 'date-fns'
import { parseDate } from './parse'
import type { DateInput, DateValidationResult } from './types'

/**
 * Checks if a date input is valid.
 * Returns false for null, undefined, or invalid dates.
 * 
 * @param {DateInput} date - Date input to validate
 * @returns {boolean} True if date is valid
 * 
 * @example
 * ```typescript
 * import { isValidDate } from '@_lib/dates'
 * 
 * isValidDate(new Date('2024-01-15'))  // true
 * isValidDate('2024-01-15')  // true
 * isValidDate('invalid')  // false
 * isValidDate(null)  // false
 * isValidDate(undefined)  // false
 * ```
 */
export function isValidDate(date: DateInput): boolean {
	const parsed = parseDate(date)
	return parsed !== null && isValidDateFns(parsed)
}

/**
 * Checks if a date is within a specified range (inclusive).
 * 
 * @param {Date} date - Date to check
 * @param {Date} from - Start of range (inclusive)
 * @param {Date} to - End of range (inclusive)
 * @returns {boolean} True if date is within range
 * 
 * @example
 * ```typescript
 * import { isDateInRange } from '@_lib/dates'
 * 
 * const date = new Date('2024-01-15')
 * const from = new Date('2024-01-01')
 * const to = new Date('2024-01-31')
 * 
 * isDateInRange(date, from, to)  // true
 * ```
 */
export function isDateInRange(date: Date, from: Date, to: Date): boolean {
	try {
		return isWithinInterval(date, { start: from, end: to })
	} catch {
		return false
	}
}

/**
 * Checks if a date is in the past.
 * 
 * @param {Date} date - Date to check
 * @param {Date} [baseDate=new Date()] - Base date to compare against (defaults to now)
 * @returns {boolean} True if date is in the past
 * 
 * @example
 * ```typescript
 * import { isDateInPast } from '@_lib/dates'
 * 
 * isDateInPast(new Date('2020-01-01'))  // true
 * isDateInPast(new Date('2030-01-01'))  // false
 * ```
 */
export function isDateInPast(date: Date, baseDate: Date = new Date()): boolean {
	return isBefore(date, baseDate)
}

/**
 * Checks if a date is in the future.
 * 
 * @param {Date} date - Date to check
 * @param {Date} [baseDate=new Date()] - Base date to compare against (defaults to now)
 * @returns {boolean} True if date is in the future
 * 
 * @example
 * ```typescript
 * import { isDateInFuture } from '@_lib/dates'
 * 
 * isDateInFuture(new Date('2030-01-01'))  // true
 * isDateInFuture(new Date('2020-01-01'))  // false
 * ```
 */
export function isDateInFuture(date: Date, baseDate: Date = new Date()): boolean {
	return isAfter(date, baseDate)
}

/**
 * Validates a date with detailed error information.
 * Returns validation result with error message if invalid.
 * 
 * @param {DateInput} date - Date to validate
 * @param {Object} options - Validation options
 * @param {boolean} [options.required=false] - Whether date is required
 * @param {Date} [options.minDate] - Minimum allowed date
 * @param {Date} [options.maxDate] - Maximum allowed date
 * @param {boolean} [options.futureOnly=false] - Allow only future dates
 * @param {boolean} [options.pastOnly=false] - Allow only past dates
 * @returns {DateValidationResult} Validation result with error details
 * 
 * @example
 * ```typescript
 * import { validateDate } from '@_lib/dates'
 * 
 * // Required date
 * const result1 = validateDate(null, { required: true })
 * // Returns: { valid: false, error: 'Date is required', code: 'date.required' }
 * 
 * // Future date only
 * const result2 = validateDate(new Date('2020-01-01'), { futureOnly: true })
 * // Returns: { valid: false, error: 'Date must be in the future', code: 'date.past' }
 * 
 * // Date range validation
 * const result3 = validateDate(date, {
 *   minDate: new Date('2024-01-01'),
 *   maxDate: new Date('2024-12-31')
 * })
 * 
 * // In forms
 * const validation = validateDate(formData.deliveryDate, {
 *   required: true,
 *   futureOnly: true
 * })
 * if (!validation.valid) {
 *   setError('deliveryDate', validation.error)
 * }
 * ```
 */
export function validateDate(
	date: DateInput,
	options: {
		required?: boolean
		minDate?: Date
		maxDate?: Date
		futureOnly?: boolean
		pastOnly?: boolean
	} = {}
): DateValidationResult {
	const { required = false, minDate, maxDate, futureOnly = false, pastOnly = false } = options

	// Check if date is provided (when required)
	if (required && !date) {
		return {
			valid: false,
			error: 'Date is required',
			code: 'date.required',
		}
	}

	// If not required and not provided, it's valid
	if (!date) {
		return { valid: true }
	}

	// Parse date
	const parsed = parseDate(date)
	if (!parsed) {
		return {
			valid: false,
			error: 'Invalid date format',
			code: 'date.invalid',
		}
	}

	// Check future only
	if (futureOnly && !isDateInFuture(parsed)) {
		return {
			valid: false,
			error: 'Date must be in the future',
			code: 'date.past',
		}
	}

	// Check past only
	if (pastOnly && !isDateInPast(parsed)) {
		return {
			valid: false,
			error: 'Date must be in the past',
			code: 'date.future',
		}
	}

	// Check minimum date
	if (minDate && isBefore(parsed, minDate)) {
		return {
			valid: false,
			error: 'Date is before minimum allowed date',
			code: 'date.before_min',
		}
	}

	// Check maximum date
	if (maxDate && isAfter(parsed, maxDate)) {
		return {
			valid: false,
			error: 'Date is after maximum allowed date',
			code: 'date.after_max',
		}
	}

	return { valid: true }
}

/**
 * Validates a date range (from/to dates).
 * Ensures 'from' is before 'to' and both dates are valid.
 * 
 * @param {DateInput} from - Start date
 * @param {DateInput} to - End date
 * @returns {DateValidationResult} Validation result
 * 
 * @example
 * ```typescript
 * import { validateDateRange } from '@_lib/dates'
 * 
 * const result = validateDateRange(
 *   filter.fromDate,
 *   filter.toDate
 * )
 * 
 * if (!result.valid) {
 *   showError(result.error)
 * }
 * ```
 */
export function validateDateRange(from: DateInput, to: DateInput): DateValidationResult {
	const fromParsed = parseDate(from)
	const toParsed = parseDate(to)

	if (!fromParsed) {
		return {
			valid: false,
			error: 'Start date is invalid',
			code: 'date.range.from_invalid',
		}
	}

	if (!toParsed) {
		return {
			valid: false,
			error: 'End date is invalid',
			code: 'date.range.to_invalid',
		}
	}

	if (isAfter(fromParsed, toParsed)) {
		return {
			valid: false,
			error: 'Start date must be before end date',
			code: 'date.range.invalid_order',
		}
	}

	return { valid: true }
}

