/**
 * Pricing API Module
 *
 * Advanced pricing engine - price calculation, price lists, volume tiers.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/pricing
 */

import type { PagedResult } from '@_classes/Base/PagedResult'
import type {
	PriceList,
	PriceListItem,
	PricingResult,
	ProductVolumeTiers,
	PricingRequest,
	CreatePriceListRequest,
	UpdatePriceListRequest,
	AddPriceListItemRequest,
	SetVolumeTiersRequest,
	PriceOverrideHistory,
	PricingAuditLogResponse,
	PricingAuditLogFilter,
	PricingAnalyticsResponse,
	PricingAnalyticsRequest,
} from '@_classes/Pricing'

import { HttpService } from '../httpService'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Response type for cart product operations.
 */
export interface CartProductResponse {
	id: string
	productId: string
	quantity: number
	customerPrice: number | null
	vendorCost: number | null
	lockedFinalPrice: number | null
	lockedBasePrice: number | null
	pricingLockedAt: string | null
	marginProtected: boolean
}

/** Alias for API backward compatibility */
export type PriceOverrideHistoryEntry = PriceOverrideHistory

// =========================================================================
// PRICING API
// =========================================================================

/**
 * Advanced Pricing Engine API
 * Handles price calculation, price list management, volume tiers, and customer assignments.
 *
 * @see prd_pricing_engine.md
 */
export const PricingApi = {
	// =====================================================================
	// PRICE CALCULATION
	// =====================================================================

	/**
	 * Calculates price for a single product.
	 */
	calculate: async (request: PricingRequest) => HttpService.post<PricingResult>('/pricing/calculate', request),

	/**
	 * Calculates prices for multiple products (cart/product list).
	 */
	calculateBulk: async (items: PricingRequest[]) =>
		HttpService.post<PricingResult[]>('/pricing/calculate/bulk', { items }),

	// =====================================================================
	// PRICE LIST MANAGEMENT
	// =====================================================================

	/**
	 * Gets all price lists with pagination.
	 */
	getPriceLists: async (page = 1, pageSize = 20) =>
		HttpService.get<PagedResult<PriceList>>(`/pricing/price-lists?page=${page}&pageSize=${pageSize}`),

	/**
	 * Gets a price list by ID with full details.
	 */
	getPriceList: async (id: string) => HttpService.get<PriceList>(`/pricing/price-lists/${id}`),

	/**
	 * Creates a new price list.
	 */
	createPriceList: async (data: CreatePriceListRequest) =>
		HttpService.post<PriceList>('/pricing/price-lists', data),

	/**
	 * Updates an existing price list.
	 */
	updatePriceList: async (id: string, data: UpdatePriceListRequest) =>
		HttpService.put<PriceList>(`/pricing/price-lists/${id}`, data),

	/**
	 * Deletes a price list.
	 */
	deletePriceList: async (id: string) => HttpService.delete<boolean>(`/pricing/price-lists/${id}`),

	// =====================================================================
	// PRICE LIST ITEMS
	// =====================================================================

	/**
	 * Adds a product to a price list with pricing configuration.
	 */
	addPriceListItem: async (priceListId: string, data: AddPriceListItemRequest) =>
		HttpService.post<PriceListItem>(`/pricing/price-lists/${priceListId}/items`, data),

	/**
	 * Updates a price list item's pricing configuration.
	 */
	updatePriceListItem: async (itemId: string, data: AddPriceListItemRequest) =>
		HttpService.put<PriceListItem>(`/pricing/price-lists/items/${itemId}`, data),

	/**
	 * Removes a product from a price list.
	 */
	removePriceListItem: async (itemId: string) =>
		HttpService.delete<boolean>(`/pricing/price-lists/items/${itemId}`),

	// =====================================================================
	// CUSTOMER ASSIGNMENTS
	// =====================================================================

	/**
	 * Gets all price lists assigned to a customer.
	 */
	getCustomerPriceLists: async (customerId: string) =>
		HttpService.get<PriceList[]>(`/pricing/customers/${customerId}/price-lists`),

	/**
	 * Assigns a price list to a customer.
	 */
	assignCustomerToPriceList: async (customerId: string, priceListId: string) =>
		HttpService.post<boolean>(`/pricing/customers/${customerId}/price-lists`, { priceListId }),

	/**
	 * Removes a price list assignment from a customer.
	 */
	removeCustomerFromPriceList: async (customerId: string, priceListId: string) =>
		HttpService.delete<boolean>(`/pricing/customers/${customerId}/price-lists/${priceListId}`),

	// =====================================================================
	// VOLUME PRICING
	// =====================================================================

	/**
	 * Gets all volume pricing tiers for a product.
	 */
	getVolumeTiers: async (productId: string) =>
		HttpService.get<ProductVolumeTiers>(`/pricing/products/${productId}/volume-tiers`),

	/**
	 * Sets volume pricing tiers for a product.
	 */
	setVolumeTiers: async (productId: string, request: SetVolumeTiersRequest) =>
		HttpService.post<ProductVolumeTiers>(`/pricing/products/${productId}/volume-tiers`, request),

	/**
	 * Clears all volume tiers for a product.
	 */
	clearVolumeTiers: async (productId: string) =>
		HttpService.delete<boolean>(`/pricing/products/${productId}/volume-tiers`),

	// =====================================================================
	// PRICE OVERRIDE (Sales Manager)
	// =====================================================================

	/**
	 * Overrides the price for a quote item.
	 */
	overrideQuoteItemPrice: async (
		quoteId: string,
		cartProductId: string,
		data: { overridePrice: number; overrideReason: string }
	) => HttpService.post<CartProductResponse>(`/pricing/quotes/${quoteId}/items/${cartProductId}/override`, data),

	/**
	 * Gets the price override history for a cart product.
	 */
	getPriceOverrideHistory: async (cartProductId: string) =>
		HttpService.get<PriceOverrideHistoryEntry[]>(`/pricing/items/${cartProductId}/override-history`),

	// =====================================================================
	// AUDIT LOGS
	// =====================================================================

	/**
	 * Gets paginated pricing audit logs with filtering.
	 */
	getAuditLogs: async (filter: PricingAuditLogFilter) => {
		const params = new URLSearchParams()
		if (filter.productId) params.set('productId', filter.productId)
		if (filter.customerId) params.set('customerId', filter.customerId.toString())
		if (filter.eventType) params.set('eventType', filter.eventType)
		if (filter.dateFrom)
			params.set('dateFrom', filter.dateFrom instanceof Date ? filter.dateFrom.toISOString() : filter.dateFrom)
		if (filter.dateTo)
			params.set('dateTo', filter.dateTo instanceof Date ? filter.dateTo.toISOString() : filter.dateTo)
		if (filter.quoteId) params.set('quoteId', filter.quoteId)
		if (filter.orderId) params.set('orderId', filter.orderId.toString())
		if (filter.marginProtectedOnly) params.set('marginProtectedOnly', 'true')
		if (filter.page) params.set('page', filter.page.toString())
		if (filter.pageSize) params.set('pageSize', filter.pageSize.toString())
		const queryString = params.toString()
		if (!queryString) {
			return HttpService.get<PagedResult<PricingAuditLogResponse>>('/pricing/audit-logs')
		}
		return HttpService.get<PagedResult<PricingAuditLogResponse>>(`/pricing/audit-logs?${queryString}`)
	},

	// =====================================================================
	// ANALYTICS
	// =====================================================================

	/**
	 * Gets pricing analytics for a specified period.
	 */
	getAnalytics: async (request: PricingAnalyticsRequest) => {
		const params = new URLSearchParams()
		if (request.period) params.set('period', request.period)
		if (request.startDate)
			params.set('startDate', request.startDate instanceof Date ? request.startDate.toISOString() : request.startDate)
		if (request.endDate)
			params.set('endDate', request.endDate instanceof Date ? request.endDate.toISOString() : request.endDate)
		const queryString = params.toString()
		if (!queryString) {
			return HttpService.get<PricingAnalyticsResponse>('/pricing/analytics')
		}
		return HttpService.get<PricingAnalyticsResponse>(`/pricing/analytics?${queryString}`)
	},
}
