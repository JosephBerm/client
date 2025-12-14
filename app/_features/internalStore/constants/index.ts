/**
 * Internal Store Feature Constants
 * 
 * Configuration constants for product management.
 * 
 * @module internalStore/constants
 */

import type { StockStatusConfig } from '../types'

/**
 * Stock status configuration for badge display.
 * Based on stock quantity thresholds.
 */
export const STOCK_STATUS_CONFIG: Record<string, StockStatusConfig> = {
	IN_STOCK: {
		variant: 'success',
		label: 'In Stock',
		description: 'Product is available for ordering',
	},
	LOW_STOCK: {
		variant: 'warning',
		label: 'Low Stock',
		description: 'Stock is running low (< 10 units)',
	},
	OUT_OF_STOCK: {
		variant: 'error',
		label: 'Out of Stock',
		description: 'Product is currently unavailable',
	},
} as const

/**
 * Get stock status configuration based on quantity.
 * 
 * @param stock - Current stock quantity
 * @returns Stock status configuration
 */
export function getStockStatusConfig(stock: number): StockStatusConfig {
	if (stock <= 0) {
		return STOCK_STATUS_CONFIG.OUT_OF_STOCK
	}
	if (stock < 10) {
		return STOCK_STATUS_CONFIG.LOW_STOCK
	}
	return STOCK_STATUS_CONFIG.IN_STOCK
}

/**
 * Low stock threshold for alerts and filtering.
 */
export const LOW_STOCK_THRESHOLD = 10

/**
 * Default page size for product tables.
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Sort options for product table.
 */
export const PRODUCT_SORT_OPTIONS = [
	{ value: 'createdAt', label: 'Date Created' },
	{ value: 'name', label: 'Name' },
	{ value: 'price', label: 'Price' },
	{ value: 'stock', label: 'Stock Level' },
	{ value: 'category', label: 'Category' },
] as const

/**
 * Default includes for product API requests.
 */
export const PRODUCT_API_INCLUDES = ['Categories'] as const

