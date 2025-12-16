/**
 * Lib - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Pure utility functions with no side effects.
 * Safe to use in both Server and Client Components.
 * 
 * **Architecture:**
 * - No React dependencies
 * - No browser APIs
 * - No side effects
 * - Fully server-safe
 * 
 * **Usage:**
 * Import from `@_lib` for maximum convenience and optimal tree-shaking.
 * 
 * @example
 * ```typescript
 * import { formatCurrency, formatDate, parseDate, addDays } from '@_lib'
 * 
 * // All functions work in Server Components
 * export default async function Page() {
 *   const price = formatCurrency(1234.56)
 *   const date = formatDate(new Date())
 *   return <div>{price} on {date}</div>
 * }
 * ```
 * 
 * @module lib
 */

// ============================================================================
// FORMATTERS (Pure Functions - Server + Client Safe)
// ============================================================================

// Currency
export { formatCurrency } from './formatters/currency'

// Finance
export {
	formatFinanceCurrency,
	formatFinanceNumber,
	isEmptyFinanceData,
	isValidFinanceData,
} from './formatters/finance'

// Text
export { truncate } from './formatters/text'

// ============================================================================
// DATE UTILITIES (Pure Functions - Server + Client Safe)
// ============================================================================

// Types
export type {
	DateInput,
	DateFormat,
	DateRangePreset,
	DateRange,
	DateValidationResult,
} from './dates/types'

// Constants
export {
	DATE_FORMATS,
	DEFAULT_DATE_FORMAT,
	DATE_FALLBACK,
	DEFAULT_LOCALE,
	TIME_UNITS,
	DATE_RANGE_PRESETS,
} from './dates/constants'

// Parsing
export {
	parseDate,
	parseDateSafe,
	parseDateOrNow,
	parseDateWithFallback,
	parseDates,
	parseRequiredTimestamp,
} from './dates/parse'

// Formatting
export {
	formatDate,
	formatDateShort,
	formatDateLong,
	formatDateTime,
	formatDateForInput,
	formatDateFull,
	formatYearMonth,
	formatYear,
} from './dates/format'

// Serialization
export {
	serializeDate,
	serializeDateOnly,
	serializeDateForAPI,
	serializeDateRange,
	serializeTimestamp,
} from './dates/serialize'

// Manipulation
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
} from './dates/manipulate'

// Validation
export {
	isValidDate,
	isDateInRange,
	isDateInPast,
	isDateInFuture,
	validateDate,
	validateDateRange,
} from './dates/validate'

// ============================================================================
// COMPANY CONSTANTS (Pure Data - Server + Client Safe)
// ============================================================================

// Company Contact Information
export {
	COMPANY_CONTACT,
	type CompanyContact,
} from './constants/company'

