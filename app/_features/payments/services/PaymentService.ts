/**
 * Payment Service - Convenience Wrapper for Payment API
 *
 * Provides methods for all payment-related operations.
 * Uses the centralized API client for proper separation of concerns.
 *
 * **Architecture:**
 * - Raw API calls: `API.Payments.*` (in @_shared/services/api.ts)
 * - Convenience wrapper: `PaymentService` (this file) - unwraps responses
 *
 * @module payments/services
 */

import { API } from '@_shared'

import {
	ensureApiSuccessStatus,
	unwrapApiArrayPayload,
	unwrapApiPayload,
} from '@_shared/services'

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
} from '../types'

/**
 * Payment Service - Convenience Wrapper
 *
 * Wraps API.Payments to provide unwrapped responses for easier usage.
 */
export class PaymentService {
	// =========================================================================
	// PAYMENT INTENT (Card Payments)
	// =========================================================================

	/**
	 * Creates a PaymentIntent for an order.
	 * Returns client_secret for Stripe.js frontend.
	 * @param orderId - UUID/GUID of the order
	 */
	static async createPaymentIntent(orderId: string): Promise<CreatePaymentIntentResponse> {
		const response = await API.Payments.createPaymentIntent(orderId)
		return unwrapApiPayload<CreatePaymentIntentResponse>(
			response,
			'create payment intent'
		)
	}

	/**
	 * Confirms a PaymentIntent after customer completes payment.
	 */
	static async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentDTO> {
		const response = await API.Payments.confirmPaymentIntent(paymentIntentId)
		return unwrapApiPayload<PaymentDTO>(response, 'confirm payment intent')
	}

	// =========================================================================
	// MANUAL PAYMENTS
	// =========================================================================

	/**
	 * Records a manual payment (check, wire, cash).
	 * @param orderId - UUID/GUID of the order
	 */
	static async recordManualPayment(orderId: string, request: RecordManualPaymentRequest): Promise<PaymentDTO> {
		const response = await API.Payments.recordManualPayment(orderId, request)
		return unwrapApiPayload<PaymentDTO>(response, 'record manual payment')
	}

	// =========================================================================
	// PAYMENT QUERIES
	// =========================================================================

	/**
	 * Get a payment by ID.
	 */
	static async getById(paymentId: string): Promise<PaymentDTO> {
		const response = await API.Payments.get(paymentId)
		return unwrapApiPayload<PaymentDTO>(response, 'load payment')
	}

	/**
	 * Get all payments for an order.
	 * @param orderId - UUID/GUID of the order
	 */
	static async getByOrderId(orderId: string): Promise<PaymentDTO[]> {
		const response = await API.Payments.getByOrderId(orderId)
		return unwrapApiArrayPayload<PaymentDTO>(response, 'load order payments')
	}

	/**
	 * Get payment summary for an order.
	 * @param orderId - UUID/GUID of the order
	 */
	static async getOrderPaymentSummary(orderId: string): Promise<PaymentSummary> {
		const response = await API.Payments.getOrderSummary(orderId)
		return unwrapApiPayload<PaymentSummary>(response, 'load order payment summary')
	}

	/**
	 * Get all payments for a customer.
	 */
	static async getByCustomerId(customerId: number): Promise<PaymentDTO[]> {
		const response = await API.Payments.getByCustomerId(customerId)
		return unwrapApiArrayPayload<PaymentDTO>(response, 'load customer payments')
	}

	/**
	 * Search payments with filters.
	 */
	static async search(filter: PaymentSearchFilter): Promise<PagedPaymentResult<PaymentDTO>> {
		const response = await API.Payments.search(filter)
		return unwrapApiPayload<PagedPaymentResult<PaymentDTO>>(response, 'search payments')
	}

	// =========================================================================
	// REFUNDS
	// =========================================================================

	/**
	 * Process a refund for a payment.
	 */
	static async refund(paymentId: string, request: RefundRequest): Promise<PaymentDTO> {
		const response = await API.Payments.refund(paymentId, request)
		return unwrapApiPayload<PaymentDTO>(response, 'refund payment')
	}

	// =========================================================================
	// SAVED PAYMENT METHODS
	// =========================================================================

	/**
	 * Get saved payment methods for a customer.
	 */
	static async getSavedPaymentMethods(customerId: number): Promise<SavedPaymentMethodDTO[]> {
		const response = await API.Payments.PaymentMethods.getAll(customerId)
		return unwrapApiArrayPayload<SavedPaymentMethodDTO>(response, 'load saved payment methods')
	}

	/**
	 * Set a payment method as default.
	 */
	static async setDefaultPaymentMethod(customerId: number, paymentMethodId: string): Promise<void> {
		const response = await API.Payments.PaymentMethods.setDefault(customerId, paymentMethodId)
		ensureApiSuccessStatus(response, 'set default payment method')
	}

	/**
	 * Delete a saved payment method.
	 */
	static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
		const response = await API.Payments.PaymentMethods.delete(paymentMethodId)
		ensureApiSuccessStatus(response, 'delete payment method')
	}

	// =========================================================================
	// CUSTOMER PAYMENT SETTINGS
	// =========================================================================

	/**
	 * Get customer payment settings.
	 */
	static async getCustomerPaymentSettings(customerId: number): Promise<CustomerPaymentSettingsDTO> {
		const response = await API.Payments.CustomerSettings.get(customerId)
		return unwrapApiPayload<CustomerPaymentSettingsDTO>(
			response,
			'load customer payment settings'
		)
	}

	/**
	 * Update customer payment settings.
	 */
	static async updateCustomerPaymentSettings(
		customerId: number,
		request: UpdateCustomerPaymentSettingsRequest
	): Promise<CustomerPaymentSettingsDTO> {
		const response = await API.Payments.CustomerSettings.update(customerId, request)
		return unwrapApiPayload<CustomerPaymentSettingsDTO>(
			response,
			'update customer payment settings'
		)
	}
}
