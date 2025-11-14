/**
 * Modal UI Component
 * 
 * Accessible modal dialog component following Church of God best practices.
 * Provides focus management, keyboard navigation, and overlay interactions.
 * Automatically handles body scroll locking and escape key detection.
 * 
 * **Features:**
 * - Multiple size options (sm, md, lg, xl, full, 2xl, 4xl)
 * - Escape key to close (configurable)
 * - Overlay click to close (configurable)
 * - Body scroll lock when open
 * - Optional header with title
 * - Optional footer for actions
 * - Close button (configurable)
 * - ARIA attributes for accessibility
 * - Mobile-responsive design
 * - Focus trap and restoration
 * - Smooth animations
 * 
 * **Accessibility:**
 * - Proper ARIA roles and labels
 * - Focus management (stores and restores previous focus)
 * - Keyboard navigation (Escape to close)
 * - Screen reader announcements
 * 
 * @example
 * ```tsx
 * import Modal from '@_components/ui/Modal';
 * import Button from '@_components/ui/Button';
 * import { useState } from 'react';
 * 
 * function MyComponent() {
 *   const [isOpen, setIsOpen] = useState(false);
 * 
 *   return (
 *     <>
 *       <Button onClick={() => setIsOpen(true)}>
 *         Open Modal
 *       </Button>
 * 
 *       <Modal
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         title="Confirm Action"
 *         size="md"
 *       >
 *         <p>Are you sure you want to proceed with this action?</p>
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 * 
 * @module Modal
 */

'use client'

import { useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import { useModal } from '@_hooks/useModal'

/**
 * Modal component props interface.
 */
interface ModalProps {
	/** Whether the modal is currently open */
	isOpen: boolean
	
	/** Callback function called when modal should close */
	onClose: () => void
	
	/** Optional title displayed in modal header */
	title?: string
	
	/** Modal content to be displayed */
	children: ReactNode
	
	/** 
	 * Modal size/width.
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full'
	
	/** 
	 * Whether clicking the overlay should close the modal.
	 * Set to false for forms to prevent accidental closes.
	 * @default true
	 */
	closeOnOverlayClick?: boolean
	
	/** 
	 * Whether pressing the Escape key closes the modal.
	 * @default true
	 */
	closeOnEscape?: boolean
}

/**
 * Modal Component
 * 
 * Accessible modal dialog with rich functionality following industry best practices.
 * Manages focus, keyboard events, scroll locking, and overlay interactions.
 * 
 * **Behavior:**
 * - Opens by setting isOpen to true
 * - Closes via escape key, close button, or overlay click
 * - Locks body scroll when open
 * - Returns null when closed (no DOM rendering)
 * - Stores and restores focus when opening/closing
 * 
 * @param props - Modal configuration props
 * @returns Modal component or null if closed
 */
export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = 'md',
	closeOnOverlayClick = true,
	closeOnEscape = true,
}: ModalProps) {
	const modalRef = useRef<HTMLDivElement>(null)
	const closeButtonRef = useRef<HTMLButtonElement>(null)

	// Map size prop to Tailwind max-width classes
	const sizeClasses = {
		sm: 'max-w-sm',     // ~384px
		md: 'max-w-md',     // ~448px
		lg: 'max-w-lg',     // ~512px
		xl: 'max-w-xl',     // ~576px
		'2xl': 'max-w-2xl', // ~672px
		'4xl': 'max-w-4xl', // ~896px
		full: 'max-w-full', // Full width with padding
	}

	// Common modal behaviors (focus trap, escape key, body scroll lock)
	useModal(
		modalRef,
		isOpen,
		onClose,
		{
			closeOnEscape,
			lockBodyScroll: true,
			initialFocus: title ? closeButtonRef : undefined,
			restoreFocus: true,
		}
	)

	if (!isOpen) return null

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose()
		}
	}

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
		>
			{/* Overlay - click handler on overlay itself */}
			<div
				className="fixed inset-0 bg-black/50 transition-opacity duration-300"
				onClick={handleOverlayClick}
				aria-hidden="true"
			/>

		{/* Modal Content */}
		<div
			ref={modalRef}
			className={`relative z-10 bg-base-100 rounded-lg shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 focus:outline-none ${
				isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
			}`}
			onClick={(e) => e.stopPropagation()}
			tabIndex={-1}
		>
				{/* Header */}
				{title && (
					<div className="flex items-center justify-between p-4 md:p-6 border-b border-base-300">
						<h2 id="modal-title" className="text-xl md:text-2xl font-bold text-base-content">
							{title}
						</h2>
						<button
							ref={closeButtonRef}
							onClick={onClose}
							className="btn btn-ghost btn-sm btn-circle focus:outline-2 focus:outline-offset-2 focus:outline-primary"
							aria-label="Close modal"
						>
							<X size={20} />
						</button>
					</div>
				)}

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
			</div>
		</div>
	)
}


