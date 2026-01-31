/**
 * AccountSuspendedModal Component
 * 
 * Modal displayed when a user's account has been suspended by an administrator
 * (Phase 1: Account Status System).
 * 
 * **Business Logic:**
 * - Admin suspends account with reason
 * - User cannot login until reactivated
 * - Must contact support to resolve
 * - Suspension is indefinite (admin action required)
 * 
 * **UX Pattern:**
 * - Clear explanation that admin action was taken
 * - Display suspension reason if available
 * - Primary CTA: Contact support
 * - Link to Terms of Service
 * 
 * **MAANG Principle:**
 * - Transparency: Clear about why account is suspended
 * - Support pathway: Direct link to contact support
 * - Context: Link to ToS for reference
 * 
 * @example
 * ```tsx
 * <AccountSuspendedModal
 *   isOpen={showSuspensionModal}
 *   onClose={() => setShowSuspensionModal(false)}
 *   reason="Policy violation: spam activity detected"
 * />
 * ```
 * 
 * @module AccountSuspendedModal
 */

'use client'

import { AlertTriangle } from 'lucide-react'

import Modal from '@_components/ui/Modal'
import Button from '@_components/ui/Button'
import Surface from '@_components/ui/Surface'

/**
 * Props for AccountSuspendedModal component
 */
interface AccountSuspendedModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Callback when modal is closed */
	onClose: () => void
	/** Optional reason for suspension provided by admin */
	reason?: string | null
}

/**
 * AccountSuspendedModal Component
 * 
 * Displays when user attempts to login with a suspended account.
 * Provides clear explanation and directs to support.
 * 
 * **Security Features:**
 * - Explains admin action was taken
 * - Shows suspension reason if available
 * - Directs to support for resolution
 * - References Terms of Service
 * 
 * **Accessibility:**
 * - Modal traps focus
 * - Warning icon with aria-hidden
 * - Keyboard navigable
 * - Clear heading hierarchy
 */
export default function AccountSuspendedModal({
	isOpen,
	onClose,
	reason,
}: AccountSuspendedModalProps) {
	/**
	 * Open email client to contact support
	 */
	const handleContactSupport = () => {
		window.location.href = 'mailto:support@medsourcepro.com?subject=Account Suspension Inquiry'
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="text-center p-6">
				{/* Warning Icon */}
				<div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
					<AlertTriangle
						className="w-8 h-8 text-warning"
						aria-hidden="true"
					/>
				</div>

				{/* Title */}
				<h2 className="text-xl font-bold text-base-content mb-2">
					Account Suspended
				</h2>

				{/* Message */}
				<p className="text-base-content/70 mb-4">
					Your account has been suspended by an administrator.
				</p>

				{/* Suspension Reason (if available) */}
				{reason && (
					<Surface variant='inset' padding='md' className='mb-6 text-left'>
						<h3 className="font-semibold mb-2">Reason:</h3>
						<p className="text-sm text-base-content/70">{reason}</p>
					</Surface>
				)}

				{/* What to do */}
				<Surface variant='inset' padding='md' className='mb-6 text-left'>
					<h3 className="font-semibold mb-2">What can you do?</h3>
					<ul className="text-sm text-base-content/70 space-y-1">
						<li>• Contact support to understand why your account was suspended</li>
						<li>• Review our Terms of Service</li>
						<li>• Request an account review if you believe this is an error</li>
					</ul>
				</Surface>

				{/* Actions */}
				<div className="flex flex-col gap-2">
					<Button variant="primary" onClick={handleContactSupport}>
						Contact Support
					</Button>
					<Button variant="ghost" onClick={onClose}>
						Close
					</Button>
				</div>

				{/* Terms Link */}
				<p className="text-xs text-base-content/50 mt-4">
					Review our{' '}
					<a
						href="/terms"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
					>
						Terms of Service
					</a>
				</p>
			</div>
		</Modal>
	)
}

