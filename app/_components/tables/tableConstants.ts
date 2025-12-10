/**
 * Table Constants
 * 
 * Centralized constants for table components to maintain consistency
 * and eliminate magic values across the application.
 * 
 * **FAANG-level best practice**: Single source of truth for all table-related constants.
 * 
 * @module tableConstants
 */

/**
 * Default page size options for table pagination.
 * These values represent common pagination choices that balance
 * performance and user experience.
 * 
 * @readonly
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const

/**
 * Default page size for tables when not specified.
 * 
 * @readonly
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Minimum allowed page size to prevent performance issues.
 * 
 * @readonly
 */
export const MIN_PAGE_SIZE = 1

/**
 * Maximum allowed page size to prevent performance issues.
 * 
 * @readonly
 */
export const MAX_PAGE_SIZE = 100

/**
 * Default empty message displayed when table has no data.
 * 
 * @readonly
 */
export const DEFAULT_EMPTY_MESSAGE = 'No data available'

/**
 * Default invalid configuration messages.
 */
export const TABLE_ERROR_MESSAGES = {
	NO_COLUMNS: 'Invalid table configuration: No columns defined',
	INVALID_DATA: 'Invalid table configuration: Data must be an array',
	INVALID_PAGE_SIZE: 'Invalid page size',
} as const

/**
 * Component name for logging context.
 * 
 * @readonly
 */
export const COMPONENT_NAME = 'DataTable'

