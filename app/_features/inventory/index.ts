/**
 * Inventory Feature Module
 *
 * Provides complete inventory management functionality for MedSource Pro.
 *
 * **Features:**
 * - Stock tracking with quantities on hand, reserved, and available
 * - Low stock alerts with configurable reorder points
 * - Transaction history with full audit trail
 * - Availability checking for orders
 * - Bulk stock operations
 *
 * **Usage:**
 * ```typescript
 * import {
 *   // Types
 *   InventoryStatus,
 *   type ProductInventory,
 *   // Hooks
 *   useInventory,
 *   useInventoryStats,
 *   useLowStockItems,
 * } from '@_features/inventory'
 *
 * // For API calls, use centralized API object:
 * import API from '@_shared/services/api'
 * await API.Inventory.getStats()
 * ```
 *
 * @module inventory
 */

// Types and Enums
export {
	// Enums
	InventoryStatus,
	InventoryTransactionType,
	// Helper functions
	getInventoryStatusLabel,
	getInventoryStatusColor,
	getTransactionTypeLabel,
} from './types'

export type {
	// Core entities
	ProductInventory,
	InventoryTransaction,
	// Request DTOs
	ReceiveStockRequest,
	AdjustStockRequest,
	InventorySettingsRequest,
	InitializeInventoryRequest,
	AvailabilityCheckItem,
	StockReceiptItem,
	BulkReceiveRequest,
	// Response DTOs
	InventoryStats,
	AvailabilityResult,
	InventoryResult,
	ProductInventorySummary,
	InventoryTransactionSummary,
	// Filter/Search DTOs
	InventorySearchFilter,
	PagedInventoryResult,
} from './types'

// Hooks
export {
	// Query key factory
	inventoryKeys,
	// Query hooks
	useInventory,
	useAllInventory,
	useInventorySearch,
	useLowStockItems,
	useOutOfStockItems,
	useInventoryStats,
	useInventoryTransactions,
	useProductAvailability,
	// Mutation hooks
	useInitializeInventory,
	useReceiveStock,
	useAdjustStock,
	useUpdateInventorySettings,
	useCheckBulkAvailability,
	useBulkReceiveStock,
} from './hooks'
