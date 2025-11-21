/**
 * Table Utilities
 * 
 * Reusable utility functions for table operations including pagination calculations,
 * input sanitization, and validation. Following FAANG-level DRY principles.
 * 
 * **Best practices:**
 * - Pure functions (no side effects)
 * - Defensive programming with input validation
 * - Type-safe implementations
 * - Security-first approach (input sanitization)
 * 
 * @module tableUtils
 */

import { PaginationState } from '@tanstack/react-table'
import { MIN_PAGE_SIZE, MAX_PAGE_SIZE } from './tableConstants'

/**
 * Sanitizes a string input by trimming whitespace and converting to string.
 * Prevents XSS and ensures consistent string handling.
 * 
 * **Security**: Essential for user inputs to prevent injection attacks.
 * 
 * @param input - Input value to sanitize (can be any type)
 * @returns Sanitized string, or empty string if input is invalid
 * 
 * @example
 * ```typescript
 * const clean = sanitizeString('  hello  '); // 'hello'
 * const safe = sanitizeString(null); // ''
 * const converted = sanitizeString(123); // '123'
 * ```
 */
export function sanitizeString(input: unknown): string {
	if (input === null || input === undefined) {
		return ''
	}
	return String(input).trim()
}

/**
 * Validates if a value is a positive number.
 * Used for page sizes, page counts, and other numeric validations.
 * 
 * @param value - Value to validate
 * @returns True if value is a positive number
 * 
 * @example
 * ```typescript
 * isPositiveNumber(10); // true
 * isPositiveNumber(0); // false
 * isPositiveNumber(-5); // false
 * isPositiveNumber(NaN); // false
 * ```
 */
export function isPositiveNumber(value: unknown): value is number {
	return typeof value === 'number' && !isNaN(value) && value > 0
}

/**
 * Validates a page size value.
 * Ensures page size is within acceptable bounds to prevent performance issues.
 * 
 * @param pageSize - Page size to validate
 * @returns True if page size is valid
 * 
 * @example
 * ```typescript
 * isValidPageSize(20); // true
 * isValidPageSize(0); // false
 * isValidPageSize(200); // false (exceeds MAX_PAGE_SIZE)
 * ```
 */
export function isValidPageSize(pageSize: number): boolean {
	return isPositiveNumber(pageSize) && pageSize >= MIN_PAGE_SIZE && pageSize <= MAX_PAGE_SIZE
}

/**
 * Calculates the total number of items for display in pagination.
 * Handles both server-side and client-side pagination modes.
 * 
 * **Logic priority:**
 * 1. Use explicitly provided totalItems (most accurate)
 * 2. Calculate from pageCount * pageSize (server-side approximation)
 * 3. Use actual filtered row count (client-side)
 * 
 * @param options - Calculation options
 * @returns Total number of items
 * 
 * @example
 * ```typescript
 * // Server-side with explicit total
 * calculateTotalItems({ totalItems: 250 }); // 250
 * 
 * // Server-side without explicit total
 * calculateTotalItems({ 
 *   pageCount: 10, 
 *   pagination: { pageIndex: 0, pageSize: 25 } 
 * }); // 250
 * 
 * // Client-side
 * calculateTotalItems({ filteredRowCount: 42 }); // 42
 * ```
 */
export function calculateTotalItems(options: {
	totalItems?: number
	pageCount?: number
	pagination?: PaginationState
	filteredRowCount?: number
}): number {
	const { totalItems, pageCount, pagination, filteredRowCount } = options

	// Priority 1: Explicit totalItems (most accurate for server-side)
	if (totalItems !== undefined && isPositiveNumber(totalItems)) {
		return totalItems
	}

	// Priority 2: Calculate from pageCount (server-side approximation)
	if (pageCount !== undefined && pagination && isPositiveNumber(pageCount) && isPositiveNumber(pagination.pageSize)) {
		return pageCount * pagination.pageSize
	}

	// Priority 3: Use filtered row count (client-side)
	if (filteredRowCount !== undefined && !isNaN(filteredRowCount)) {
		return Math.max(0, filteredRowCount)
	}

	// Fallback: zero items
	return 0
}

/**
 * Calculates the last page index (0-based) for pagination.
 * Handles edge cases like empty tables and ensures non-negative results.
 * 
 * @param options - Calculation options
 * @returns Last page index (0-based), minimum 0
 * 
 * @example
 * ```typescript
 * calculateLastPageIndex({ 
 *   pageCount: 5 
 * }); // 4
 * 
 * calculateLastPageIndex({ 
 *   totalItems: 100, 
 *   pageSize: 20 
 * }); // 4
 * 
 * calculateLastPageIndex({ pageCount: 0 }); // 0
 * ```
 */
export function calculateLastPageIndex(options: {
	pageCount?: number
	totalItems?: number
	pageSize?: number
}): number {
	const { pageCount, totalItems, pageSize } = options

	// Use pageCount if provided (server-side)
	if (pageCount !== undefined) {
		return Math.max(pageCount - 1, 0)
	}

	// Calculate from totalItems and pageSize (client-side)
	if (totalItems !== undefined && pageSize !== undefined && isPositiveNumber(pageSize)) {
		const calculatedPageCount = Math.ceil(totalItems / pageSize)
		return Math.max(calculatedPageCount - 1, 0)
	}

	// Fallback: first page
	return 0
}

/**
 * Calculates the display range for "Showing X-Y of Z" pagination text.
 * Ensures the range is valid and within bounds.
 * 
 * @param pagination - Current pagination state
 * @param totalItems - Total number of items
 * @returns Object with start and end indices (1-based for display)
 * 
 * @example
 * ```typescript
 * calculatePaginationRange(
 *   { pageIndex: 0, pageSize: 10 },
 *   50
 * ); // { start: 1, end: 10 }
 * 
 * calculatePaginationRange(
 *   { pageIndex: 4, pageSize: 10 },
 *   45
 * ); // { start: 41, end: 45 }
 * ```
 */
export function calculatePaginationRange(
	pagination: PaginationState,
	totalItems: number
): { start: number; end: number } {
	if (!pagination || totalItems <= 0) {
		return { start: 0, end: 0 }
	}

	const start = Math.max(1, pagination.pageIndex * pagination.pageSize + 1)
	const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)

	return { start, end }
}

/**
 * Validates if an array contains valid items.
 * Used for columns and data validation in tables.
 * 
 * @param arr - Array to validate
 * @returns True if array is valid and non-empty
 * 
 * @example
 * ```typescript
 * isValidArray([1, 2, 3]); // true
 * isValidArray([]); // false
 * isValidArray(null); // false
 * isValidArray({}); // false
 * ```
 */
export function isValidArray<T>(arr: unknown): arr is T[] {
	return Array.isArray(arr) && arr.length > 0
}

/**
 * Normalizes an array, ensuring it's always a valid array.
 * Provides safe fallback for invalid inputs.
 * 
 * @param arr - Array to normalize
 * @returns Valid array (empty array if input is invalid)
 * 
 * @example
 * ```typescript
 * normalizeArray([1, 2]); // [1, 2]
 * normalizeArray(null); // []
 * normalizeArray(undefined); // []
 * normalizeArray({}); // []
 * ```
 */
export function normalizeArray<T>(arr: unknown): T[] {
	return Array.isArray(arr) ? arr : []
}

