/**
 * Payments API Module
 *
 * Payment processing, manual payments, refunds, and saved payment methods.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/payments
 */

import type {
	CreatePaymentIntentResponse,
	CustomerPaymentSettingsDTO,
	PagedPaymentResult,
	PaymentDTO,
	PaymentSearchFilter,
	PaymentSummary,
	RecordManualPaymentRequest,
	RefundRequest,
	SavedPaymentMethodDTO,
	UpdateCustomerPaymentSettingsRequest,
} from '@_features/payments/types'

import { HttpService } from '../httpService'

// =========================================================================
// PAYMENT METHODS API
// =========================================================================

/**
 * Saved Payment Methods Management
 */
export const PaymentMethodsApi = {
	/**
	 * Gets saved payment methods for a customer.
	 */
	getAll: async (customerId: number) =>
		HttpService.get<SavedPaymentMethodDTO[]>(`/payment/customers/${customerId}/payment-methods`),

	/**
	 * Sets a payment method as default.
	 */
	setDefault: async (customerId: number, paymentMethodId: string) =>
		HttpService.post(`/payment/customers/${customerId}/payment-methods/${paymentMethodId}/default`, {}),

	/**
	 * Deletes a saved payment method.
	 */
	delete: async (paymentMethodId: string) => HttpService.delete(`/payment/payment-methods/${paymentMethodId}`),
}

// =========================================================================
// CUSTOMER SETTINGS API
// =========================================================================

/**
 * Customer Payment Settings
 */
export const CustomerSettingsApi = {
	/**
	 * Gets customer payment settings.
	 */
	get: async (customerId: number) =>
		HttpService.get<CustomerPaymentSettingsDTO>(`/payment/customers/${customerId}/settings`),

	/**
	 * Updates customer payment settings.
	 */
	update: async (customerId: number, request: UpdateCustomerPaymentSettingsRequest) =>
		HttpService.put<CustomerPaymentSettingsDTO>(`/payment/customers/${customerId}/settings`, request),
}

// =========================================================================
// PAYMENTS API
// =========================================================================

/**
 * Payment Processing API
 * Handles payment intents, manual payments, refunds, and saved payment methods.
 *
 * **Note on Order IDs:**
 * Order IDs are UUIDs (GUIDs) from the backend, represented as strings.
 *
 * @see 02_PAYMENT_PROCESSING_PLAN.md
 */
export const PaymentsApi = {
	/**
	 * Creates a PaymentIntent for an order.
	 * @param orderId - UUID string of the order
	 */
	createPaymentIntent: async (orderId: string) =>
		HttpService.post<CreatePaymentIntentResponse>(`/payment/orders/${orderId}/intent`, {}),

	/**
	 * Confirms a PaymentIntent after payment completion.
	 */
	confirmPaymentIntent: async (paymentIntentId: string) =>
		HttpService.post<PaymentDTO>(`/payment/intent/${paymentIntentId}/confirm`, {}),

	/**
	 * Records a manual payment (check, wire, cash).
	 * @param orderId - UUID string of the order
	 */
	recordManualPayment: async (orderId: string, request: RecordManualPaymentRequest) =>
		HttpService.post<PaymentDTO>(`/payment/orders/${orderId}/manual`, request),

	/**
	 * Gets a payment by ID.
	 */
	get: async (paymentId: string) => HttpService.get<PaymentDTO>(`/payment/${paymentId}`),

	/**
	 * Gets all payments for an order.
	 * @param orderId - UUID string of the order
	 */
	getByOrderId: async (orderId: string) => HttpService.get<PaymentDTO[]>(`/payment/orders/${orderId}`),

	/**
	 * Gets payment summary for an order.
	 * @param orderId - UUID string of the order
	 */
	getOrderSummary: async (orderId: string) => HttpService.get<PaymentSummary>(`/payment/orders/${orderId}/summary`),

	/**
	 * Gets all payments for a customer.
	 */
	getByCustomerId: async (customerId: number) => HttpService.get<PaymentDTO[]>(`/payment/customers/${customerId}`),

	/**
	 * Searches payments with filters.
	 */
	search: async (filter: PaymentSearchFilter) =>
		HttpService.post<PagedPaymentResult<PaymentDTO>>(`/payment/search`, filter),

	/**
	 * Processes a refund for a payment.
	 */
	refund: async (paymentId: string, request: RefundRequest) =>
		HttpService.post<PaymentDTO>(`/payment/${paymentId}/refund`, request),

	/**
	 * Saved Payment Methods Management
	 */
	PaymentMethods: PaymentMethodsApi,

	/**
	 * Customer Payment Settings
	 */
	CustomerSettings: CustomerSettingsApi,
}
