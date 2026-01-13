'use client'

/**
 * Pricing TanStack Query Hooks
 *
 * MAANG-Level data fetching with React Query for the Advanced Pricing Engine:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Query key factories for consistent cache invalidation
 * - Type-safe with full TypeScript support
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 5.2 Frontend
 *
 * @module pricing/hooks
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import API from '@_shared/services/api'
import type { PagedResult } from '@_classes/Base/PagedResult'
import {
	PriceOverrideHistory,
	PricingAuditLogResponse,
	PricingAnalyticsResponse,
	type PriceList,
	type PriceListItem,
	type PricingResult,
	type ProductVolumeTiers,
	type PricingRequest,
	type CreatePriceListRequest,
	type UpdatePriceListRequest,
	type AddPriceListItemRequest,
	type SetVolumeTiersRequest,
	type PricingAuditLogFilter,
	type PricingAnalyticsRequest,
} from '@_classes/Pricing'

// =========================================================================
// CONSTANTS
// =========================================================================

/** Stale time for price calculations (5 minutes - prices change infrequently) */
const PRICE_STALE_TIME = 5 * 60 * 1000

/** Stale time for price list data (2 minutes) */
const PRICE_LIST_STALE_TIME = 2 * 60 * 1000

/** Stale time for volume tiers (5 minutes) */
const VOLUME_TIER_STALE_TIME = 5 * 60 * 1000

// =========================================================================
// QUERY KEY FACTORY
// =========================================================================

/**
 * Query key factory for pricing-related queries.
 * Ensures consistent cache key structure across the application.
 *
 * **MAANG Pattern:** Query key factories prevent typos and enable
 * precise cache invalidation.
 */
export const pricingKeys = {
	/** Base key for all pricing queries */
	all: ['pricing'] as const,

	// Price calculation keys
	calculations: () => [...pricingKeys.all, 'calculations'] as const,
	calculation: (productId: string, customerId?: number | null, quantity?: number) =>
		[...pricingKeys.calculations(), { productId, customerId, quantity }] as const,
	bulkCalculation: (items: PricingRequest[]) => [...pricingKeys.calculations(), 'bulk', items] as const,

	// Price list keys
	priceLists: () => [...pricingKeys.all, 'price-lists'] as const,
	priceListsPaged: (page: number, pageSize: number) => [...pricingKeys.priceLists(), { page, pageSize }] as const,
	priceList: (id: string) => [...pricingKeys.priceLists(), id] as const,

	// Customer price list keys
	customerPriceLists: (customerId: number) => [...pricingKeys.all, 'customers', customerId, 'price-lists'] as const,

	// Volume tier keys
	volumeTiers: () => [...pricingKeys.all, 'volume-tiers'] as const,
	productVolumeTiers: (productId: string) => [...pricingKeys.volumeTiers(), productId] as const,

	// Price override keys
	priceOverrides: () => [...pricingKeys.all, 'price-overrides'] as const,
	priceOverrideHistory: (cartProductId: string) =>
		[...pricingKeys.priceOverrides(), 'history', cartProductId] as const,

	// Audit log keys
	auditLogs: () => [...pricingKeys.all, 'audit-logs'] as const,
	auditLogsPaged: (filter: PricingAuditLogFilter) => [...pricingKeys.auditLogs(), filter] as const,

	// Analytics keys
	analytics: () => [...pricingKeys.all, 'analytics'] as const,
	analyticsRequest: (request: PricingAnalyticsRequest) => [...pricingKeys.analytics(), request] as const,
}

// =========================================================================
// PRICE CALCULATION HOOKS
// =========================================================================

/**
 * Hook to calculate price for a single product.
 *
 * **Use Cases:**
 * - Product detail page showing customer's price
 * - Cart item price display
 * - Quote line item pricing
 *
 * **Caching:** Results cached for 5 minutes with automatic background refresh.
 *
 * @param productId - Product GUID
 * @param customerId - Customer ID (optional, resolved from auth for customers)
 * @param quantity - Quantity for volume pricing (default: 1)
 * @param includeBreakdown - Include applied rules breakdown (default: false)
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * // Basic price calculation
 * const { data: pricing } = useCalculatePrice('prod-123')
 *
 * // With quantity for volume pricing
 * const { data: pricing } = useCalculatePrice('prod-123', customerId, 25)
 *
 * // With full breakdown for quote editor
 * const { data: pricing } = useCalculatePrice('prod-123', customerId, 25, true)
 * ```
 */
export function useCalculatePrice(
	productId: string,
	customerId?: number | null,
	quantity: number = 1,
	includeBreakdown: boolean = false,
	options?: Omit<UseQueryOptions<PricingResult, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: pricingKeys.calculation(productId, customerId, quantity),
		queryFn: async () => {
			const response = await API.Pricing.calculate({
				productId,
				customerId,
				quantity,
				includeBreakdown,
			})
			return response.data.payload!
		},
		enabled: !!productId,
		staleTime: PRICE_STALE_TIME,
		...options,
	})
}

/**
 * Mutation hook for bulk price calculations.
 *
 * **Use Cases:**
 * - Cart pricing (multiple products at once)
 * - Product list pages (avoid N+1 requests)
 * - Quote bulk pricing
 *
 * **Performance:** Batch API call - single request for all products.
 *
 * @example
 * ```typescript
 * const bulkCalculate = useCalculatePricesMutation()
 *
 * // Calculate prices for cart items
 * bulkCalculate.mutate([
 *   { productId: 'prod-1', quantity: 10 },
 *   { productId: 'prod-2', quantity: 5 },
 * ])
 * ```
 */
export function useCalculatePricesMutation() {
	return useMutation({
		mutationFn: async (items: PricingRequest[]) => {
			const response = await API.Pricing.calculateBulk(items)
			return response.data.payload!
		},
	})
}

// =========================================================================
// PRICE LIST HOOKS
// =========================================================================

/**
 * Hook to fetch paginated price lists.
 *
 * **Authorization:** PricingView policy (Admin, SalesManager, SalesRep)
 *
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * const { data, isLoading } = usePriceLists(1, 20)
 * const priceLists = data?.data ?? []
 * const totalCount = data?.totalCount ?? 0
 * ```
 */
export function usePriceLists(
	page: number = 1,
	pageSize: number = 20,
	options?: Omit<UseQueryOptions<PagedResult<PriceList>, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: pricingKeys.priceListsPaged(page, pageSize),
		queryFn: async () => {
			const response = await API.Pricing.getPriceLists(page, pageSize)
			return response.data.payload!
		},
		staleTime: PRICE_LIST_STALE_TIME,
		...options,
	})
}

/**
 * Hook to fetch a single price list with full details.
 * Includes items and customer assignments.
 *
 * **Authorization:** PricingView policy
 *
 * @param id - Price list GUID
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * const { data: priceList, isLoading } = usePriceList('abc-123')
 * const items = priceList?.items ?? []
 * const customers = priceList?.customers ?? []
 * ```
 */
export function usePriceList(id: string, options?: Omit<UseQueryOptions<PriceList, Error>, 'queryKey' | 'queryFn'>) {
	return useQuery({
		queryKey: pricingKeys.priceList(id),
		queryFn: async () => {
			const response = await API.Pricing.getPriceList(id)
			return response.data.payload!
		},
		enabled: !!id,
		staleTime: PRICE_LIST_STALE_TIME,
		...options,
	})
}

/**
 * Mutation hook for creating a price list.
 * Invalidates price list queries on success.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const createPriceList = useCreatePriceList()
 *
 * createPriceList.mutate({
 *   name: 'Hospital Contract 2026',
 *   priority: 10,
 *   isActive: true,
 * })
 * ```
 */
export function useCreatePriceList() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: CreatePriceListRequest) => {
			const response = await API.Pricing.createPriceList(data)
			return response.data.payload!
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
		},
	})
}

/**
 * Mutation hook for updating a price list.
 * Invalidates both list and detail queries on success.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const updatePriceList = useUpdatePriceList()
 *
 * updatePriceList.mutate({
 *   id: 'abc-123',
 *   data: { name: 'Updated Contract Name' },
 * })
 * ```
 */
export function useUpdatePriceList() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: UpdatePriceListRequest }) => {
			const response = await API.Pricing.updatePriceList(id, data)
			return response.data.payload!
		},
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceList(id) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
		},
	})
}

/**
 * Mutation hook for deleting a price list.
 * Invalidates price list queries on success.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const deletePriceList = useDeletePriceList()
 *
 * deletePriceList.mutate('abc-123')
 * ```
 */
export function useDeletePriceList() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await API.Pricing.deletePriceList(id)
			return response.data.payload!
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
		},
	})
}

// =========================================================================
// PRICE LIST ITEM HOOKS
// =========================================================================

/**
 * Mutation hook for adding a product to a price list.
 * Invalidates the price list detail query on success.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const addItem = useAddPriceListItem()
 *
 * addItem.mutate({
 *   priceListId: 'pl-123',
 *   data: {
 *     productId: 'prod-456',
 *     percentDiscount: 15, // 15% off
 *   },
 * })
 * ```
 */
export function useAddPriceListItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ priceListId, data }: { priceListId: string; data: AddPriceListItemRequest }) => {
			const response = await API.Pricing.addPriceListItem(priceListId, data)
			return response.data.payload!
		},
		onSuccess: (_, { priceListId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceList(priceListId) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
			// Invalidate price calculations since prices may have changed
			queryClient.invalidateQueries({ queryKey: pricingKeys.calculations() })
		},
	})
}

/**
 * Mutation hook for updating a price list item.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const updateItem = useUpdatePriceListItem()
 *
 * updateItem.mutate({
 *   itemId: 'item-123',
 *   priceListId: 'pl-456', // For cache invalidation
 *   data: { fixedPrice: 85.00 },
 * })
 * ```
 */
export function useUpdatePriceListItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			itemId,
			data,
		}: {
			itemId: string
			priceListId: string
			data: AddPriceListItemRequest
		}) => {
			const response = await API.Pricing.updatePriceListItem(itemId, data)
			return response.data.payload!
		},
		onSuccess: (_, { priceListId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceList(priceListId) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.calculations() })
		},
	})
}

/**
 * Mutation hook for removing a product from a price list.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const removeItem = useRemovePriceListItem()
 *
 * removeItem.mutate({
 *   itemId: 'item-123',
 *   priceListId: 'pl-456',
 * })
 * ```
 */
export function useRemovePriceListItem() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ itemId }: { itemId: string; priceListId: string }) => {
			const response = await API.Pricing.removePriceListItem(itemId)
			return response.data.payload!
		},
		onSuccess: (_, { priceListId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceList(priceListId) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
			queryClient.invalidateQueries({ queryKey: pricingKeys.calculations() })
		},
	})
}

// =========================================================================
// CUSTOMER ASSIGNMENT HOOKS
// =========================================================================

/**
 * Hook to fetch price lists assigned to a customer.
 *
 * **Authorization:** CustomersRead policy
 *
 * @param customerId - Customer ID
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * const { data: priceLists } = useCustomerPriceLists(123)
 * ```
 */
export function useCustomerPriceLists(
	customerId: number,
	options?: Omit<UseQueryOptions<PriceList[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: pricingKeys.customerPriceLists(customerId),
		queryFn: async () => {
			const response = await API.Pricing.getCustomerPriceLists(customerId)
			return response.data.payload!
		},
		enabled: !!customerId && customerId > 0,
		staleTime: PRICE_LIST_STALE_TIME,
		...options,
	})
}

/**
 * Mutation hook for assigning a price list to a customer.
 * Invalidates customer price list query on success.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const assignPriceList = useAssignCustomerPriceList()
 *
 * assignPriceList.mutate({
 *   customerId: 123,
 *   priceListId: 'pl-456',
 * })
 * ```
 */
export function useAssignCustomerPriceList() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ customerId, priceListId }: { customerId: number; priceListId: string }) => {
			const response = await API.Pricing.assignCustomerToPriceList(customerId, priceListId)
			return response.data.payload!
		},
		onSuccess: (_, { customerId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.customerPriceLists(customerId) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
			// Customer's prices may have changed
			queryClient.invalidateQueries({ queryKey: pricingKeys.calculations() })
		},
	})
}

/**
 * Mutation hook for removing a price list assignment from a customer.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const unassignPriceList = useRemoveCustomerPriceList()
 *
 * unassignPriceList.mutate({
 *   customerId: 123,
 *   priceListId: 'pl-456',
 * })
 * ```
 */
export function useRemoveCustomerPriceList() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ customerId, priceListId }: { customerId: number; priceListId: string }) => {
			const response = await API.Pricing.removeCustomerFromPriceList(customerId, priceListId)
			return response.data.payload!
		},
		onSuccess: (_, { customerId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.customerPriceLists(customerId) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceLists() })
			queryClient.invalidateQueries({ queryKey: pricingKeys.calculations() })
		},
	})
}

// =========================================================================
// VOLUME TIER HOOKS
// =========================================================================

/**
 * Hook to fetch volume pricing tiers for a product.
 *
 * **Use Cases:**
 * - Product detail page showing volume discounts
 * - Quote editor showing available quantity breaks
 * - Volume tier management UI
 *
 * @param productId - Product GUID
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * const { data: volumeData } = useVolumeTiers('prod-123')
 * const tiers = volumeData?.tiers ?? []
 * ```
 */
export function useVolumeTiers(
	productId: string,
	options?: Omit<UseQueryOptions<ProductVolumeTiers, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: pricingKeys.productVolumeTiers(productId),
		queryFn: async () => {
			const response = await API.Pricing.getVolumeTiers(productId)
			return response.data.payload!
		},
		enabled: !!productId,
		staleTime: VOLUME_TIER_STALE_TIME,
		...options,
	})
}

/**
 * Mutation hook for setting volume tiers for a product.
 * Replaces all existing tiers.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const setTiers = useSetVolumeTiers()
 *
 * setTiers.mutate({
 *   productId: 'prod-123',
 *   request: {
 *     tiers: [
 *       { minQuantity: 1, maxQuantity: 9, unitPrice: 100 },
 *       { minQuantity: 10, maxQuantity: 49, unitPrice: 90 },
 *       { minQuantity: 50, maxQuantity: null, unitPrice: 80 },
 *     ],
 *   },
 * })
 * ```
 */
export function useSetVolumeTiers() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ productId, request }: { productId: string; request: SetVolumeTiersRequest }) => {
			const response = await API.Pricing.setVolumeTiers(productId, request)
			return response.data.payload!
		},
		onSuccess: (_, { productId }) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.productVolumeTiers(productId) })
			// Volume tier changes affect price calculations
			queryClient.invalidateQueries({ queryKey: pricingKeys.calculations() })
		},
	})
}

/**
 * Mutation hook for clearing all volume tiers for a product.
 *
 * **Authorization:** PricingManage policy (Admin only)
 *
 * @example
 * ```typescript
 * const clearTiers = useClearVolumeTiers()
 *
 * clearTiers.mutate('prod-123')
 * ```
 */
export function useClearVolumeTiers() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (productId: string) => {
			const response = await API.Pricing.clearVolumeTiers(productId)
			return response.data.payload!
		},
		onSuccess: (_, productId) => {
			queryClient.invalidateQueries({ queryKey: pricingKeys.productVolumeTiers(productId) })
			queryClient.invalidateQueries({ queryKey: pricingKeys.calculations() })
		},
	})
}

// =========================================================================
// PRICE OVERRIDE HOOKS (Sales Manager)
// =========================================================================

/**
 * Mutation hook for overriding a quote item's price.
 * Sales Managers can manually override calculated prices with business justification.
 *
 * **Audit Trail:** Creates a PriceOverrideHistory entry for compliance.
 *
 * **Authorization:** PricingManage policy (Admin, SalesManager)
 *
 * @example
 * ```typescript
 * const override = useOverrideQuoteItemPrice()
 *
 * override.mutate({
 *   quoteId: 'quote-123',
 *   cartProductId: 'cp-456',
 *   overridePrice: 85.00,
 *   overrideReason: 'Competitor match for long-term customer',
 * })
 * ```
 *
 * @see prd_pricing_engine.md - US-PRICE-012
 */
export function useOverrideQuoteItemPrice() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			quoteId,
			cartProductId,
			overridePrice,
			overrideReason,
		}: {
			quoteId: string
			cartProductId: string
			overridePrice: number
			overrideReason: string
		}) => {
			const response = await API.Pricing.overrideQuoteItemPrice(quoteId, cartProductId, {
				overridePrice,
				overrideReason,
			})
			return response.data.payload!
		},
		onSuccess: (_, { quoteId, cartProductId }) => {
			// Invalidate quote queries to refresh pricing
			queryClient.invalidateQueries({ queryKey: ['quotes', quoteId] })
			// Invalidate override history
			queryClient.invalidateQueries({ queryKey: pricingKeys.priceOverrideHistory(cartProductId) })
		},
	})
}

/**
 * Query hook for fetching price override history for a cart product.
 *
 * **Use Cases:**
 * - Audit trail display on quote detail
 * - Compliance reporting
 * - Override review by managers
 *
 * @param cartProductId - Cart product GUID
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * const { data: history, isLoading } = usePriceOverrideHistory('cp-123')
 * ```
 */
export function usePriceOverrideHistory(
	cartProductId: string,
	options?: Partial<UseQueryOptions<PriceOverrideHistory[], Error>>
) {
	return useQuery({
		queryKey: pricingKeys.priceOverrideHistory(cartProductId),
		queryFn: async () => {
			const response = await API.Pricing.getPriceOverrideHistory(cartProductId)
			// Map to class instances for method access
			return (response.data.payload ?? []).map((h) => new PriceOverrideHistory(h))
		},
		enabled: !!cartProductId,
		staleTime: PRICE_LIST_STALE_TIME,
		...options,
	})
}

// =========================================================================
// AUDIT LOG HOOKS
// =========================================================================

/** Stale time for audit logs (1 minute - refreshes frequently) */
const AUDIT_LOG_STALE_TIME = 60 * 1000

/**
 * Query hook for fetching paginated pricing audit logs.
 *
 * **Use Cases:**
 * - Compliance dashboard
 * - Pricing analytics deep-dive
 * - Debugging pricing issues
 *
 * **Authorization:** PricingView policy (Admin, SalesManager, SalesRep)
 *
 * @param filter - Filter parameters
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * const { data, isLoading } = usePricingAuditLogs({
 *   eventType: 'QuotePrice',
 *   page: 1,
 *   pageSize: 20,
 * })
 * ```
 *
 * @see prd_pricing_engine.md - Section 6.3 Audit & Compliance
 */
export function usePricingAuditLogs(
	filter: PricingAuditLogFilter,
	options?: Partial<UseQueryOptions<PagedResult<PricingAuditLogResponse>, Error>>
) {
	return useQuery({
		queryKey: pricingKeys.auditLogsPaged(filter),
		queryFn: async () => {
			const response = await API.Pricing.getAuditLogs(filter)
			return {
				...response.data.payload!,
				// Map to class instances for helper methods
				data: (response.data.payload?.data ?? []).map((log) => new PricingAuditLogResponse(log)),
			}
		},
		staleTime: AUDIT_LOG_STALE_TIME,
		...options,
	})
}

// =========================================================================
// ANALYTICS HOOKS
// =========================================================================

/** Stale time for analytics (5 minutes) */
const ANALYTICS_STALE_TIME = 5 * 60 * 1000

/**
 * Query hook for fetching pricing analytics.
 *
 * **Use Cases:**
 * - Pricing analytics dashboard
 * - Margin health monitoring
 * - Price list performance review
 *
 * **Authorization:** SalesManagerOrAbove policy (SalesManager, Admin)
 * Contains sensitive margin data.
 *
 * @param request - Analytics parameters (period, dates)
 * @param options - Additional query options
 *
 * @example
 * ```typescript
 * // Monthly analytics
 * const { data } = usePricingAnalytics({ period: 'month' })
 *
 * // Custom date range
 * const { data } = usePricingAnalytics({
 *   startDate: new Date('2026-01-01'),
 *   endDate: new Date('2026-01-31'),
 * })
 * ```
 *
 * @see prd_pricing_engine.md - Section 4.2 Sales Manager View
 */
export function usePricingAnalytics(
	request: PricingAnalyticsRequest = {},
	options?: Partial<UseQueryOptions<PricingAnalyticsResponse, Error>>
) {
	return useQuery({
		queryKey: pricingKeys.analyticsRequest(request),
		queryFn: async () => {
			const response = await API.Pricing.getAnalytics(request)
			return new PricingAnalyticsResponse(response.data.payload ?? undefined)
		},
		staleTime: ANALYTICS_STALE_TIME,
		...options,
	})
}
