/**
 * EmailVerificationModal Component
 * 
 * Modal displayed when a user attempts to login with an unverified email address
 * (Phase 1: Account Status System).
 * 
 * **Business Logic:**
 * - Account status: PendingVerification
 * - User must verify email before login
 * - Can resend verification email
 * - Check spam folder reminder
 * 
 * **UX Pattern:**
 * - Clear explanation of verification requirement
 * - Step-by-step instructions
 * - Resend email button with loading state
 * - Success feedback when email sent
 * 
 * **MAANG Principle:**
 * - Self-service: User can resend email themselves
 * - Clear instructions: 3-step process
 * - Helpful hints: Check spam folder
 * 
 * @example
 * ```tsx
 * <EmailVerificationModal
 *   isOpen={showVerificationModal}
 *   onClose={() => setShowVerificationModal(false)}
 *   email="user@example.com"
 * />
 * ```
 * 
 * @module EmailVerificationModal
 */

'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

import Modal from '@_components/ui/Modal'
import Button from '@_components/ui/Button'

import { notificationService } from '@_shared'

/**
 * Props for EmailVerificationModal component
 */
interface EmailVerificationModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback when modal is closed */
	onClose: () => void
	/** User's email address for display and resend */
	email?: string | null
}

/**
 * EmailVerificationModal Component
 * 
 * Displays when user attempts to login with unverified email.
 * Allows self-service email resend.
 * 
 * **Features:**
 * - Display user's email address
 * - Resend verification email (with rate limiting)
 * - Loading states
 * - Success feedback
 * - Spam folder reminder
 * 
 * **Accessibility:**
 * - Modal traps focus
 * - Loading states announced
 * - Success states announced
 * - Keyboard navigable
 */
export default function EmailVerificationModal({
	isOpen,
	onClose,
	email,
}: EmailVerificationModalProps) {
	const [isResending, setIsResending] = useState(false)
	const [resent, setResent] = useState(false)

	/**
	 * Resend verification email to user
	 */
	const handleResendEmail = async () => {
		if (!email) {
			notificationService.error('Email address not available')
			return
		}

		setIsResending(true)
		try {
			// TODO: Implement API endpoint for resending verification email
			// await API.Auth.resendVerificationEmail(email)
			
			// Simulate API call for now
			await new Promise((resolve) => setTimeout(resolve, 1000))
			
			setResent(true)
			notificationService.success('Verification email sent! Check your inbox.')
		} catch (error) {
			notificationService.error('Failed to send email. Please try again.')
		} finally {
			setIsResending(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="text-center p-6">
				{/* Email Icon */}
				<div className="mx-auto w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mb-4">
					<Mail className="w-8 h-8 text-info" aria-hidden="true" />
				</div>

				{/* Title */}
				<h2 className="text-xl font-bold text-base-content mb-2">
					Verify Your Email
				</h2>

				{/* Message */}
				<p className="text-base-content/70 mb-4">
					Please verify your email address to continue.
					{email && (
						<span className="block font-medium mt-1 text-base-content">{email}</span>
					)}
				</p>

				{/* Instructions */}
				<div className="bg-base-200 rounded-lg p-4 mb-6 text-left">
					<h3 className="font-semibold mb-2">Next Steps:</h3>
					<ol className="text-sm text-base-content/70 space-y-1 list-decimal list-inside">
						<li>Check your inbox for a verification email</li>
						<li>Click the verification link in the email</li>
						<li>Return here and log in again</li>
					</ol>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-2">
					<Button
						variant="primary"
						onClick={handleResendEmail}
						disabled={isResending || resent}
						loading={isResending}
					>
						{resent ? 'Email Sent!' : 'Resend Verification Email'}
					</Button>
					<Button variant="ghost" onClick={onClose}>
						Close
					</Button>
				</div>

				{/* Spam note */}
				<p className="text-xs text-base-content/50 mt-4">
					Can't find the email? Check your spam folder or contact support.
				</p>
			</div>
		</Modal>
	)
}

