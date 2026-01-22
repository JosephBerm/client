/**
 * Refund Modal Component
 *
 * Modal for processing full or partial refunds on payments.
 * Validates refund amounts and requires a reason.
 *
 * **Features:**
 * - Full or partial refund support
 * - Amount validation against refundable balance
 * - Required reason field
 * - Quick refund amount buttons
 *
 * @module payments/components/RefundModal
 */

'use client'

import { useEffect, useRef, useState } from 'react'

import { AlertCircle, Loader2, RefreshCcw, X } from 'lucide-react'

import { useRefundPayment } from '../hooks'
import { formatAmountCents, type PaymentDTO, type RefundRequest } from '../types'

import { PaymentStatusBadge } from './PaymentStatusBadge'

// =========================================================================
// COMPONENT TYPES
// =========================================================================

export interface RefundModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback to close the modal */
	onClose: () => void
	/** Payment to refund */
	payment: PaymentDTO | null
	/** Callback when refund is processed successfully */
	onSuccess?: (payment: PaymentDTO) => void
}

// =========================================================================
// COMMON REFUND REASONS
// =========================================================================

const COMMON_REASONS = [
	'Customer request',
	'Order cancelled',
	'Product defective',
	'Wrong item shipped',
	'Duplicate charge',
	'Other',
]

// =========================================================================
// REFUND MODAL COMPONENT
// =========================================================================

/**
 * RefundModal Component
 *
 * DaisyUI modal for processing payment refunds.
 * Supports full and partial refunds with validation.
 */
export function RefundModal({ isOpen, onClose, payment, onSuccess }: RefundModalProps) {
	const modalRef = useRef<HTMLDialogElement>(null)

	// Form state
	const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
	const [amountDollars, setAmountDollars] = useState('')
	const [reason, setReason] = useState('')
	const [customReason, setCustomReason] = useState('')
	const [error, setError] = useState<string | null>(null)

	// API mutation
	const refundPayment = useRefundPayment()

	// Calculate refundable amount
	const refundableAmountCents = payment
		? payment.amountCents - payment.refundedAmountCents
		: 0

	// Calculate actual refund amount
	const refundAmountCents =
		refundType === 'full'
			? refundableAmountCents
			: Math.round(parseFloat(amountDollars || '0') * 100)

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

	// Reset form when modal opens or payment changes
	useEffect(() => {
		if (isOpen && payment) {
			setRefundType('full')
			setAmountDollars((refundableAmountCents / 100).toFixed(2))
			setReason('')
			setCustomReason('')
			setError(null)
		}
	}, [isOpen, payment, refundableAmountCents])

	// Update amount when refund type changes
	useEffect(() => {
		if (refundType === 'full') {
			setAmountDollars((refundableAmountCents / 100).toFixed(2))
		}
	}, [refundType, refundableAmountCents])

	/**
	 * Validate and submit the refund.
	 */
	const handleSubmit = async () => {
		if (!payment) return
		setError(null)

		// Validate amount
		if (!refundAmountCents || refundAmountCents <= 0) {
			setError('Please enter a valid refund amount.')
			return
		}

		if (refundAmountCents > refundableAmountCents) {
			setError(`Refund cannot exceed ${formatAmountCents(refundableAmountCents, payment.currency)}.`)
			return
		}

		// Validate reason
		const finalReason = reason === 'Other' ? customReason.trim() : reason
		if (!finalReason) {
			setError('Please provide a reason for the refund.')
			return
		}

		try {
			const request: RefundRequest = {
				amountCents: refundAmountCents,
				reason: finalReason,
			}

			const updatedPayment = await refundPayment.mutateAsync({
				paymentId: payment.id,
				request,
			})
			onSuccess?.(updatedPayment)
			onClose()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to process refund. Please try again.')
		}
	}

	if (!payment) return null

	return (
		<dialog ref={modalRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
			<div className="modal-box">
				{/* Header */}
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-bold">Process Refund</h3>
					<button className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Close">
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Payment Info */}
				<div className="mb-6 rounded-lg bg-base-200 p-4">
					<div className="flex items-center justify-between">
						<div>
							<span className="text-sm text-base-content/70">Original Payment</span>
							<p className="font-semibold">
								{formatAmountCents(payment.amountCents, payment.currency)}
							</p>
						</div>
						<PaymentStatusBadge status={payment.status} />
					</div>
					{payment.refundedAmountCents > 0 && (
						<div className="mt-2 border-t border-base-content/10 pt-2">
							<div className="flex justify-between text-sm">
								<span className="text-base-content/70">Already Refunded</span>
								<span className="text-warning">
									-{formatAmountCents(payment.refundedAmountCents, payment.currency)}
								</span>
							</div>
							<div className="flex justify-between text-sm font-medium">
								<span>Available for Refund</span>
								<span>{formatAmountCents(refundableAmountCents, payment.currency)}</span>
							</div>
						</div>
					)}
				</div>

				{/* Refund Type Selection */}
				<div className="mb-4">
					<label className="label">
						<span className="label-text font-medium">Refund Amount</span>
					</label>
					<div className="flex gap-2">
						<button
							type="button"
							className={`btn flex-1 ${refundType === 'full' ? 'btn-primary' : 'btn-outline'}`}
							onClick={() => setRefundType('full')}
						>
							Full Refund
						</button>
						<button
							type="button"
							className={`btn flex-1 ${refundType === 'partial' ? 'btn-primary' : 'btn-outline'}`}
							onClick={() => setRefundType('partial')}
						>
							Partial Refund
						</button>
					</div>
				</div>

				{/* Amount Input (for partial) */}
				{refundType === 'partial' && (
					<div className="form-control mb-4">
						<label className="input input-bordered flex items-center gap-2">
							<span className="text-base-content/60">$</span>
							<input
								type="number"
								className="grow"
								placeholder="0.00"
								step="0.01"
								min="0.01"
								max={refundableAmountCents / 100}
								value={amountDollars}
								onChange={(e) => setAmountDollars(e.target.value)}
							/>
						</label>
						{/* Quick amount buttons */}
						<div className="mt-2 flex gap-2">
							{[25, 50, 75].map((percent) => {
								const quickAmount = Math.round(refundableAmountCents * (percent / 100))
								return (
									<button
										key={percent}
										type="button"
										className="btn btn-ghost btn-xs"
										onClick={() => setAmountDollars((quickAmount / 100).toFixed(2))}
									>
										{percent}%
									</button>
								)
							})}
						</div>
					</div>
				)}

				{/* Refund Reason */}
				<div className="form-control mb-4">
					<label className="label">
						<span className="label-text font-medium">
							Reason <span className="text-error">*</span>
						</span>
					</label>
					<select
						className="select select-bordered"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					>
						<option value="">Select a reason...</option>
						{COMMON_REASONS.map((r) => (
							<option key={r} value={r}>
								{r}
							</option>
						))}
					</select>
				</div>

				{/* Custom Reason (if "Other" selected) */}
				{reason === 'Other' && (
					<div className="form-control mb-4">
						<textarea
							className="textarea textarea-bordered"
							placeholder="Please specify the reason..."
							rows={2}
							value={customReason}
							onChange={(e) => setCustomReason(e.target.value)}
						/>
					</div>
				)}

				{/* Warning */}
				<div className="alert mb-4">
					<AlertCircle className="h-4 w-4" />
					<span className="text-sm">
						Refunds are processed immediately and cannot be undone. The customer will receive
						the refund within 5-10 business days.
					</span>
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
					<button className="btn btn-ghost" onClick={onClose} disabled={refundPayment.isPending}>
						Cancel
					</button>
					<button
						className="btn btn-error"
						onClick={handleSubmit}
						disabled={refundPayment.isPending || refundAmountCents <= 0 || !reason}
					>
						{refundPayment.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<RefreshCcw className="h-4 w-4" />
								Refund {formatAmountCents(refundAmountCents, payment.currency)}
							</>
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

export default RefundModal
