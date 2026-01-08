// =========================================================================
// PAYMENT PROCESSING TYPES (MVP Feature #02)
// =========================================================================

/**
 * Payment method types supported.
 * @remarks MUST match backend: server/Entities/Payments/Payment.cs
 */
export enum PaymentMethod {
	CreditCard = 1,
	DebitCard = 2,
	ACH = 3,
	Check = 4,
	Wire = 5,
	Cash = 6,
	Other = 99,
}

/**
 * Payment status values aligned with Stripe lifecycle.
 * @remarks MUST match backend: server/Entities/Payments/Payment.cs
 */
export enum PaymentStatus {
	Pending = 1,
	RequiresPaymentMethod = 2,
	RequiresConfirmation = 3,
	RequiresAction = 4,
	Processing = 5,
	Succeeded = 10,
	Failed = 20,
	Cancelled = 21,
	Refunded = 30,
	PartiallyRefunded = 31,
}

/**
 * Payment terms for B2B customers.
 */
export enum PaymentTerms {
	DueOnReceipt = 0,
	Net15 = 15,
	Net30 = 30,
	Net45 = 45,
	Net60 = 60,
	Net90 = 90,
}

// =========================================================================
// REQUEST TYPES
// =========================================================================

/**
 * Request to create a payment intent.
 */
export interface CreatePaymentIntentRequest {
	orderId: number
}

/**
 * Request to record a manual payment.
 */
export interface RecordManualPaymentRequest {
	amountCents: number
	method: PaymentMethod
	referenceNumber?: string
	notes?: string
}

/**
 * Request to process a refund.
 */
export interface RefundRequest {
	amountCents: number
	reason: string
}

/**
 * Request to update customer payment settings.
 */
export interface UpdateCustomerPaymentSettingsRequest {
	paymentTerms: PaymentTerms
	creditLimitCents: number
}

// =========================================================================
// RESPONSE TYPES
// =========================================================================

/**
 * Response when creating a Stripe PaymentIntent.
 */
export interface CreatePaymentIntentResponse {
	paymentIntentId: string
	clientSecret: string
	amountCents: number
	currency: string
}

/**
 * Payment DTO for API responses.
 */
export interface PaymentDTO {
	id: string
	orderId: number
	orderNumber?: string
	customerId?: number
	customerName?: string
	amountCents: number
	amount: number
	currency: string
	method: PaymentMethod
	methodDisplay: string
	status: PaymentStatus
	statusDisplay: string
	cardLastFour?: string
	cardBrand?: string
	referenceNumber?: string
	notes?: string
	refundedAmountCents: number
	refundedAmount: number
	refundReason?: string
	createdAt: string
	completedAt?: string
	createdBy: string
}

/**
 * Payment summary for an order.
 */
export interface PaymentSummary {
	orderId: number
	totalAmountCents: number
	paidAmountCents: number
	refundedAmountCents: number
	remainingBalanceCents: number
	totalAmount: number
	paidAmount: number
	refundedAmount: number
	remainingBalance: number
	isFullyPaid: boolean
	paymentCount: number
}

/**
 * Saved payment method DTO.
 */
export interface SavedPaymentMethodDTO {
	id: string
	type: string
	cardLastFour?: string
	cardBrand?: string
	expMonth?: number
	expYear?: number
	bankLastFour?: string
	bankName?: string
	isDefault: boolean
	nickname?: string
	displayName: string
	isExpired: boolean
	createdAt: string
}

/**
 * Customer payment settings DTO.
 */
export interface CustomerPaymentSettingsDTO {
	customerId: number
	customerName: string
	paymentTerms: PaymentTerms
	paymentTermsDisplay: string
	creditLimitCents: number
	creditLimit: number
	outstandingBalanceCents: number
	outstandingBalance: number
	availableCredit: number
	stripeCustomerId?: string
	hasStripeAccount: boolean
	savedPaymentMethodCount: number
}

// =========================================================================
// SEARCH/FILTER TYPES
// =========================================================================

/**
 * Filter criteria for payment searches.
 */
export interface PaymentSearchFilter {
	orderId?: number
	customerId?: number
	status?: PaymentStatus
	method?: PaymentMethod
	fromDate?: string
	toDate?: string
	minAmountCents?: number
	maxAmountCents?: number
	searchTerm?: string
	pageNumber?: number
	pageSize?: number
	sortBy?: string
	sortDescending?: boolean
}

/**
 * Paginated result for payment searches.
 */
export interface PagedPaymentResult<T> {
	items: T[]
	totalCount: number
	pageNumber: number
	pageSize: number
	totalPages: number
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Get display string for payment method.
 */
export function getPaymentMethodDisplay(method: PaymentMethod): string {
	switch (method) {
		case PaymentMethod.CreditCard:
			return 'Credit Card'
		case PaymentMethod.DebitCard:
			return 'Debit Card'
		case PaymentMethod.ACH:
			return 'ACH Bank Transfer'
		case PaymentMethod.Check:
			return 'Check'
		case PaymentMethod.Wire:
			return 'Wire Transfer'
		case PaymentMethod.Cash:
			return 'Cash'
		case PaymentMethod.Other:
		default:
			return 'Other'
	}
}

/**
 * Get display string for payment status.
 */
export function getPaymentStatusDisplay(status: PaymentStatus): string {
	switch (status) {
		case PaymentStatus.Pending:
			return 'Pending'
		case PaymentStatus.Processing:
			return 'Processing'
		case PaymentStatus.Succeeded:
			return 'Succeeded'
		case PaymentStatus.Failed:
			return 'Failed'
		case PaymentStatus.Cancelled:
			return 'Cancelled'
		case PaymentStatus.Refunded:
			return 'Refunded'
		case PaymentStatus.PartiallyRefunded:
			return 'Partially Refunded'
		case PaymentStatus.RequiresAction:
			return 'Requires Action'
		case PaymentStatus.RequiresPaymentMethod:
			return 'Requires Payment Method'
		case PaymentStatus.RequiresConfirmation:
			return 'Requires Confirmation'
		default:
			return 'Unknown'
	}
}

/**
 * Get display string for payment terms.
 */
export function getPaymentTermsDisplay(terms: PaymentTerms): string {
	switch (terms) {
		case PaymentTerms.DueOnReceipt:
			return 'Due on Receipt'
		case PaymentTerms.Net15:
			return 'Net 15'
		case PaymentTerms.Net30:
			return 'Net 30'
		case PaymentTerms.Net45:
			return 'Net 45'
		case PaymentTerms.Net60:
			return 'Net 60'
		case PaymentTerms.Net90:
			return 'Net 90'
		default:
			return 'Unknown'
	}
}

/**
 * Format amount in cents to currency string.
 */
export function formatAmountCents(amountCents: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amountCents / 100)
}

/**
 * Get status color for badges.
 */
export function getPaymentStatusColor(status: PaymentStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
	switch (status) {
		case PaymentStatus.Succeeded:
			return 'success'
		case PaymentStatus.Processing:
		case PaymentStatus.RequiresAction:
		case PaymentStatus.RequiresConfirmation:
			return 'warning'
		case PaymentStatus.Failed:
		case PaymentStatus.Cancelled:
			return 'error'
		case PaymentStatus.Refunded:
		case PaymentStatus.PartiallyRefunded:
			return 'info'
		case PaymentStatus.Pending:
		case PaymentStatus.RequiresPaymentMethod:
		default:
			return 'default'
	}
}
