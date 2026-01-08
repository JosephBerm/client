'use client'

/**
 * Inventory TanStack Query Hooks
 *
 * MAANG-Level data fetching with React Query:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Query key factories for consistent cache invalidation
 *
 * **Architecture Pattern:**
 * - Uses centralized API.Inventory for all API calls
 * - Follows project conventions for data fetching
 *
 * @module inventory/hooks
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import API from '@_shared/services/api'
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
} from '../types'

// =========================================================================
// QUERY KEY FACTORY
// =========================================================================

/**
 * Query key factory for inventory-related queries.
 * Ensures consistent cache key structure across the application.
 */
export const inventoryKeys = {
	all: ['inventory'] as const,
	lists: () => [...inventoryKeys.all, 'list'] as const,
	list: (filters: InventorySearchFilter) => [...inventoryKeys.lists(), filters] as const,
	details: () => [...inventoryKeys.all, 'detail'] as const,
	detail: (productId: string) => [...inventoryKeys.details(), productId] as const,
	transactions: (productId: string) => [...inventoryKeys.all, 'transactions', productId] as const,
	stats: () => [...inventoryKeys.all, 'stats'] as const,
	lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
	outOfStock: () => [...inventoryKeys.all, 'out-of-stock'] as const,
	availability: (productId: string, quantity: number) =>
		[...inventoryKeys.all, 'availability', productId, quantity] as const,
}

// =========================================================================
// QUERY HOOKS
// =========================================================================

/**
 * Hook to fetch inventory for a specific product
 */
export function useInventory(
	productId: string,
	options?: Omit<UseQueryOptions<ProductInventory, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: inventoryKeys.detail(productId),
		queryFn: async () => {
			const response = await API.Inventory.getByProductId(productId)
			return response.data.payload!
		},
		enabled: !!productId,
		staleTime: 30_000, // 30 seconds
		...options,
	})
}

/**
 * Hook to fetch all inventory records
 */
export function useAllInventory(
	lowStockOnly = false,
	options?: Omit<UseQueryOptions<ProductInventory[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: [...inventoryKeys.lists(), { lowStockOnly }],
		queryFn: async () => {
			const response = await API.Inventory.getAll(lowStockOnly)
			return response.data.payload || []
		},
		staleTime: 30_000,
		...options,
	})
}

/**
 * Hook to search inventory with filters and pagination
 */
export function useInventorySearch(
	filter: InventorySearchFilter,
	options?: Omit<UseQueryOptions<PagedInventoryResult<ProductInventorySummary>, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: inventoryKeys.list(filter),
		queryFn: async () => {
			const response = await API.Inventory.search(filter)
			return response.data.payload!
		},
		staleTime: 30_000,
		...options,
	})
}

/**
 * Hook to fetch low stock items
 */
export function useLowStockItems(options?: Omit<UseQueryOptions<ProductInventory[], Error>, 'queryKey' | 'queryFn'>) {
	return useQuery({
		queryKey: inventoryKeys.lowStock(),
		queryFn: async () => {
			const response = await API.Inventory.getLowStock()
			return response.data.payload || []
		},
		staleTime: 60_000, // 1 minute
		...options,
	})
}

/**
 * Hook to fetch out of stock items
 */
export function useOutOfStockItems(options?: Omit<UseQueryOptions<ProductInventory[], Error>, 'queryKey' | 'queryFn'>) {
	return useQuery({
		queryKey: inventoryKeys.outOfStock(),
		queryFn: async () => {
			const response = await API.Inventory.getOutOfStock()
			return response.data.payload || []
		},
		staleTime: 60_000,
		...options,
	})
}

/**
 * Hook to fetch inventory statistics for dashboard
 */
export function useInventoryStats(options?: Omit<UseQueryOptions<InventoryStats, Error>, 'queryKey' | 'queryFn'>) {
	return useQuery({
		queryKey: inventoryKeys.stats(),
		queryFn: async () => {
			const response = await API.Inventory.getStats()
			return response.data.payload!
		},
		staleTime: 60_000,
		...options,
	})
}

/**
 * Hook to fetch transaction history for a product
 */
export function useInventoryTransactions(
	productId: string,
	transactionOptions?: {
		fromDate?: Date
		toDate?: Date
		limit?: number
	},
	options?: Omit<UseQueryOptions<InventoryTransaction[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: [...inventoryKeys.transactions(productId), transactionOptions],
		queryFn: async () => {
			const response = await API.Inventory.getTransactions(productId, transactionOptions)
			return response.data.payload || []
		},
		enabled: !!productId,
		staleTime: 30_000,
		...options,
	})
}

/**
 * Hook to check availability for a single product
 */
export function useProductAvailability(
	productId: string,
	quantity = 1,
	options?: Omit<UseQueryOptions<AvailabilityResult, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: inventoryKeys.availability(productId, quantity),
		queryFn: async () => {
			const response = await API.Inventory.checkAvailability(productId, quantity)
			return response.data.payload!
		},
		enabled: !!productId && quantity > 0,
		staleTime: 10_000, // 10 seconds - availability changes frequently
		...options,
	})
}

// =========================================================================
// MUTATION HOOKS
// =========================================================================

/**
 * Hook to initialize inventory for a product
 */
export function useInitializeInventory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (request: InitializeInventoryRequest) => {
			const response = await API.Inventory.initialize(request)
			return response.data.payload!
		},
		onSuccess: (data, variables) => {
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: inventoryKeys.all })

			// Optionally set the data directly
			if (data.inventory) {
				queryClient.setQueryData(inventoryKeys.detail(variables.productId), data.inventory)
			}
		},
	})
}

/**
 * Hook to receive stock
 */
export function useReceiveStock() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ productId, request }: { productId: string; request: ReceiveStockRequest }) => {
			const response = await API.Inventory.receiveStock(productId, request)
			return response.data.payload!
		},
		onSuccess: (data, variables) => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.productId) })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(variables.productId) })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.outOfStock() })
		},
	})
}

/**
 * Hook to adjust stock
 */
export function useAdjustStock() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ productId, request }: { productId: string; request: AdjustStockRequest }) => {
			const response = await API.Inventory.adjustStock(productId, request)
			return response.data.payload!
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.productId) })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(variables.productId) })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
			queryClient.invalidateQueries({ queryKey: inventoryKeys.outOfStock() })
		},
	})
}

/**
 * Hook to update inventory settings
 */
export function useUpdateInventorySettings() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ productId, settings }: { productId: string; settings: InventorySettingsRequest }) => {
			const response = await API.Inventory.updateSettings(productId, settings)
			return response.data.payload!
		},
		onSuccess: (data, variables) => {
			queryClient.setQueryData(inventoryKeys.detail(variables.productId), data)
			queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() })
		},
	})
}

/**
 * Hook to check bulk availability
 */
export function useCheckBulkAvailability() {
	return useMutation({
		mutationFn: async (items: AvailabilityCheckItem[]) => {
			const response = await API.Inventory.checkBulkAvailability(items)
			return response.data.payload || []
		},
	})
}

/**
 * Hook to bulk receive stock
 */
export function useBulkReceiveStock() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (request: BulkReceiveRequest) => {
			const response = await API.Inventory.bulkReceive(request)
			return response.data.payload || []
		},
		onSuccess: () => {
			// Invalidate all inventory queries since multiple products are affected
			queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
		},
	})
}
