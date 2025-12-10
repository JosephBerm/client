/**
 * Date Utilities - Type Definitions
 * 
 * Shared types and interfaces for date handling across the application.
 * Provides type-safe contracts for all date operations.
 * 
 * @module lib/dates/types
 */

/**
 * Date Input Type
 * 
 * Accepts various date representations for flexible parsing:
 * - Date object: Native JavaScript Date
 * - string: ISO 8601, date-only (YYYY-MM-DD), or other parseable formats
 * - number: Unix timestamp (milliseconds since epoch)
 * - null/undefined: Represents absence of date
 * 
 * @example
 * ```typescript
 * const inputs: DateInput[] = [
 *   new Date(),                    // Date object
 *   '2024-01-15T10:30:00Z',       // ISO 8601 string
 *   '2024-01-15',                 // Date-only string
 *   1705318200000,                // Unix timestamp
 *   null,                         // No date
 *   undefined                     // No date
 * ]
 * ```
 */
export type DateInput = Date | string | number | null | undefined

/**
 * Date Format Type
 * 
 * Predefined format strings for common date display patterns.
 * Also accepts custom date-fns format strings for flexibility.
 * 
 * **Preset Formats**:
 * - `short`: "Jan 15, 2024" (MMM dd, yyyy)
 * - `long`: "January 15, 2024" (MMMM dd, yyyy)
 * - `datetime`: "Jan 15, 2024, 10:30 AM" (MMM dd, yyyy, h:mm a)
 * - `input`: "2024-01-15" (yyyy-MM-dd) - HTML date input compatible
 * - `iso`: "2024-01-15T10:30:00Z" (ISO 8601)
 * - Custom: Any valid date-fns format string
 * 
 * @example
 * ```typescript
 * const formats: DateFormat[] = [
 *   'short',              // Preset
 *   'long',               // Preset
 *   'datetime',           // Preset
 *   'input',              // Preset
 *   'yyyy-MM-dd HH:mm',   // Custom format
 *   'PPP'                 // date-fns format token
 * ]
 * ```
 */
export type DateFormat = 'short' | 'long' | 'datetime' | 'input' | 'iso' | string

/**
 * Date Range Preset Type
 * 
 * Common date range presets for analytics and filtering.
 * 
 * **Presets**:
 * - `7d`: Last 7 days
 * - `30d`: Last 30 days
 * - `90d`: Last 90 days
 * - `1y`: Last 1 year
 * - `ytd`: Year to date (January 1 to today)
 * - `mtd`: Month to date (1st of month to today)
 * 
 * @example
 * ```typescript
 * const range: DateRangePreset = '30d'
 * const dateRange = getDateRange(range)
 * // Returns: { from: Date(30 days ago), to: Date(now) }
 * ```
 */
export type DateRangePreset = '7d' | '30d' | '90d' | '1y' | 'ytd' | 'mtd'

/**
 * Date Range Interface
 * 
 * Represents a date range with start and end dates.
 * Used for filtering, analytics, and date range pickers.
 * 
 * @example
 * ```typescript
 * const range: DateRange = {
 *   from: new Date('2024-01-01'),
 *   to: new Date('2024-01-31')
 * }
 * ```
 */
export interface DateRange {
	/** Start date of range (inclusive) */
	from: Date
	/** End date of range (inclusive) */
	to: Date
}

/**
 * Date Validation Result Interface
 * 
 * Result of date validation operations with optional error details.
 * Provides structured feedback for form validation.
 * 
 * @example
 * ```typescript
 * const result: DateValidationResult = {
 *   valid: false,
 *   error: 'Date must be in the future',
 *   code: 'date.past'
 * }
 * ```
 */
export interface DateValidationResult {
	/** Whether the date is valid */
	valid: boolean
	/** Human-readable error message (if invalid) */
	error?: string
	/** Machine-readable error code (if invalid) */
	code?: string
}

