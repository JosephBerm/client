/**
 * Currency Formatting Utilities
 * 
 * Pure functions for formatting currency values.
 * No dependencies, fully testable.
 * 
 * @module lib/formatters/currency
 */

/**
 * Formats currency values to USD format.
 * 
 * **Output Format:** "$#,###.##" (e.g., "$1,234.56")
 * 
 * @param {number|null|undefined} amount - Amount to format
 * @returns {string} Formatted currency string or '-' if null/undefined
 * 
 * @example
 * ```typescript
 * formatCurrency(1234.56);    // "$1,234.56"
 * formatCurrency(1000000);    // "$1,000,000.00"
 * formatCurrency(null);       // "-"
 * formatCurrency(0);          // "$0.00"
 * ```
 */
export function formatCurrency(amount: number | null | undefined): string {
	if (amount === null || amount === undefined) {return '-'}
	
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}

