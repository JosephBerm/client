/**
 * Inventory API Module
 *
 * Stock tracking, low stock alerts, and inventory adjustments.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/inventory
 */

import type {
	AdjustStockRequest,
	AvailabilityCheckItem,
	AvailabilityResult,
	BulkReceiveRequest,
	InitializeInventoryRequest,
	InventoryResult,
	InventorySearchFilter,
	InventorySettingsRequest,
	InventoryStats,
	InventoryTransaction,
	PagedInventoryResult,
	ProductInventory,
	ProductInventorySummary,
	ReceiveStockRequest,
} from '@_features/inventory/types'

import { HttpService } from '../httpService'

// =========================================================================
// INVENTORY API
// =========================================================================

/**
 * Inventory Management API (MVP Feature #01)
 * Stock tracking, low stock alerts, and inventory adjustments.
 *
 * @see 01_INVENTORY_MANAGEMENT_PLAN.md
 */
export const InventoryApi = {
	/**
	 * Gets inventory for a specific product.
	 */
	getByProductId: async (productId: string) => HttpService.get<ProductInventory>(`/inventory/${productId}`),

	/**
	 * Gets all inventory records.
	 */
	getAll: async (lowStockOnly = false) => {
		const url = lowStockOnly ? '/inventory?lowStockOnly=true' : '/inventory'
		return HttpService.get<ProductInventory[]>(url)
	},

	/**
	 * Gets low stock items (below reorder point).
	 */
	getLowStock: async () => HttpService.get<ProductInventory[]>('/inventory/low-stock'),

	/**
	 * Gets out of stock items.
	 */
	getOutOfStock: async () => HttpService.get<ProductInventory[]>('/inventory/out-of-stock'),

	/**
	 * Searches inventory with filters and pagination.
	 */
	search: async (filter: InventorySearchFilter) =>
		HttpService.post<PagedInventoryResult<ProductInventorySummary>>('/inventory/search', filter),

	/**
	 * Gets inventory statistics for dashboard.
	 */
	getStats: async () => HttpService.get<InventoryStats>('/inventory/stats'),

	/**
	 * Gets transaction history for a product.
	 */
	getTransactions: async (productId: string, options?: { fromDate?: Date; toDate?: Date; limit?: number }) => {
		const params = new URLSearchParams()
		if (options?.fromDate) params.set('fromDate', options.fromDate.toISOString())
		if (options?.toDate) params.set('toDate', options.toDate.toISOString())
		if (options?.limit) params.set('limit', options.limit.toString())
		const query = params.toString()
		return HttpService.get<InventoryTransaction[]>(`/inventory/${productId}/transactions${query ? `?${query}` : ''}`)
	},

	/**
	 * Initializes inventory for a product.
	 */
	initialize: async (request: InitializeInventoryRequest) =>
		HttpService.post<InventoryResult>('/inventory/initialize', request),

	/**
	 * Receives stock (from purchase, return, etc.).
	 */
	receiveStock: async (productId: string, request: ReceiveStockRequest) =>
		HttpService.post<InventoryResult>(`/inventory/${productId}/receive`, request),

	/**
	 * Adjusts stock (stocktake, damage, etc.).
	 */
	adjustStock: async (productId: string, request: AdjustStockRequest) =>
		HttpService.post<InventoryResult>(`/inventory/${productId}/adjust`, request),

	/**
	 * Updates inventory settings (reorder point, etc.).
	 */
	updateSettings: async (productId: string, settings: InventorySettingsRequest) =>
		HttpService.put<ProductInventory>(`/inventory/${productId}/settings`, settings),

	/**
	 * Checks availability for a single product.
	 */
	checkAvailability: async (productId: string, quantity = 1) =>
		HttpService.get<AvailabilityResult>(`/inventory/${productId}/availability?quantity=${quantity}`),

	/**
	 * Checks availability for multiple products.
	 */
	checkBulkAvailability: async (items: AvailabilityCheckItem[]) =>
		HttpService.post<AvailabilityResult[]>('/inventory/check-availability', items),

	/**
	 * Receives stock for multiple products (purchase order).
	 */
	bulkReceive: async (request: BulkReceiveRequest) =>
		HttpService.post<InventoryResult[]>('/inventory/bulk-receive', request),
}
