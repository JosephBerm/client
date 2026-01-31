/**
 * Order Payment Section Component
 *
 * Complete payment section for the order detail page.
 * Integrates all payment components: summary, history, forms, and modals.
 *
 * **Features:**
 * - Payment summary card
 * - Payment history table
 * - Card payment form (Stripe)
 * - Manual payment recording
 * - Refund processing
 * - Role-based actions
 *
 * **Usage:**
 * ```tsx
 * <OrderPaymentSection
 *   orderId={123}
 *   totalAmountCents={50000}
 *   canRecordPayment={true}
 *   canRefund={true}
 * />
 * ```
 *
 * @module payments/components/OrderPaymentSection
 */

'use client'

import { useState } from 'react'

import {
	AlertCircle,
	Banknote,
	CheckCircle2,
	CreditCard,
	Loader2,
	Plus,
	RefreshCcw,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { useOrderPayments, useOrderPaymentSummary } from '../hooks'
import { formatAmountCents, type PaymentDTO } from '../types'

import { ManualPaymentModal } from './ManualPaymentModal'
import { PaymentForm } from './PaymentForm'
import { PaymentHistoryTable } from './PaymentHistoryTable'
import { RefundModal } from './RefundModal'
import { StripeProvider, useStripeConfigured } from './StripeProvider'

// =========================================================================
// COMPONENT TYPES
// =========================================================================

export interface OrderPaymentSectionProps {
	/** Order ID (UUID/GUID) */
	orderId: string
	/** Total order amount in cents */
	totalAmountCents: number
	/** Currency code */
	currency?: string
	/** Whether user can record manual payments */
	canRecordPayment?: boolean
	/** Whether user can process refunds */
	canRefund?: boolean
	/** Whether user can make card payments */
	canPayByCard?: boolean
	/** Custom class name */
	className?: string
}

// =========================================================================
// PAYMENT SUMMARY CARD
// =========================================================================

interface PaymentSummaryCardProps {
	totalAmount: number
	paidAmount: number
	refundedAmount: number
	remainingBalance: number
	isFullyPaid: boolean
	currency: string
	isLoading: boolean
}

function PaymentSummaryCard({
	totalAmount,
	paidAmount,
	refundedAmount,
	remainingBalance,
	isFullyPaid,
	currency,
	isLoading,
}: PaymentSummaryCardProps) {
	if (isLoading) {
		return (
			<div className="card bg-base-100 shadow-sm">
				<div className="card-body">
					<div className="skeleton h-6 w-32" />
					<div className="skeleton mt-4 h-8 w-24" />
				</div>
			</div>
		)
	}

	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body p-4">
				<h3 className="card-title text-base">Payment Summary</h3>

				<div className="mt-2 space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-base-content/70">Order Total</span>
						<span className="font-medium">{formatAmountCents(totalAmount * 100, currency)}</span>
					</div>

					<div className="flex justify-between text-sm">
						<span className="text-base-content/70">Paid</span>
						<span className="font-medium text-success">
							{formatAmountCents(paidAmount * 100, currency)}
						</span>
					</div>

					{refundedAmount > 0 && (
						<div className="flex justify-between text-sm">
							<span className="text-base-content/70">Refunded</span>
							<span className="font-medium text-warning">
								-{formatAmountCents(refundedAmount * 100, currency)}
							</span>
						</div>
					)}

					<div className="divider my-1" />

					<div className="flex justify-between">
						<span className="font-medium">Balance Due</span>
						<span className={`text-lg font-bold ${isFullyPaid ? 'text-success' : 'text-error'}`}>
							{isFullyPaid ? (
								<span className="flex items-center gap-1">
									<CheckCircle2 className="h-5 w-5" />
									Paid
								</span>
							) : (
								formatAmountCents(remainingBalance * 100, currency)
							)}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

// =========================================================================
// ORDER PAYMENT SECTION COMPONENT
// =========================================================================

/**
 * OrderPaymentSection Component
 *
 * Complete payment interface for order detail pages.
 * Handles all payment operations with proper role-based access.
 */
export function OrderPaymentSection({
	orderId,
	totalAmountCents,
	currency = 'USD',
	canRecordPayment = false,
	canRefund = false,
	canPayByCard = false,
	className = '',
}: OrderPaymentSectionProps) {
	// State for modals
	const [showCardPayment, setShowCardPayment] = useState(false)
	const [showManualPayment, setShowManualPayment] = useState(false)
	const [refundPayment, setRefundPayment] = useState<PaymentDTO | null>(null)

	// Check if Stripe is configured
	const stripeConfigured = useStripeConfigured()

	// Fetch payment data
	const {
		data: payments,
		isLoading: paymentsLoading,
		error: paymentsError,
	} = useOrderPayments(orderId)

	const {
		data: summary,
		isLoading: summaryLoading,
		error: summaryError,
	} = useOrderPaymentSummary(orderId)

	// Calculate remaining balance
	const remainingBalanceCents = summary?.remainingBalanceCents ?? totalAmountCents
	const isFullyPaid = summary?.isFullyPaid ?? false

	// Handle payment success
	const handlePaymentSuccess = (payment: PaymentDTO) => {
		toast.success(`Payment of ${formatAmountCents(payment.amountCents, payment.currency)} recorded successfully!`)
		setShowCardPayment(false)
		setShowManualPayment(false)
	}

	// Handle payment error
	const handlePaymentError = (error: string) => {
		toast.error(error)
	}

	// Handle refund success
	const handleRefundSuccess = (payment: PaymentDTO) => {
		toast.success(`Refund processed successfully!`)
		setRefundPayment(null)
	}

	// Error state
	if (paymentsError || summaryError) {
		return (
			<div className={`alert alert-error ${className}`}>
				<AlertCircle className="h-4 w-4" />
				<span>Failed to load payment information. Please refresh the page.</span>
			</div>
		)
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Payment Summary */}
			<PaymentSummaryCard
				totalAmount={summary?.totalAmount ?? totalAmountCents / 100}
				paidAmount={summary?.paidAmount ?? 0}
				refundedAmount={summary?.refundedAmount ?? 0}
				remainingBalance={summary?.remainingBalance ?? totalAmountCents / 100}
				isFullyPaid={isFullyPaid}
				currency={currency}
				isLoading={summaryLoading}
			/>

			{/* Action Buttons (when not fully paid) */}
			{!isFullyPaid && (canPayByCard || canRecordPayment) && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h3 className="card-title text-base">Record Payment</h3>

						{/* Card Payment Toggle */}
						{canPayByCard && stripeConfigured && !showCardPayment && (
							<button
								className="btn btn-primary"
								onClick={() => setShowCardPayment(true)}
							>
								<CreditCard className="h-4 w-4" />
								Pay with Card
							</button>
						)}

						{/* Card Payment Form */}
						{showCardPayment && stripeConfigured && (
							<StripeProvider>
								<PaymentForm
									orderId={orderId}
									amountCents={remainingBalanceCents}
									currency={currency}
									onSuccess={handlePaymentSuccess}
									onError={handlePaymentError}
									onCancel={() => setShowCardPayment(false)}
								/>
							</StripeProvider>
						)}

						{/* Stripe not configured warning */}
						{canPayByCard && !stripeConfigured && (
							<div className="alert alert-warning">
								<AlertCircle className="h-4 w-4" />
								<span className="text-sm">
									Card payments are not available. Stripe is not configured.
								</span>
							</div>
						)}

						{/* Manual Payment Button */}
						{canRecordPayment && !showCardPayment && (
							<button
								className="btn btn-outline"
								onClick={() => setShowManualPayment(true)}
							>
								<Banknote className="h-4 w-4" />
								Record Manual Payment
							</button>
						)}
					</div>
				</div>
			)}

			{/* Fully Paid Banner */}
			{isFullyPaid && (
				<div className="alert alert-success">
					<CheckCircle2 className="h-5 w-5" />
					<div>
						<h4 className="font-bold">Payment Complete</h4>
						<p className="text-sm">This order has been fully paid.</p>
					</div>
				</div>
			)}

			{/* Payment History */}
			<div className="card bg-base-100 shadow-sm">
				<div className="card-body p-4">
					<div className="flex items-center justify-between">
						<h3 className="card-title text-base">Payment History</h3>
						{paymentsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
					</div>

					<PaymentHistoryTable
						payments={payments ?? []}
						isLoading={paymentsLoading}
						onRefund={canRefund ? setRefundPayment : undefined}
					/>
				</div>
			</div>

			{/* Manual Payment Modal */}
			<ManualPaymentModal
				isOpen={showManualPayment}
				onClose={() => setShowManualPayment(false)}
				orderId={orderId}
				maxAmountCents={remainingBalanceCents}
				currency={currency}
				onSuccess={handlePaymentSuccess}
			/>

			{/* Refund Modal */}
			<RefundModal
				isOpen={!!refundPayment}
				onClose={() => setRefundPayment(null)}
				payment={refundPayment}
				onSuccess={handleRefundSuccess}
			/>
		</div>
	)
}

export default OrderPaymentSection
