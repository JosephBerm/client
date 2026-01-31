/**
 * Orders API Module
 *
 * Order processing, approval, fulfillment, and full order lifecycle.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/orders
 */

import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type Order from '@_classes/Order'
import type { SubmitOrderRequest } from '@_classes/RequestClasses'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

import { HttpService } from '../httpService'

// =========================================================================
// ORDERS API
// =========================================================================

/**
 * Order Management API
 * Handles order processing, approval, fulfillment, and full order lifecycle.
 *
 * **Note on Order IDs:**
 * Order IDs are UUIDs (GUIDs) from the backend, represented as strings.
 * Example: '40000000-0000-0000-0000-000000000005'
 *
 * @see prd_orders.md - Order Management PRD
 */
export const OrdersApi = {
	/**
	 * Gets a single order by ID or current user's orders.
	 * @param orderId - UUID string of the order (e.g., '40000000-0000-0000-0000-000000000005')
	 */
	get: async <Order>(orderId?: string | null) => {
		return HttpService.get<Order>(`/orders${orderId ? `/${orderId}` : ''}`)
	},

	/**
	 * Gets all orders for a specific customer.
	 */
	getFromCustomer: async (customerId: string) => {
		return HttpService.get<Order[]>(`/orders/fromcustomer/${customerId}`)
	},

	/**
	 * Searches orders with pagination and filtering.
	 */
	search: async (search: GenericSearchFilter) => {
		return HttpService.post<PagedResult<Order>>('/orders/search', search)
	},

	/**
	 * Rich search for orders with advanced filtering, sorting, and facets.
	 */
	richSearch: async (filter: RichSearchFilter) => {
		return HttpService.post<RichPagedResult<Order>>('/orders/search/rich', filter)
	},

	/**
	 * Creates a new order.
	 */
	create: async <Order>(quote: Order) => HttpService.post<Order>('/orders', quote),

	/**
	 * Creates an order from an existing quote.
	 */
	createFromQuote: async <Order>(quoteId: string) => HttpService.post<Order>(`/orders/fromquote/${quoteId}`, null),

	/**
	 * Updates an existing order.
	 */
	update: async <Order>(quote: Order) => HttpService.put<Order>('/orders', quote),

	/**
	 * Deletes an order.
	 * @param orderId - UUID string of the order to delete
	 */
	delete: async <Boolean>(orderId: string) => HttpService.delete<Boolean>(`/orders/${orderId}`),

	/**
	 * Submits a quote to customer.
	 */
	submitQuote: async <Boolean>(req: SubmitOrderRequest) => HttpService.post<Boolean>(`/orders/submit/quote`, req),

	/**
	 * Submits an invoice to customer.
	 */
	submitInvoice: async <Boolean>(req: SubmitOrderRequest) => HttpService.post<Boolean>(`/orders/submit/invoice`, req),

	/**
	 * Approves an order (moves to processing).
	 */
	approveOrder: async (orderId: string) => HttpService.post<boolean>(`/orders/approve/${orderId}`, null),

	/**
	 * Removes a product from an order.
	 */
	deleteProduct: async (orderId: string, productId: number) =>
		HttpService.delete<boolean>(`/orders/${orderId}/product/${productId}`),

	// =========================================================================
	// ORDER WORKFLOW METHODS
	// =========================================================================

	/**
	 * Confirms payment for an order (Placed → Paid).
	 * @param orderId - UUID string of the order
	 */
	confirmPayment: async (orderId: string, paymentReference?: string, notes?: string) =>
		HttpService.post<Order>(`/orders/${orderId}/confirm-payment`, {
			paymentReference,
			notes,
		}),

	/**
	 * Updates order status.
	 * Used by fulfillment to progress orders through workflow.
	 * @param orderId - UUID string of the order
	 */
	updateStatus: async (
		orderId: string,
		newStatus: number,
		trackingNumber?: string,
		carrier?: string,
		cancellationReason?: string,
		internalNotes?: string
	) =>
		HttpService.post<Order>(`/orders/${orderId}/status`, {
			newStatus,
			trackingNumber,
			carrier,
			cancellationReason,
			internalNotes,
		}),

	/**
	 * Adds tracking number to a specific order item.
	 * @param orderId - UUID string of the order
	 * @param orderItemId - UUID string of the order item
	 */
	addTracking: async (orderId: string, orderItemId: string, trackingNumber: string, carrier?: string) =>
		HttpService.post<Order>(`/orders/${orderId}/tracking`, {
			orderItemId,
			trackingNumber,
			carrier,
		}),

	/**
	 * Requests order cancellation (customer-facing).
	 * @param orderId - UUID string of the order
	 */
	requestCancellation: async (orderId: string, reason: string) =>
		HttpService.post<boolean>(`/orders/${orderId}/request-cancellation`, {
			reason,
		}),

	/**
	 * Gets order summary statistics for dashboard.
	 */
	getSummary: async () =>
		HttpService.get<{
			totalOrders: number
			placedCount: number
			paidCount: number
			processingCount: number
			shippedCount: number
			deliveredCount: number
			cancelledCount: number
			totalRevenue: number
			requiresActionCount: number
		}>('/orders/summary'),

	/**
	 * Gets orders assigned to current sales rep.
	 */
	getAssigned: async () => HttpService.get<Order[]>('/orders/assigned'),
}
