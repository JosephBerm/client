/**
 * Manual Payment Modal Component
 *
 * Modal for recording manual payments (check, wire, cash, ACH).
 * Used by admins and sales reps to record offline payments.
 *
 * **Features:**
 * - Support for check, wire, cash, and ACH payments
 * - Reference number tracking
 * - Notes field for additional context
 * - Amount validation against order balance
 *
 * @module payments/components/ManualPaymentModal
 */

'use client'

import { useEffect, useRef, useState } from 'react'

import { AlertCircle, Banknote, Building2, CreditCard, FileText, Loader2, X } from 'lucide-react'

import { useRecordManualPayment } from '../hooks'
import { PaymentMethod, formatAmountCents, type PaymentDTO, type RecordManualPaymentRequest } from '../types'

// =========================================================================
// COMPONENT TYPES
// =========================================================================

export interface ManualPaymentModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback to close the modal */
	onClose: () => void
	/** Order ID (UUID/GUID) to record payment for */
	orderId: string
	/** Maximum amount allowed (remaining balance in cents) */
	maxAmountCents: number
	/** Currency code (default: USD) */
	currency?: string
	/** Callback when payment is recorded successfully */
	onSuccess?: (payment: PaymentDTO) => void
}

// =========================================================================
// PAYMENT METHOD OPTIONS
// =========================================================================

interface PaymentMethodOption {
	value: PaymentMethod
	label: string
	icon: typeof CreditCard
	description: string
	requiresReference: boolean
}

const MANUAL_PAYMENT_METHODS: PaymentMethodOption[] = [
	{
		value: PaymentMethod.Check,
		label: 'Check',
		icon: FileText,
		description: 'Paper check payment',
		requiresReference: true,
	},
	{
		value: PaymentMethod.Wire,
		label: 'Wire Transfer',
		icon: Building2,
		description: 'Bank wire transfer',
		requiresReference: true,
	},
	{
		value: PaymentMethod.ACH,
		label: 'ACH',
		icon: Building2,
		description: 'ACH bank transfer',
		requiresReference: true,
	},
	{
		value: PaymentMethod.Cash,
		label: 'Cash',
		icon: Banknote,
		description: 'Cash payment',
		requiresReference: false,
	},
]

// =========================================================================
// MANUAL PAYMENT MODAL COMPONENT
// =========================================================================

/**
 * ManualPaymentModal Component
 *
 * DaisyUI modal for recording manual (offline) payments.
 * Validates amounts and requires reference numbers where appropriate.
 */
export function ManualPaymentModal({
	isOpen,
	onClose,
	orderId,
	maxAmountCents,
	currency = 'USD',
	onSuccess,
}: ManualPaymentModalProps) {
	const modalRef = useRef<HTMLDialogElement>(null)

	// Form state
	const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.Check)
	const [amountDollars, setAmountDollars] = useState('')
	const [referenceNumber, setReferenceNumber] = useState('')
	const [notes, setNotes] = useState('')
	const [error, setError] = useState<string | null>(null)

	// API mutation
	const recordPayment = useRecordManualPayment()

	// Get selected method config
	const selectedMethod = MANUAL_PAYMENT_METHODS.find((m) => m.value === method)!

	// Calculate amount in cents
	const amountCents = Math.round(parseFloat(amountDollars || '0') * 100)

	// Manage modal visibility
	useEffect(() => {
		const modal = modalRef.current
		if (!modal) return

		if (isOpen) {
			modal.showModal()
		} else {
			modal.close()
		}
	}, [isOpen])

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setMethod(PaymentMethod.Check)
			setAmountDollars((maxAmountCents / 100).toFixed(2))
			setReferenceNumber('')
			setNotes('')
			setError(null)
		}
	}, [isOpen, maxAmountCents])

	/**
	 * Validate and submit the manual payment.
	 */
	const handleSubmit = async () => {
		setError(null)

		// Validate amount
		if (!amountCents || amountCents <= 0) {
			setError('Please enter a valid amount.')
			return
		}

		if (amountCents > maxAmountCents) {
			setError(`Amount cannot exceed ${formatAmountCents(maxAmountCents, currency)}.`)
			return
		}

		// Validate reference number if required
		if (selectedMethod.requiresReference && !referenceNumber.trim()) {
			setError(`Reference number is required for ${selectedMethod.label} payments.`)
			return
		}

		try {
			const request: RecordManualPaymentRequest = {
				amountCents,
				method,
				referenceNumber: referenceNumber.trim() || undefined,
				notes: notes.trim() || undefined,
			}

			const payment = await recordPayment.mutateAsync({ orderId, request })
			onSuccess?.(payment)
			onClose()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to record payment. Please try again.')
		}
	}

	return (
		<dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
			<div className="modal-box">
				{/* Header */}
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-bold">Record Manual Payment</h3>
					<button className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Close">
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Balance Info */}
				<div className="mb-6 rounded-lg bg-base-200 p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm text-base-content/70">Outstanding Balance</span>
						<span className="font-semibold">{formatAmountCents(maxAmountCents, currency)}</span>
					</div>
				</div>

				{/* Payment Method Selection */}
				<div className="mb-4">
					<label className="label">
						<span className="label-text font-medium">Payment Method</span>
					</label>
					<div className="grid grid-cols-2 gap-2">
						{MANUAL_PAYMENT_METHODS.map((option) => {
							const Icon = option.icon
							const isSelected = method === option.value
							return (
								<button
									key={option.value}
									type="button"
									className={`btn btn-outline justify-start gap-2 ${
										isSelected ? 'btn-primary' : ''
									}`}
									onClick={() => setMethod(option.value)}
								>
									<Icon className="h-4 w-4" />
									{option.label}
								</button>
							)
						})}
					</div>
					<p className="mt-1 text-xs text-base-content/60">{selectedMethod.description}</p>
				</div>

				{/* Amount Input */}
				<div className="form-control mb-4">
					<label className="label">
						<span className="label-text font-medium">Amount</span>
					</label>
					<label className="input input-bordered flex items-center gap-2">
						<span className="text-base-content/60">$</span>
						<input
							type="number"
							className="grow"
							placeholder="0.00"
							step="0.01"
							min="0.01"
							max={maxAmountCents / 100}
							value={amountDollars}
							onChange={(e) => setAmountDollars(e.target.value)}
						/>
					</label>
				</div>

				{/* Reference Number Input */}
				<div className="form-control mb-4">
					<label className="label">
						<span className="label-text font-medium">
							Reference Number
							{selectedMethod.requiresReference && <span className="text-error">*</span>}
						</span>
					</label>
					<input
						type="text"
						className="input input-bordered"
						placeholder={`e.g., CHK-12345, Wire confirmation #`}
						value={referenceNumber}
						onChange={(e) => setReferenceNumber(e.target.value)}
					/>
				</div>

				{/* Notes Input */}
				<div className="form-control mb-4">
					<label className="label">
						<span className="label-text font-medium">Notes (Optional)</span>
					</label>
					<textarea
						className="textarea textarea-bordered"
						placeholder="Additional notes about this payment..."
						rows={2}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
					/>
				</div>

				{/* Error Display */}
				{error && (
					<div className="alert alert-error mb-4">
						<AlertCircle className="h-4 w-4" />
						<span>{error}</span>
					</div>
				)}

				{/* Actions */}
				<div className="modal-action">
					<button className="btn btn-ghost" onClick={onClose} disabled={recordPayment.isPending}>
						Cancel
					</button>
					<button
						className="btn btn-primary"
						onClick={handleSubmit}
						disabled={recordPayment.isPending || amountCents <= 0}
					>
						{recordPayment.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Recording...
							</>
						) : (
							<>Record {formatAmountCents(amountCents, currency)}</>
						)}
					</button>
				</div>
			</div>

			{/* Click outside to close */}
			<form method="dialog" className="modal-backdrop">
				<button onClick={onClose}>close</button>
			</form>
		</dialog>
	)
}

export default ManualPaymentModal
