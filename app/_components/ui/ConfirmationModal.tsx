/**
 * ConfirmationModal Component
 * 
 * MAANG-level confirmation dialog for destructive or important actions.
 * Follows best practices for user experience and accessibility.
 * 
 * **Features:**
 * - Multiple variants (danger, warning, info)
 * - Customizable title, message, and button text
 * - Loading state support
 * - Proper focus management
 * - Keyboard accessibility
 * - Responsive design
 * 
 * **Use Cases:**
 * - Delete confirmations
 * - Role/status changes
 * - Account deactivation
 * - Data loss warnings
 * 
 * @example
 * ```tsx
 * import ConfirmationModal from '@_components/ui/ConfirmationModal';
 * 
 * <ConfirmationModal
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Account"
 *   message="Are you sure you want to delete this account? This action cannot be undone."
 *   variant="danger"
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   isLoading={isDeleting}
 * />
 * ```
 * 
 * @module ConfirmationModal
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'

import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

import Button from './Button'
import Modal from './Modal'

// ============================================================================
// TYPES
// ============================================================================

export type ConfirmationVariant = 'danger' | 'warning' | 'info'

export interface ConfirmationModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Handler called when modal should close */
	onClose: () => void
	/** Handler called when user confirms */
	onConfirm: () => void | Promise<void>
	/** Modal title */
	title: string
	/** Modal message/description */
	message: string
	/** Visual variant */
	variant?: ConfirmationVariant
	/** Text for confirm button */
	confirmText?: string
	/** Text for cancel button */
	cancelText?: string
	/** Whether confirm action is in progress */
	isLoading?: boolean
	/** Additional details (shown in smaller text) */
	details?: string
}

// ============================================================================
// VARIANT CONFIG
// ============================================================================

const variantConfig: Record<ConfirmationVariant, {
	icon: typeof AlertTriangle
	iconColor: string
	iconBg: string
	confirmVariant: 'error' | 'accent' | 'primary'
}> = {
	danger: {
		icon: AlertTriangle,
		iconColor: 'text-error',
		iconBg: 'bg-error/10',
		confirmVariant: 'error',
	},
	warning: {
		icon: AlertCircle,
		iconColor: 'text-warning',
		iconBg: 'bg-warning/10',
		confirmVariant: 'accent', // Use accent as warning alternative
	},
	info: {
		icon: Info,
		iconColor: 'text-info',
		iconBg: 'bg-info/10',
		confirmVariant: 'primary',
	},
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ConfirmationModal Component
 * 
 * Displays a confirmation dialog before performing important actions.
 * Automatically focuses the cancel button for safety.
 */
export default function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	variant = 'danger',
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	isLoading = false,
	details,
}: ConfirmationModalProps) {
	const cancelRef = useRef<HTMLButtonElement>(null)
	const config = variantConfig[variant]
	const Icon = config.icon

	// Focus cancel button when modal opens (safer default)
	useEffect(() => {
		if (isOpen && cancelRef.current) {
			setTimeout(() => cancelRef.current?.focus(), 100)
		}
	}, [isOpen])

	const handleConfirm = useCallback(async () => {
		try {
			await onConfirm()
			onClose()
		} catch {
			// Error handling is expected to be done in onConfirm
		}
	}, [onConfirm, onClose])

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="sm"
			closeOnOverlayClick={!isLoading}
			closeOnEscape={!isLoading}
		>
			<div className="text-center sm:text-left">
				{/* Icon */}
				<div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full mb-4">
					<div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconBg}`}>
						<Icon className={`h-6 w-6 ${config.iconColor}`} />
					</div>
				</div>

				{/* Title */}
				<h3 className="text-lg font-semibold text-base-content mb-2">
					{title}
				</h3>

				{/* Message */}
				<p className="text-sm text-base-content/70 mb-4">
					{message}
				</p>

				{/* Details */}
				{details && (
					<div className="bg-base-200/50 rounded-lg p-3 mb-4">
						<p className="text-xs text-base-content/60">
							{details}
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
					<Button
						ref={cancelRef}
						variant="ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						variant={config.confirmVariant}
						onClick={() => void handleConfirm()}
						loading={isLoading}
						disabled={isLoading}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
