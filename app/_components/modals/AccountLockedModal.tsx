/**
 * AccountLockedModal Component
 *
 * Modal displayed when a user's account is temporarily locked due to
 * multiple failed login attempts (Phase 1: Account Status System).
 *
 * **Business Logic:**
 * - Account locks after 5 failed login attempts
 * - 30-minute automatic lockout period
 * - User can reset password to bypass lockout
 * - Prevents brute force attacks
 *
 * **UX Pattern:**
 * - Clear explanation of what happened
 * - Estimated unlock time
 * - Alternative action (reset password)
 * - Link to support if needed
 *
 * **MAANG Principle:**
 * - Defensive UX: Clear error state without blaming user
 * - Self-service: Password reset as immediate resolution
 * - Transparency: Show lockout reason and duration
 *
 * @example
 * ```tsx
 * <AccountLockedModal
 *   isOpen={showLockoutModal}
 *   onClose={() => setShowLockoutModal(false)}
 *   lockedUntil={new Date(Date.now() + 30 * 60 * 1000)}
 * />
 * ```
 *
 * @module AccountLockedModal
 */

'use client'

import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

import { Routes } from '@_features/navigation'

import Modal from '@_components/ui/Modal'
import Button from '@_components/ui/Button'
import Surface from '@_components/ui/Surface'

/**
 * Props for AccountLockedModal component
 */
interface AccountLockedModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback when modal is closed */
	onClose: () => void
	/** Optional timestamp when account will be unlocked (for countdown) */
	lockedUntil?: Date | string | null
}

/**
 * AccountLockedModal Component
 *
 * Displays when user attempts to login with a locked account.
 * Provides clear explanation and resolution paths.
 *
 * **Security Features:**
 * - Explains lockout reason (5 failed attempts)
 * - Shows duration (30 minutes)
 * - Offers password reset as resolution
 * - Links to support for assistance
 *
 * **Accessibility:**
 * - Modal traps focus
 * - Clear heading for screen readers
 * - Keyboard navigable (Escape to close)
 * - High contrast colors
 */
export default function AccountLockedModal({ isOpen, onClose, lockedUntil }: AccountLockedModalProps) {
	const router = useRouter()

	/**
	 * Navigate to password reset page
	 */
	const handleResetPassword = () => {
		onClose()
		router.push(Routes.Auth.forgotPassword)
	}

	/**
	 * Navigate to contact/support page
	 */
	const handleContactSupport = () => {
		onClose()
		router.push(Routes.Contact.location)
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}>
			<div className='text-center p-6'>
				{/* Lock Icon */}
				<div className='mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4'>
					<Lock
						className='w-8 h-8 text-error'
						aria-hidden='true'
					/>
				</div>

				{/* Title */}
				<h2 className='text-xl font-bold text-base-content mb-2'>Account Temporarily Locked</h2>

				{/* Message */}
				<p className='text-base-content/70 mb-4'>
					Your account has been temporarily locked due to too many failed login attempts.
				</p>

				{/* Details Card */}
				<Surface variant='inset' padding='md' className='mb-6 text-left'>
					<h3 className='font-semibold mb-2'>What happened?</h3>
					<ul className='text-sm text-base-content/70 space-y-1'>
						<li>• 5 incorrect password attempts detected</li>
						<li>• Account locked for 30 minutes for security</li>
						<li>• This protects your account from unauthorized access</li>
					</ul>
				</Surface>

				{/* Lockout Duration */}
				{lockedUntil && (
					<div className='mb-6'>
						<p className='text-sm text-base-content/60'>
							Try again in approximately <span className='font-semibold'>30 minutes</span>
						</p>
					</div>
				)}

				{/* Actions */}
				<div className='flex flex-col gap-2'>
					<Button
						variant='primary'
						onClick={handleResetPassword}>
						Reset Password Instead
					</Button>
					<Button
						variant='ghost'
						onClick={onClose}>
						I'll Wait
					</Button>
				</div>

				{/* Support Link */}
				<p className='text-xs text-base-content/50 mt-4'>
					Need help?{' '}
					<Button
						onClick={handleContactSupport}
						variant='ghost'
						size='xs'
						className='text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded h-auto p-0'>
						Contact Support
					</Button>
				</p>
			</div>
		</Modal>
	)
}
