/**
 * Quotes API Module
 *
 * Quote/RFQ management, pricing updates, and quote lifecycle operations.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/quotes
 */

import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type Quote from '@_classes/Quote'
import type { QuotePricingSummary } from '@_core/validation'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

import { HttpService } from '../httpService'

// =========================================================================
// QUOTES API
// =========================================================================

/**
 * Quote Management API
 * Handles quote requests (RFQs) from customers.
 */
export const QuotesApi = {
	/**
	 * Gets a single quote by ID.
	 */
	get: async <T>(id: string) => {
		return HttpService.get<T>(`/quotes/${id}`)
	},

	/**
	 * Gets all quotes.
	 */
	getAll: async <T>() => {
		return HttpService.get<T>('/quotes')
	},

	/**
	 * Gets latest quotes for dashboard display.
	 */
	getLatest: async (quantity: number = 6) => {
		return HttpService.get<Quote[]>(`/quotes/latest?quantity=${quantity}`)
	},

	/**
	 * Searches quotes with pagination and filtering.
	 */
	search: async (search: GenericSearchFilter) => {
		return HttpService.post<PagedResult<Quote>>('/quotes/search', search)
	},

	/**
	 * Rich search for quotes with advanced filtering, sorting, and facets.
	 */
	richSearch: async (filter: RichSearchFilter) => {
		return HttpService.post<RichPagedResult<Quote>>('/quotes/search/rich', filter)
	},

	/**
	 * Creates a new quote request.
	 */
	create: async <T>(quote: T) => HttpService.post<T>('/quotes', quote),

	/**
	 * Updates an existing quote.
	 */
	update: async <T>(quote: T) => HttpService.put<T>('/quotes', quote),

	/**
	 * Permanently deletes a quote and its cart products.
	 */
	delete: async <T>(quoteId: string) => HttpService.delete<T>(`/quotes/${quoteId}`),

	/**
	 * Soft deletes (archives) a quote.
	 */
	archive: async (quoteId: string) => HttpService.post<boolean>(`/quotes/${quoteId}/archive`, null),

	// =========================================================================
	// PRICING METHODS - Quote Pricing Workflow
	// =========================================================================

	/**
	 * Updates pricing for a single product in a quote.
	 * Sets vendor cost and/or customer price.
	 *
	 * **Authorization:**
	 * - SalesRep: Can only update pricing for assigned quotes
	 * - SalesManager+: Can update pricing for any quote
	 * - Customer: CANNOT update pricing
	 */
	updateProductPricing: async (
		quoteId: string,
		productId: string,
		vendorCost: number | null,
		customerPrice: number | null,
	) =>
		HttpService.put<Quote>(`/quotes/${quoteId}/pricing`, {
			productId,
			vendorCost,
			customerPrice,
		}),

	/**
	 * Gets pricing summary for a quote.
	 * Contains totals, margins, and can-send status.
	 *
	 * **Authorization:**
	 * - SalesRep: Can only view pricing for assigned quotes
	 * - SalesManager+: Can view pricing for any quote
	 * - Customer: CANNOT view pricing summary (contains margin data)
	 */
	getPricingSummary: async (quoteId: string) =>
		HttpService.get<QuotePricingSummary>(`/quotes/${quoteId}/pricing/summary`),
}
