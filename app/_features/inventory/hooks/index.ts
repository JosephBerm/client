/**
 * Inventory Hooks - Barrel Export
 * @module inventory/hooks
 */

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
} from './useInventory'
