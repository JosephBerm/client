/**
 * Finance Formatting and Validation Utilities
 * 
 * Pure functions for formatting and validating finance/analytics data.
 * No dependencies, fully testable, server + client safe.
 * 
 * **Features:**
 * - Currency formatting with safe fallbacks
 * - Number formatting with locale support
 * - Finance data validation
 * - Empty data detection
 * 
 * @module lib/formatters/finance
 */

import FinanceNumbers from '@_classes/FinanceNumbers'

/**
 * Formats a number as currency with safe fallbacks.
 * Returns $0.00 for invalid, negative, or zero values.
 * 
 * @param value - Number to format
 * @returns Formatted currency string (e.g., "$1,234.56" or "$0.00")
 * 
 * @example
 * ```typescript
 * formatFinanceCurrency(1234.56);  // "$1,234.56"
 * formatFinanceCurrency(0);        // "$0.00"
 * formatFinanceCurrency(NaN);     // "$0.00"
 * formatFinanceCurrency(-100);     // "$0.00"
 * ```
 */
export function formatFinanceCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(Number.isFinite(value) && value >= 0 ? value : 0)
}

/**
 * Formats a number with locale-specific formatting.
 * Returns '0' for invalid or negative values.
 * 
 * @param value - Number to format
 * @returns Formatted number string (e.g., "1,234" or "0")
 * 
 * @example
 * ```typescript
 * formatFinanceNumber(1234);   // "1,234"
 * formatFinanceNumber(0);      // "0"
 * formatFinanceNumber(NaN);    // "0"
 * formatFinanceNumber(-100);   // "0"
 * ```
 */
export function formatFinanceNumber(value: number): string {
	if (!Number.isFinite(value) || value < 0) {
		return '0'
	}
	return value.toLocaleString()
}

/**
 * Checks if finance numbers contain any actual data.
 * Returns true if all values are zero or empty.
 * 
 * @param financeNumbers - FinanceNumbers instance to check
 * @returns true if all values are zero, false otherwise
 * 
 * @example
 * ```typescript
 * const empty = new FinanceNumbers();
 * isEmptyFinanceData(empty);  // true
 * 
 * const withData = new FinanceNumbers({
 *   sales: new FSales({ totalRevenue: 1000 })
 * });
 * isEmptyFinanceData(withData);  // false
 * ```
 */
export function isEmptyFinanceData(financeNumbers: FinanceNumbers): boolean {
	const { sales, orders } = financeNumbers
	return (
		sales.totalSales === 0 &&
		sales.totalRevenue === 0 &&
		sales.totalCost === 0 &&
		sales.totalProfit === 0 &&
		sales.totalDiscount === 0 &&
		sales.totalTax === 0 &&
		sales.totalShipping === 0 &&
		orders.totalOrders === 0 &&
		orders.totalProductsSold === 0
	)
}

/**
 * Validates that the payload from API is valid FinanceNumbers data.
 * Returns true if data is valid, false otherwise.
 * 
 * @param payload - Unknown payload to validate
 * @returns true if payload is valid FinanceNumbers structure
 * 
 * @example
 * ```typescript
 * const valid = { sales: { totalRevenue: 1000 }, orders: { totalOrders: 10 } };
 * isValidFinanceData(valid);  // true
 * 
 * const invalid = { sales: null };
 * isValidFinanceData(invalid);  // false
 * ```
 */
export function isValidFinanceData(payload: unknown): payload is FinanceNumbers {
	if (!payload || typeof payload !== 'object') {
		return false
	}

	const data = payload as Partial<FinanceNumbers>
	
	// Check if it has the expected structure
	if (!data.sales || !data.orders) {
		return false
	}

	// Validate sales data (TypeScript now knows data.sales exists)
	const { totalSales, totalRevenue, totalCost, totalProfit, totalDiscount, totalTax, totalShipping } = data.sales
	if (
		typeof totalSales !== 'number' ||
		typeof totalRevenue !== 'number' ||
		typeof totalCost !== 'number' ||
		typeof totalProfit !== 'number' ||
		typeof totalDiscount !== 'number' ||
		typeof totalTax !== 'number' ||
		typeof totalShipping !== 'number'
	) {
		return false
	}

	// Validate orders data (TypeScript now knows data.orders exists)
	if (
		typeof data.orders.totalOrders !== 'number' ||
		typeof data.orders.totalProductsSold !== 'number'
	) {
		return false
	}

	return true
}
