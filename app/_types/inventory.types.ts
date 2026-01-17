/**
 * Inventory Types
 *
 * Type definitions for inventory management functionality.
 * Used by the /app/inventory page and related components.
 *
 * **Inventory Concepts:**
 * - On-Hand: Physical stock in warehouse
 * - Reserved: Stock allocated to pending quotes/orders
 * - Available: On-Hand minus Reserved (can be sold)
 *
 * @module types/inventory
 */

// =========================================================================
// INVENTORY DATA TYPES
// =========================================================================

/**
 * Product inventory record with extended stock information.
 * Combines product data with detailed inventory metrics.
 */
export interface InventoryItem {
	/** Product ID */
	productId: string
	/** Product SKU */
	sku: string
	/** Product name */
	name: string
	/** Product category */
	category: string
	/** Manufacturer */
	manufacturer: string
	/** Physical stock in warehouse */
	onHand: number
	/** Stock reserved for quotes/orders */
	reserved: number
	/** Available for new orders (onHand - reserved) */
	available: number
	/** Minimum stock level before reorder alert */
	reorderPoint: number
	/** Whether stock is below reorder point */
	lowStock: boolean
	/** Whether product is out of stock */
	outOfStock: boolean
	/** Last stock update timestamp */
	lastUpdated: Date | null
	/** Unit cost (vendor cost) */
	unitCost: number | null
	/** Total inventory value (onHand × unitCost) */
	inventoryValue: number | null
}

/**
 * Inventory transaction types
 */
export type InventoryTransactionType =
	| 'RECEIPT' // Stock received from vendor
	| 'ADJUSTMENT' // Manual adjustment
	| 'RESERVE' // Reserved for quote/order
	| 'RELEASE' // Released reservation (cancelled)
	| 'SHIP' // Shipped to customer
	| 'RETURN' // Returned from customer
	| 'WRITE_OFF' // Damaged/lost/expired

/**
 * Inventory transaction record for audit trail
 */
export interface InventoryTransaction {
	id: string
	productId: string
	productName: string
	type: InventoryTransactionType
	quantity: number
	previousOnHand: number
	newOnHand: number
	referenceId: string | null // Order ID, Quote ID, etc.
	referenceType: 'ORDER' | 'QUOTE' | 'MANUAL' | null
	notes: string | null
	createdBy: string
	createdAt: Date
}

// =========================================================================
// INVENTORY STATS TYPES
// =========================================================================

/**
 * Inventory summary statistics
 */
export interface InventoryStats {
	/** Total number of products */
	totalProducts: number
	/** Products with stock > 0 */
	inStockProducts: number
	/** Products with stock = 0 */
	outOfStockProducts: number
	/** Products below reorder point */
	lowStockProducts: number
	/** Total inventory value */
	totalInventoryValue: number
	/** Total units on hand */
	totalUnitsOnHand: number
	/** Total units reserved */
	totalUnitsReserved: number
}

// =========================================================================
// INVENTORY FILTER TYPES
// =========================================================================

/**
 * Stock status filter options
 */
export type StockStatusFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'

/**
 * Inventory page filters
 */
export interface InventoryFilters {
	stockStatus: StockStatusFilter
	category: string | null
	search: string
}

// =========================================================================
// INVENTORY TAB TYPES
// =========================================================================

/**
 * Inventory page tab IDs
 */
export type InventoryTabId = 'overview' | 'transactions' | 'alerts'
