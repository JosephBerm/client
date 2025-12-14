/**
 * Modal UI Component
 * 
 * MAANG-level accessible modal dialog with Framer Motion animations.
 * Provides focus management, keyboard navigation, and overlay interactions.
 * 
 * **Portal Rendering:**
 * Uses React Portal to render at document.body, ensuring modals are never
 * clipped by parent containers with overflow:hidden. Essential for modals
 * triggered from table actions, cards, or other constrained containers.
 * 
 * **Animation System:**
 * - Spring physics for natural, organic feel (Apple, Linear, Notion standard)
 * - AnimatePresence for smooth exit animations
 * - Respects prefers-reduced-motion and data-reduced-motion
 * - Separate backdrop/content animations for depth perception
 * 
 * **Features:**
 * - Portal rendering (escapes container overflow constraints)
 * - Multiple size options (sm, md, lg, xl, full, 2xl, 4xl)
 * - Escape key to close (configurable)
 * - Overlay click to close (configurable)
 * - Body scroll lock when open
 * - Optional header with title
 * - ARIA attributes for accessibility
 * - Mobile-first responsive design
 * - Focus trap and restoration
 * - SSR-safe (only renders portal after hydration)
 * 
 * **Accessibility:**
 * - Proper ARIA roles and labels
 * - Focus management (stores and restores previous focus)
 * - Keyboard navigation (Escape to close)
 * - Screen reader announcements
 * - Respects reduced motion preferences
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

import type { ReactNode, KeyboardEvent } from 'react'
import { useRef, useCallback, useState, useEffect, useMemo } from 'react'

import { createPortal } from 'react-dom'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { useModal } from '@_shared'

import {
	checkReducedMotion,
	REDUCED_MOTION_VARIANTS,
	MODAL_ANIMATION,
} from '@_components/common/animations'

// ============================================================================
// TYPES
// ============================================================================

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
	 * Mobile-first: All sizes are full-width on mobile (< 640px)
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

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Size to Tailwind max-width class mapping
 * Mobile-first: All modals are full-width on mobile, constrained on larger screens
 */
const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
	sm: 'sm:max-w-sm',     // ~384px on sm+
	md: 'sm:max-w-md',     // ~448px on sm+
	lg: 'sm:max-w-lg',     // ~512px on sm+
	xl: 'sm:max-w-xl',     // ~576px on sm+
	'2xl': 'sm:max-w-2xl', // ~672px on sm+
	'4xl': 'sm:max-w-4xl', // ~896px on sm+
	full: 'sm:max-w-full', // Full width with padding
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Modal Component
 * 
 * Accessible modal dialog with rich functionality following MAANG best practices.
 * Manages focus, keyboard events, scroll locking, and overlay interactions.
 * 
 * **Behavior:**
 * - Opens by setting isOpen to true
 * - Closes via escape key, close button, or overlay click
 * - Locks body scroll when open
 * - Stores and restores focus when opening/closing
 * - Animates in/out with spring physics
 * 
 * @param props - Modal configuration props
 * @returns Modal component or null if closed/unmounted
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
	
	// SSR-safe portal mounting state
	const [isMounted, setIsMounted] = useState(false)
	
	// Reduced motion preference state
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
	
	// Mount effect for SSR safety
	useEffect(() => {
		setIsMounted(true)
	}, [])
	
	// Reduced motion detection with system preference + user override
	useEffect(() => {
		if (typeof window === 'undefined') return
		
		// Initial check
		setPrefersReducedMotion(checkReducedMotion())
		
		// Listen to system preference changes
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => setPrefersReducedMotion(checkReducedMotion())
		
		// Listen to user override changes (data-reduced-motion attribute)
		const observer = new MutationObserver(handleChange)
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-reduced-motion'],
		})
		
		mediaQuery.addEventListener('change', handleChange)
		
		return () => {
			mediaQuery.removeEventListener('change', handleChange)
			observer.disconnect()
		}
	}, [])

	// Animation variants - memoized for performance
	const backdropVariants = useMemo(() => {
		if (prefersReducedMotion) {
			return {
				hidden: { opacity: 0 },
				visible: { opacity: 1, transition: { duration: 0.001 } },
				exit: { opacity: 0, transition: { duration: 0.001 } },
			}
		}
		
		return {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: MODAL_ANIMATION.backdrop,
			},
			exit: {
				opacity: 0,
				transition: MODAL_ANIMATION.backdrop,
			},
		}
	}, [prefersReducedMotion])
	
	const contentVariants = useMemo(() => {
		if (prefersReducedMotion) {
			return REDUCED_MOTION_VARIANTS
		}
		
		return {
			hidden: {
				opacity: 0,
				scale: MODAL_ANIMATION.distance.scale,
				y: MODAL_ANIMATION.distance.y,
			},
			visible: {
				opacity: 1,
				scale: 1,
				y: 0,
				transition: MODAL_ANIMATION.content.spring,
			},
			exit: {
				opacity: 0,
				scale: MODAL_ANIMATION.distance.scale,
				y: MODAL_ANIMATION.distance.y,
				transition: MODAL_ANIMATION.content.exit,
			},
		}
	}, [prefersReducedMotion])

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

	// Event handlers
	const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (closeOnOverlayClick && e.target === e.currentTarget) {
			onClose()
		}
	}, [closeOnOverlayClick, onClose])

	const handleOverlayKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
		if (closeOnOverlayClick && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault()
			onClose()
		}
	}, [closeOnOverlayClick, onClose])

	const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
	}, [])

	// Don't render portal until mounted (SSR-safe)
	if (!isMounted) return null

	// Portal renders modal at document.body to escape container overflow constraints
	return createPortal(
		<AnimatePresence mode="wait">
			{isOpen && (
				<div
					className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={title ? 'modal-title' : undefined}
				>
					{/* Backdrop Overlay */}
					<motion.div
						key="modal-backdrop"
						variants={backdropVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
						onClick={handleOverlayClick}
						onKeyDown={handleOverlayKeyDown}
						role={closeOnOverlayClick ? 'button' : 'presentation'}
						tabIndex={closeOnOverlayClick ? -1 : undefined}
						aria-label={closeOnOverlayClick ? 'Close modal' : undefined}
						aria-hidden={closeOnOverlayClick ? 'false' : 'true'}
					/>

					{/* Modal Content */}
					{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
					<motion.div
						ref={modalRef}
						key="modal-content"
						variants={contentVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className={`
							relative z-10 
							bg-base-100 
							w-full ${SIZE_CLASSES[size]}
							max-h-dvh sm:max-h-[90vh]
							rounded-t-2xl sm:rounded-2xl
							shadow-2xl
							overflow-hidden 
							flex flex-col 
							focus:outline-none
						`}
						onClick={handleContentClick}
						role="dialog"
						tabIndex={-1}
					>
						{/* Header */}
						{title && (
							<div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-base-300 shrink-0">
								<h2 
									id="modal-title" 
									className="text-lg sm:text-xl md:text-2xl font-bold text-base-content leading-tight"
								>
									{title}
								</h2>
								<button
									ref={closeButtonRef}
									onClick={onClose}
									className="
										btn btn-ghost btn-sm btn-circle 
										hover:bg-base-200
										focus:outline-2 focus:outline-offset-2 focus:outline-primary
										transition-colors duration-150
									"
									aria-label="Close modal"
								>
									<X size={20} />
								</button>
							</div>
						)}

						{/* Content - Scrollable */}
						<div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 overscroll-contain">
							{children}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	)
}
