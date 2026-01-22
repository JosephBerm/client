/**
 * Payment Processing Feature (MVP Feature #02)
 *
 * Provides payment processing capabilities including:
 * - Card payments via Stripe
 * - Manual payments (check, wire, cash)
 * - Refunds
 * - Saved payment methods
 * - Customer payment settings
 *
 * **Usage:**
 * ```typescript
 * import { useOrderPayments, PaymentStatus } from '@_features/payments'
 *
 * // For API calls, use centralized API object:
 * import API from '@_shared/services/api'
 * await API.Payments.createPaymentIntent(orderId)
 * ```
 *
 * @module payments
 */

// Types and Enums (explicit named exports for tree-shaking)
export {
	// Enums
	PaymentMethod,
	PaymentStatus,
	PaymentTerms,
	// Helper functions
	getPaymentMethodDisplay,
	getPaymentStatusDisplay,
	getPaymentTermsDisplay,
	getPaymentStatusColor,
	formatAmountCents,
} from './types'

export type {
	// Request DTOs
	CreatePaymentIntentRequest,
	RecordManualPaymentRequest,
	RefundRequest,
	UpdateCustomerPaymentSettingsRequest,
	// Response DTOs
	CreatePaymentIntentResponse,
	PaymentDTO,
	PaymentSummary,
	SavedPaymentMethodDTO,
	CustomerPaymentSettingsDTO,
	// Filter/Search DTOs
	PaymentSearchFilter,
	PagedPaymentResult,
} from './types'

// Services
export { PaymentService } from './services'

// Hooks
export {
	paymentKeys,
	usePayment,
	useOrderPayments,
	useOrderPaymentSummary,
	useCustomerPayments,
	usePaymentSearch,
	useCreatePaymentIntent,
	useConfirmPaymentIntent,
	useRecordManualPayment,
	useRefundPayment,
	useSavedPaymentMethods,
	useSetDefaultPaymentMethod,
	useDeletePaymentMethod,
	useCustomerPaymentSettings,
	useUpdateCustomerPaymentSettings,
} from './hooks'

// Components
export {
	// Provider
	StripeProvider,
	useStripeConfigured,
	// Form Components
	PaymentForm,
	// Modal Components
	ManualPaymentModal,
	RefundModal,
	// Display Components
	PaymentStatusBadge,
	PaymentHistoryTable,
	// Integration Components
	OrderPaymentSection,
} from './components'

export type {
	StripeProviderProps,
	PaymentFormProps,
	ManualPaymentModalProps,
	RefundModalProps,
	PaymentStatusBadgeProps,
	PaymentHistoryTableProps,
	OrderPaymentSectionProps,
} from './components'
