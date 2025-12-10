/**
 * Date Utilities - Constants
 * 
 * Centralized date format constants and defaults.
 * Ensures consistency across the application.
 * 
 * @module lib/dates/constants
 */

/**
 * Date Format Constants
 * 
 * Standard date format strings used throughout the application.
 * Based on date-fns format tokens.
 * 
 * @see https://date-fns.org/docs/format
 */
export const DATE_FORMATS = {
	/**
	 * Short date format: "Jan 15, 2024"
	 * Used for: Tables, cards, compact displays
	 */
	SHORT: 'MMM dd, yyyy',

	/**
	 * Long date format: "January 15, 2024"
	 * Used for: Headers, detailed views, formal displays
	 */
	LONG: 'MMMM dd, yyyy',

	/**
	 * Full date format: "Monday, January 15, 2024"
	 * Used for: Reports, formal documents
	 */
	FULL: 'EEEE, MMMM dd, yyyy',

	/**
	 * Date and time format: "Jan 15, 2024, 10:30 AM"
	 * Used for: Notifications, activity logs, timestamps
	 */
	DATETIME: 'MMM dd, yyyy, h:mm a',

	/**
	 * Date and time with seconds: "Jan 15, 2024, 10:30:45 AM"
	 * Used for: Debug logs, detailed timestamps
	 */
	DATETIME_FULL: 'MMM dd, yyyy, h:mm:ss a',

	/**
	 * HTML input format: "2024-01-15"
	 * Used for: HTML date input elements (required format)
	 */
	INPUT: 'yyyy-MM-dd',

	/**
	 * ISO 8601 format: "2024-01-15T10:30:00Z"
	 * Used for: API requests/responses, data exchange
	 */
	ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",

	/**
	 * ISO date-only format: "2024-01-15"
	 * Used for: API date-only fields
	 */
	ISO_DATE: 'yyyy-MM-dd',

	/**
	 * Year and month: "January 2024"
	 * Used for: Month selectors, reports
	 */
	YEAR_MONTH: 'MMMM yyyy',

	/**
	 * Year only: "2024"
	 * Used for: Year selectors, summaries
	 */
	YEAR: 'yyyy',
} as const

/**
 * Default date format used when no format is specified.
 * Matches the existing application standard: "Jan 15, 2024"
 */
export const DEFAULT_DATE_FORMAT = DATE_FORMATS.SHORT

/**
 * Fallback string displayed when date is null/undefined or invalid.
 * Maintains consistency with existing application behavior.
 */
export const DATE_FALLBACK = '-'

/**
 * Default locale for date formatting.
 * Currently en-US, can be extended for internationalization.
 */
export const DEFAULT_LOCALE = 'en-US'

/**
 * Milliseconds in common time units.
 * Used for date arithmetic and validation.
 */
export const TIME_UNITS = {
	/** Milliseconds in one second */
	SECOND: 1000,
	/** Milliseconds in one minute */
	MINUTE: 60 * 1000,
	/** Milliseconds in one hour */
	HOUR: 60 * 60 * 1000,
	/** Milliseconds in one day */
	DAY: 24 * 60 * 60 * 1000,
	/** Milliseconds in one week */
	WEEK: 7 * 24 * 60 * 60 * 1000,
} as const

/**
 * Date range preset definitions.
 * Maps preset keys to their respective day offsets.
 */
export const DATE_RANGE_PRESETS = {
	'7d': 7,
	'30d': 30,
	'90d': 90,
	'1y': 365,
} as const

