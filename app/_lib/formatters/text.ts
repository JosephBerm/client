/**
 * Text Formatting Utilities
 * 
 * Pure functions for formatting text values.
 * No dependencies, fully testable.
 * 
 * @module lib/formatters/text
 */

/**
 * Truncates long text with ellipsis.
 * 
 * @param {string|null|undefined} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 50)
 * @returns {string} Truncated text with '...' or '-' if null/undefined
 * 
 * @example
 * ```typescript
 * truncate('This is a very long description...', 20);
 * // "This is a very long..."
 * 
 * truncate('Short text', 50);
 * // "Short text"
 * 
 * truncate(null, 20);
 * // "-"
 * ```
 */
export function truncate(text: string | null | undefined, maxLength: number = 50): string {
	if (!text) return '-'
	if (text.length <= maxLength) return text
	
	return text.slice(0, maxLength) + '...'
}

