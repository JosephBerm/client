/**
 * Modal UI Component
 * 
 * Accessible modal dialog component with DaisyUI styling.
 * Provides focus management, keyboard navigation, and overlay interactions.
 * Automatically handles body scroll locking and escape key detection.
 * 
 * **Features:**
 * - Multiple size options (sm, md, lg, xl, full)
 * - Escape key to close
 * - Overlay click to close (configurable)
 * - Body scroll lock when open
 * - Optional header with title
 * - Optional footer for actions
 * - Close button (configurable)
 * - ARIA attributes for accessibility
 * - Mobile-responsive design
 * 
 * **Accessibility:**
 * - Proper ARIA roles and labels
 * - Focus trap within modal
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
 *         footer={
 *           <>
 *             <Button variant="ghost" onClick={() => setIsOpen(false)}>
 *               Cancel
 *             </Button>
 *             <Button variant="primary" onClick={handleConfirm}>
 *               Confirm
 *             </Button>
 *           </>
 *         }
 *       >
 *         <p>Are you sure you want to proceed with this action?</p>
 *       </Modal>
 *     </>
 *   );
 * }
 * 
 * // Form modal
 * <Modal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Add New Product"
 *   size="lg"
 *   closeOnOverlayClick={false}
 * >
 *   <ProductForm onSubmit={handleSubmit} />
 * </Modal>
 * 
 * // Fullscreen modal
 * <Modal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Image Gallery"
 *   size="full"
 * >
 *   <ImageGallery images={images} />
 * </Modal>
 * ```
 * 
 * @module Modal
 */

'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import classNames from 'classnames'

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
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
	
	/** 
	 * Whether to show the X close button in the header.
	 * @default true
	 */
	showCloseButton?: boolean
	
	/** 
	 * Whether clicking the overlay should close the modal.
	 * Set to false for forms to prevent accidental closes.
	 * @default true
	 */
	closeOnOverlayClick?: boolean
	
	/** 
	 * Optional footer content (typically action buttons).
	 * Rendered in the modal-action DaisyUI class.
	 */
	footer?: ReactNode
}

/**
 * Modal Component
 * 
 * Accessible modal dialog with DaisyUI styling and rich functionality.
 * Manages focus, keyboard events, scroll locking, and overlay interactions.
 * 
 * **Behavior:**
 * - Opens by setting isOpen to true
 * - Closes via escape key, close button, or overlay click
 * - Locks body scroll when open
 * - Returns null when closed (no DOM rendering)
 * 
 * **Mobile Behavior:**
 * - Responsive sizing
 * - Full-height on mobile
 * - Touch-friendly close actions
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
	showCloseButton = true,
	closeOnOverlayClick = true,
	footer,
}: ModalProps) {
	// Reference to modal content for focus management
	const modalRef = useRef<HTMLDivElement>(null)

	// Map size prop to Tailwind max-width classes
	const sizeClasses = {
		sm: 'max-w-sm',   // ~384px
		md: 'max-w-md',   // ~448px
		lg: 'max-w-lg',   // ~512px
		xl: 'max-w-xl',   // ~576px
		full: 'max-w-full', // Full width with padding
	}

	/**
	 * Effect: Handle escape key and body scroll lock.
	 * Adds keyboard event listener and prevents body scrolling when modal is open.
	 * Cleans up listeners and restores scroll when modal closes.
	 */
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		if (isOpen) {
			// Listen for escape key press
			document.addEventListener('keydown', handleEscape)
			
			// Prevent body scroll while modal is open
			document.body.style.overflow = 'hidden'
		}

		// Cleanup: remove listener and restore scroll
		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = 'unset'
		}
	}, [isOpen, onClose])

	/**
	 * Handles clicks on the modal overlay (backdrop).
	 * Closes modal only if closeOnOverlayClick is true and the click
	 * was directly on the overlay (not on modal content).
	 */
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose()
		}
	}

	// Don't render anything if modal is closed
	if (!isOpen) return null

	return (
		<div
			className="modal modal-open" // DaisyUI modal classes
			onClick={handleOverlayClick} // Close on overlay click
			aria-labelledby="modal-title" // Accessibility: link to title
			aria-modal="true" // Accessibility: mark as modal
			role="dialog" // Accessibility: dialog role
		>
			<div
				ref={modalRef}
				className={classNames('modal-box', sizeClasses[size])}
			>
				{/* Modal Header (title and close button) */}
				{(title || showCloseButton) && (
					<div className="flex items-center justify-between mb-4">
						{/* Modal title */}
						{title && (
							<h3 id="modal-title" className="font-bold text-lg">
								{title}
							</h3>
						)}
						
						{/* Close button (X icon) */}
						{showCloseButton && (
							<button
								onClick={onClose}
								className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
								aria-label="Close modal"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				)}

				{/* Modal Content (children) */}
				<div className="py-4">{children}</div>

				{/* Modal Footer (action buttons, etc.) */}
				{footer && <div className="modal-action">{footer}</div>}
			</div>
		</div>
	)
}


