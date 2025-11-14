/**
 * Date Formatting Utilities
 * 
 * Pure functions for formatting date values.
 * No dependencies, fully testable.
 * 
 * @module lib/formatters/date
 */

/**
 * Formats date values for display.
 * Handles Date objects, ISO strings, null, and undefined.
 * 
 * **Output Format:** "MMM DD, YYYY" (e.g., "Jan 15, 2024")
 * 
 * @param {Date|string|null|undefined} date - Date to format
 * @returns {string} Formatted date string or '-' if null/undefined
 * 
 * @example
 * ```typescript
 * formatDate(new Date('2024-01-15'));    // "Jan 15, 2024"
 * formatDate('2024-01-15T00:00:00Z');    // "Jan 15, 2024"
 * formatDate(null);                      // "-"
 * formatDate(undefined);                 // "-"
 * ```
 */
export function formatDate(date: Date | string | null | undefined): string {
	if (!date) return '-'
	
	// Convert string to Date if needed
	const d = typeof date === 'string' ? new Date(date) : date
	
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

