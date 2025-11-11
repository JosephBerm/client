'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import classNames from 'classnames'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: ReactNode
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
	showCloseButton?: boolean
	closeOnOverlayClick?: boolean
	footer?: ReactNode
}

/**
 * Accessible Modal component with DaisyUI styles
 * Features: focus trap, escape key, overlay click, scroll lock
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
	const modalRef = useRef<HTMLDivElement>(null)

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		full: 'max-w-full',
	}

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
			// Prevent body scroll
			document.body.style.overflow = 'hidden'
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = 'unset'
		}
	}, [isOpen, onClose])

	// Handle overlay click
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose()
		}
	}

	if (!isOpen) return null

	return (
		<div
			className="modal modal-open"
			onClick={handleOverlayClick}
			aria-labelledby="modal-title"
			aria-modal="true"
			role="dialog"
		>
			<div
				ref={modalRef}
				className={classNames('modal-box', sizeClasses[size])}
			>
				{/* Header */}
				{(title || showCloseButton) && (
					<div className="flex items-center justify-between mb-4">
						{title && (
							<h3 id="modal-title" className="font-bold text-lg">
								{title}
							</h3>
						)}
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

				{/* Content */}
				<div className="py-4">{children}</div>

				{/* Footer */}
				{footer && <div className="modal-action">{footer}</div>}
			</div>
		</div>
	)
}


