/**
 * Payment Form Component
 *
 * Provides a complete card payment form using Stripe Elements.
 * Handles the full payment flow: intent creation, card input, and confirmation.
 *
 * **Features:**
 * - Secure card input via Stripe Elements (PCI compliant)
 * - Loading states and error handling
 * - Automatic payment confirmation
 * - Callback for payment success/failure
 *
 * **Usage:**
 * ```tsx
 * <StripeProvider clientSecret={clientSecret}>
 *   <PaymentForm
 *     orderId={123}
 *     amountCents={5000}
 *     onSuccess={(payment) => console.log('Paid!', payment)}
 *     onError={(error) => console.error(error)}
 *   />
 * </StripeProvider>
 * ```
 *
 * @module payments/components/PaymentForm
 */

'use client'

import { useState, type FormEvent } from 'react'

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeCardElementChangeEvent } from '@stripe/stripe-js'
import { AlertCircle, CreditCard, Loader2, Lock } from 'lucide-react'

import { useCreatePaymentIntent, useConfirmPaymentIntent } from '../hooks'
import type { PaymentDTO, CreatePaymentIntentResponse } from '../types'
import { formatAmountCents } from '../types'

// =========================================================================
// COMPONENT TYPES
// =========================================================================

export interface PaymentFormProps {
	/** Order ID to create payment for */
	orderId: number
	/** Amount in cents to display (for confirmation) */
	amountCents: number
	/** Currency code (default: USD) */
	currency?: string
	/** Callback when payment succeeds */
	onSuccess?: (payment: PaymentDTO) => void
	/** Callback when payment fails */
	onError?: (error: string) => void
	/** Callback when payment is cancelled */
	onCancel?: () => void
	/** Whether the form is disabled */
	disabled?: boolean
	/** Custom class name */
	className?: string
}

// =========================================================================
// CARD ELEMENT OPTIONS
// =========================================================================

/**
 * Stripe CardElement styling options.
 * Matches DaisyUI input styling.
 * Note: Stripe Elements require CSS color values, not CSS variables directly.
 * These OKLCH values align with DaisyUI's semantic colors.
 */
const CARD_ELEMENT_OPTIONS = {
	style: {
		base: {
			fontSize: '16px',
			color: 'inherit',
			fontFamily: 'inherit',
			'::placeholder': {
				// Matches DaisyUI base-content/50 (neutral gray placeholder)
				color: 'oklch(0.55 0 0)',
			},
		},
		invalid: {
			// Matches DaisyUI error semantic color
			color: 'oklch(0.65 0.2 25)',
			iconColor: 'oklch(0.65 0.2 25)',
		},
	},
	hidePostalCode: false, // Required for address verification
}

// =========================================================================
// PAYMENT FORM COMPONENT
// =========================================================================

/**
 * PaymentForm Component
 *
 * Complete card payment form with Stripe Elements integration.
 * Handles intent creation, card validation, and payment confirmation.
 */
export function PaymentForm({
	orderId,
	amountCents,
	currency = 'USD',
	onSuccess,
	onError,
	onCancel,
	disabled = false,
	className = '',
}: PaymentFormProps) {
	// Stripe hooks
	const stripe = useStripe()
	const elements = useElements()

	// Local state
	const [isProcessing, setIsProcessing] = useState(false)
	const [cardError, setCardError] = useState<string | null>(null)
	const [cardComplete, setCardComplete] = useState(false)

	// API mutations
	const createIntent = useCreatePaymentIntent()
	const confirmIntent = useConfirmPaymentIntent()

	/**
	 * Handle card element changes.
	 * Updates error state and completion status.
	 */
	const handleCardChange = (event: StripeCardElementChangeEvent) => {
		setCardError(event.error?.message ?? null)
		setCardComplete(event.complete)
	}

	/**
	 * Handle form submission.
	 * Creates PaymentIntent and confirms payment with Stripe.
	 */
	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		// Validate Stripe is loaded
		if (!stripe || !elements) {
			onError?.('Payment system not ready. Please refresh and try again.')
			return
		}

		// Validate card is complete
		const cardElement = elements.getElement(CardElement)
		if (!cardElement || !cardComplete) {
			setCardError('Please enter your complete card information.')
			return
		}

		setIsProcessing(true)
		setCardError(null)

		try {
			// Step 1: Create PaymentIntent on backend
			const intentResult: CreatePaymentIntentResponse = await createIntent.mutateAsync(orderId)

			if (!intentResult.clientSecret) {
				throw new Error('Failed to create payment. Please try again.')
			}

			// Step 2: Confirm payment with Stripe
			const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
				intentResult.clientSecret,
				{
					payment_method: {
						card: cardElement,
					},
				}
			)

			if (stripeError) {
				// Handle Stripe-specific errors
				throw new Error(stripeError.message ?? 'Payment failed. Please try again.')
			}

			if (paymentIntent?.status === 'succeeded') {
				// Step 3: Confirm with backend
				const payment = await confirmIntent.mutateAsync(paymentIntent.id)
				onSuccess?.(payment)
			} else if (paymentIntent?.status === 'requires_action') {
				// 3D Secure or other action required - Stripe handles this automatically
				// The confirmCardPayment call above handles this case
				throw new Error('Additional authentication required. Please complete the verification.')
			} else {
				throw new Error(`Payment status: ${paymentIntent?.status}. Please try again.`)
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Payment failed. Please try again.'
			setCardError(message)
			onError?.(message)
		} finally {
			setIsProcessing(false)
		}
	}

	// Check if Stripe is available
	const stripeReady = stripe && elements
	const isDisabled = disabled || isProcessing || !stripeReady

	return (
		<form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
			{/* Amount Display */}
			<div className="rounded-lg bg-base-200 p-4">
				<div className="flex items-center justify-between">
					<span className="text-sm text-base-content/70">Amount to pay</span>
					<span className="text-xl font-bold">{formatAmountCents(amountCents, currency)}</span>
				</div>
			</div>

			{/* Card Input */}
			<div className="form-control">
				<label className="label">
					<span className="label-text font-medium">Card Information</span>
					<span className="label-text-alt flex items-center gap-1 text-base-content/60">
						<Lock className="h-3 w-3" />
						Secure
					</span>
				</label>
				<div
					className={`input input-bordered h-auto min-h-12 px-4 py-3 ${
						cardError ? 'input-error' : cardComplete ? 'input-success' : ''
					}`}
				>
					<CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
				</div>
				{cardError && (
					<label className="label">
						<span className="label-text-alt flex items-center gap-1 text-error">
							<AlertCircle className="h-3 w-3" />
							{cardError}
						</span>
					</label>
				)}
			</div>

			{/* Security Notice */}
			<div className="flex items-start gap-2 rounded-lg bg-base-200/50 p-3 text-xs text-base-content/60">
				<Lock className="mt-0.5 h-4 w-4 shrink-0" />
				<p>
					Your payment information is encrypted and processed securely by Stripe. We never store your
					full card details.
				</p>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3 pt-2">
				{onCancel && (
					<button type="button" className="btn btn-ghost flex-1" onClick={onCancel} disabled={isProcessing}>
						Cancel
					</button>
				)}
				<button
					type="submit"
					className={`btn btn-primary ${onCancel ? 'flex-1' : 'w-full'}`}
					disabled={isDisabled || !cardComplete}
				>
					{isProcessing ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Processing...
						</>
					) : (
						<>
							<CreditCard className="h-4 w-4" />
							Pay {formatAmountCents(amountCents, currency)}
						</>
					)}
				</button>
			</div>

			{/* Stripe not ready warning */}
			{!stripeReady && (
				<div className="alert alert-warning">
					<AlertCircle className="h-4 w-4" />
					<span>Loading payment system...</span>
				</div>
			)}
		</form>
	)
}

export default PaymentForm
