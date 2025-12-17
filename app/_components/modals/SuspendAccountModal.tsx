/**
 * SuspendAccountModal Component
 * 
 * Admin-only modal for suspending user accounts with required reason (Phase 1).
 * 
 * **Business Logic:**
 * - Admin must provide suspension reason
 * - Reason stored for audit trail
 * - User immediately cannot login
 * - Reason displayed to user when they attempt login
 * 
 * **UX Pattern:**
 * - Clear action confirmation
 * - Required reason field (max 500 chars)
 * - Warning about immediate effect
 * - Submit button disabled until reason provided
 * 
 * **MAANG Principle:**
 * - Forced accountability (reason required)
 * - Audit trail (reason logged)
 * - Clear consequences (user cannot login)
 * - Reversible action (can reactivate)
 * 
 * @example
 * ```tsx
 * <SuspendAccountModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={async (reason) => {
 *     await API.Accounts.suspend(userId, reason);
 *   }}
 *   accountName="John Doe"
 * />
 * ```
 * 
 * @module SuspendAccountModal
 */

'use client'

import { useState, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'

import Modal from '@_components/ui/Modal'
import Button from '@_components/ui/Button'
import FormTextArea from '@_components/forms/FormTextArea'

import { notificationService } from '@_shared'
import { logger } from '@_core'

/**
 * Props for SuspendAccountModal component
 */
interface SuspendAccountModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback when modal is closed */
	onClose: () => void
	/** Callback when suspend is confirmed with reason */
	onConfirm: (reason: string) => Promise<void>
	/** Full name of account being suspended (for display) */
	accountName: string
}

const MAX_REASON_LENGTH = 500

/**
 * SuspendAccountModal Component
 * 
 * Displays confirmation modal for suspending a user account.
 * Requires admin to provide reason for audit and user notification.
 * 
 * **Features:**
 * - Required reason field (max 500 chars)
 * - Character count display
 * - Loading states during submission
 * - Validation (min 5 chars)
 * - Error handling
 * - Success feedback
 * 
 * **Accessibility:**
 * - Modal traps focus
 * - Clear labels
 * - Keyboard navigable
 * - Submit disabled when invalid
 */
export default function SuspendAccountModal({
	isOpen,
	onClose,
	onConfirm,
	accountName,
}: SuspendAccountModalProps) {
	const [reason, setReason] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	/**
	 * Handle form submission
	 */
	const handleConfirm = useCallback(async () => {
		const trimmedReason = reason.trim()

		// Validation
		if (!trimmedReason) {
			notificationService.error('Please provide a reason for suspension')
			return
		}

		if (trimmedReason.length < 5) {
			notificationService.error('Reason must be at least 5 characters')
			return
		}

		if (trimmedReason.length > MAX_REASON_LENGTH) {
			notificationService.error(`Reason cannot exceed ${MAX_REASON_LENGTH} characters`)
			return
		}

		setIsSubmitting(true)
		try {
			await onConfirm(trimmedReason)
			
			logger.info('Account suspended', {
				component: 'SuspendAccountModal',
				accountName,
				reasonLength: trimmedReason.length,
			})

			// Success handled by parent component
			// Reset and close
			setReason('')
			onClose()
		} catch (error) {
			logger.error('Failed to suspend account', {
				error,
				component: 'SuspendAccountModal',
				accountName,
			})
			notificationService.error('Failed to suspend account. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}, [reason, onConfirm, onClose, accountName])

	/**
	 * Handle modal close (reset state)
	 */
	const handleClose = useCallback(() => {
		if (!isSubmitting) {
			setReason('')
			onClose()
		}
	}, [isSubmitting, onClose])

	const isReasonValid = reason.trim().length >= 5 && reason.trim().length <= MAX_REASON_LENGTH
	const remainingChars = MAX_REASON_LENGTH - reason.length

	return (
		<Modal isOpen={isOpen} onClose={handleClose}>
			<div className="p-6">
				{/* Header with Warning Icon */}
				<div className="flex items-start gap-3 mb-4">
					<div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
						<AlertTriangle className="w-6 h-6 text-warning" aria-hidden="true" />
					</div>
					<div className="flex-1">
						<h2 className="text-xl font-bold text-base-content">
							Suspend Account
						</h2>
						<p className="text-sm text-base-content/60 mt-1">
							This is a serious action that requires justification
						</p>
					</div>
				</div>

				{/* Warning Message */}
				<div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
					<p className="text-sm text-base-content">
						You are about to suspend the account for{' '}
						<strong className="font-semibold">{accountName}</strong>.
					</p>
					<ul className="text-xs text-base-content/70 mt-2 space-y-1">
						<li>• User will be immediately logged out</li>
						<li>• User cannot log in until reactivated</li>
						<li>• Suspension reason will be shown to user</li>
						<li>• Action logged for audit purposes</li>
					</ul>
				</div>

				{/* Reason Input */}
				<div className="mb-6">
					<label className="label">
						<span className="label-text font-semibold">
							Reason for Suspension <span className="text-error">*</span>
						</span>
						<span className="label-text-alt">
							{remainingChars} chars remaining
						</span>
					</label>
					<FormTextArea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="e.g., Policy violation: spam activity detected, ToS violation: abusive behavior, etc."
						disabled={isSubmitting}
						rows={4}
						maxLength={MAX_REASON_LENGTH}
					/>
					<p className="text-xs text-base-content/50 mt-1">
						This reason will be stored in the audit log and shown to the user.
						Minimum 5 characters required.
					</p>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-2">
					<Button
						variant="ghost"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						variant="error"
						onClick={handleConfirm}
						disabled={isSubmitting || !isReasonValid}
						loading={isSubmitting}
					>
						{isSubmitting ? 'Suspending...' : 'Suspend Account'}
					</Button>
				</div>
			</div>
		</Modal>
	)
}

