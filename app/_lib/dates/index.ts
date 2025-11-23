/**
 * Date Utilities - Main Barrel Export
 * 
 * Centralized date handling utilities built on date-fns.
 * Provides consistent, type-safe date operations across the application.
 * 
 * **Features**:
 * - Safe parsing from various input formats
 * - Consistent formatting with preset formats
 * - ISO 8601 serialization for API communication
 * - Immutable date manipulation
 * - Comprehensive validation
 * 
 * **Usage**:
 * ```typescript
 * import { parseDate, formatDate, serializeDate } from '@_lib/dates'
 * 
 * // Parse from API response
 * const date = parseDate(response.createdAt)
 * 
 * // Format for display
 * const formatted = formatDate(date, 'short')  // "Jan 15, 2024"
 * 
 * // Serialize for API request
 * const serialized = serializeDate(date)  // "2024-01-15T10:30:00.000Z"
 * ```
 * 
 * @module lib/dates
 */

// Type definitions
export type { DateInput, DateFormat, DateRangePreset, DateRange, DateValidationResult } from './types'

// Constants
export {
	DATE_FORMATS,
	DEFAULT_DATE_FORMAT,
	DATE_FALLBACK,
	DEFAULT_LOCALE,
	TIME_UNITS,
	DATE_RANGE_PRESETS,
} from './constants'

// Parsing utilities
export { parseDate, parseDateSafe, parseDateOrNow, parseDateWithFallback, parseDates, parseRequiredTimestamp } from './parse'

// Formatting utilities
export {
	formatDate,
	formatDateShort,
	formatDateLong,
	formatDateTime,
	formatDateForInput,
	formatDateFull,
	formatYearMonth,
	formatYear,
} from './format'

// Serialization utilities
export {
	serializeDate,
	serializeDateOnly,
	serializeDateForAPI,
	serializeDateRange,
	serializeTimestamp,
} from './serialize'

// Manipulation utilities
export {
	addDays,
	subtractDays,
	addMonths,
	subtractMonths,
	addYears,
	subtractYears,
	getDateRange,
	getStartOfDay,
	getEndOfDay,
	getStartOfMonth,
	getEndOfMonth,
	getStartOfYear,
	getEndOfYear,
} from './manipulate'

// Validation utilities
export {
	isValidDate,
	isDateInRange,
	isDateInPast,
	isDateInFuture,
	validateDate,
	validateDateRange,
} from './validate'

