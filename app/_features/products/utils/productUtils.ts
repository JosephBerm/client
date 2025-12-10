/**
 * Product Utilities - Product-Related Utility Functions
 * 
 * Centralized utility functions for product-related operations.
 * Part of the Products feature module.
 * 
 * **Functions:**
 * - `getStockStatus()` - Get stock status configuration for Badge component
 * 
 * @module products/utils
 */

import type { BadgeProps } from '@_components/ui/Badge'

/**
 * Stock status configuration interface.
 * Compatible with Badge component props.
 */
export interface StockStatusConfig {
	/** Stock status label */
	label: string
	/** Badge variant */
	variant: BadgeProps['variant']
	/** Badge tone */
	tone: BadgeProps['tone']
	/** Badge size */
	size: BadgeProps['size']
}

/**
 * Get stock status configuration for Badge component.
 * 
 * Returns Badge-compatible props based on stock quantity.
 * Follows industry standard thresholds:
 * - 0: Out of Stock (error, solid)
 * - 1-9: Low Stock (warning, solid)
 * - 10+: In Stock (success, solid)
 * 
 * @param {number} stock - Stock quantity
 * @returns {StockStatusConfig} Badge-compatible stock status configuration
 * 
 * @example
 * ```typescript
 * import { getStockStatus } from '@_features/products';
 * 
 * const status = getStockStatus(5);
 * // Returns: { label: 'Low Stock', variant: 'warning', tone: 'solid', size: 'sm' }
 * 
 * <Badge variant={status.variant} tone={status.tone} size={status.size}>
 *   {status.label}
 * </Badge>
 * ```
 */
export function getStockStatus(stock: number): StockStatusConfig {
	if (stock === 0) {
		return {
			label: 'Out of Stock',
			variant: 'error' as const,
			tone: 'solid' as const,
			size: 'sm' as const,
		}
	}
	if (stock < 10) {
		return {
			label: 'Low Stock',
			variant: 'warning' as const,
			tone: 'solid' as const,
			size: 'sm' as const,
		}
	}
	return {
		label: 'In Stock',
		variant: 'success' as const,
		tone: 'solid' as const,
		size: 'sm' as const,
	}
}

