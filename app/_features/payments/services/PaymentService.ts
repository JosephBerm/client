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
	 */
	static async createPaymentIntent(orderId: number): Promise<CreatePaymentIntentResponse> {
		const response = await API.Payments.createPaymentIntent(orderId)
		return response.data.payload!
	}

	/**
	 * Confirms a PaymentIntent after customer completes payment.
	 */
	static async confirmPaymentIntent(paymentIntentId: string): Promise<PaymentDTO> {
		const response = await API.Payments.confirmPaymentIntent(paymentIntentId)
		return response.data.payload!
	}

	// =========================================================================
	// MANUAL PAYMENTS
	// =========================================================================

	/**
	 * Records a manual payment (check, wire, cash).
	 */
	static async recordManualPayment(orderId: number, request: RecordManualPaymentRequest): Promise<PaymentDTO> {
		const response = await API.Payments.recordManualPayment(orderId, request)
		return response.data.payload!
	}

	// =========================================================================
	// PAYMENT QUERIES
	// =========================================================================

	/**
	 * Get a payment by ID.
	 */
	static async getById(paymentId: string): Promise<PaymentDTO> {
		const response = await API.Payments.get(paymentId)
		return response.data.payload!
	}

	/**
	 * Get all payments for an order.
	 */
	static async getByOrderId(orderId: number): Promise<PaymentDTO[]> {
		const response = await API.Payments.getByOrderId(orderId)
		return response.data.payload || []
	}

	/**
	 * Get payment summary for an order.
	 */
	static async getOrderPaymentSummary(orderId: number): Promise<PaymentSummary> {
		const response = await API.Payments.getOrderSummary(orderId)
		return response.data.payload!
	}

	/**
	 * Get all payments for a customer.
	 */
	static async getByCustomerId(customerId: number): Promise<PaymentDTO[]> {
		const response = await API.Payments.getByCustomerId(customerId)
		return response.data.payload || []
	}

	/**
	 * Search payments with filters.
	 */
	static async search(filter: PaymentSearchFilter): Promise<PagedPaymentResult<PaymentDTO>> {
		const response = await API.Payments.search(filter)
		return response.data.payload!
	}

	// =========================================================================
	// REFUNDS
	// =========================================================================

	/**
	 * Process a refund for a payment.
	 */
	static async refund(paymentId: string, request: RefundRequest): Promise<PaymentDTO> {
		const response = await API.Payments.refund(paymentId, request)
		return response.data.payload!
	}

	// =========================================================================
	// SAVED PAYMENT METHODS
	// =========================================================================

	/**
	 * Get saved payment methods for a customer.
	 */
	static async getSavedPaymentMethods(customerId: number): Promise<SavedPaymentMethodDTO[]> {
		const response = await API.Payments.PaymentMethods.getAll(customerId)
		return response.data.payload || []
	}

	/**
	 * Set a payment method as default.
	 */
	static async setDefaultPaymentMethod(customerId: number, paymentMethodId: string): Promise<void> {
		await API.Payments.PaymentMethods.setDefault(customerId, paymentMethodId)
	}

	/**
	 * Delete a saved payment method.
	 */
	static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
		await API.Payments.PaymentMethods.delete(paymentMethodId)
	}

	// =========================================================================
	// CUSTOMER PAYMENT SETTINGS
	// =========================================================================

	/**
	 * Get customer payment settings.
	 */
	static async getCustomerPaymentSettings(customerId: number): Promise<CustomerPaymentSettingsDTO> {
		const response = await API.Payments.CustomerSettings.get(customerId)
		return response.data.payload!
	}

	/**
	 * Update customer payment settings.
	 */
	static async updateCustomerPaymentSettings(
		customerId: number,
		request: UpdateCustomerPaymentSettingsRequest
	): Promise<CustomerPaymentSettingsDTO> {
		const response = await API.Payments.CustomerSettings.update(customerId, request)
		return response.data.payload!
	}
}
