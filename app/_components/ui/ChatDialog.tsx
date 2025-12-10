/**
 * Chat Dialog Component
 * 
 * Professional, accessible chat dialog following industry best practices.
 * Inspired by Intercom, Drift, and Crisp - MAANG-level implementation.
 * 
 * **Features:**
 * - Portal rendering at document root for proper z-index stacking
 * - Smooth framer-motion animations (spring physics)
 * - Focus trap with keyboard navigation (Tab, Escape)
 * - Body scroll lock when open
 * - Backdrop overlay with click-to-close
 * - Reduced motion support (accessibility)
 * - Mobile: Full-screen dialog
 * - Desktop: Fixed bottom-right expandable window
 * - WCAG 2.1 AA compliant
 * 
 * **Industry Best Practices:**
 * - Portal rendering (proper z-index management)
 * - Focus management (trap and restoration)
 * - Smooth animations (60fps, GPU-accelerated)
 * - Accessibility-first design
 * - Performance optimized
 * 
 * @module components/ui/ChatDialog
 */

'use client'

import type { ReactNode, KeyboardEvent } from 'react'
import { useRef, useCallback, useEffect, useState, useMemo } from 'react'

import { createPortal } from 'react-dom'

import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { X, MessageCircle } from 'lucide-react'

import { useModal } from '@_shared'

import { checkReducedMotion, REDUCED_MOTION_VARIANTS } from '@_components/common/animations/types'
import Button from '@_components/ui/Button'

export interface ChatDialogProps {
	/** Whether the dialog is currently open */
	isOpen: boolean
	
	/** Callback function called when dialog should close */
	onClose: () => void
	
	/** Dialog content to be displayed */
	children: ReactNode
	
	/** Position on desktop (mobile is always full-screen) */
	position?: 'bottom-right' | 'bottom-left'
	
	/** 
	 * Whether clicking the backdrop should close the dialog.
	 * @default true
	 */
	closeOnBackdropClick?: boolean
	
	/** 
	 * Whether pressing the Escape key closes the dialog.
	 * @default true
	 */
	closeOnEscape?: boolean
	
	/** Custom title for the dialog (optional, uses "Live Chat" by default) */
	title?: string
}

/**
 * Chat Dialog Component
 * 
 * Professional chat dialog with portal rendering, smooth animations, and full accessibility.
 * 
 * **Behavior:**
 * - Portal renders at document.body for proper z-index stacking
 * - Mobile: Full-screen dialog (better UX on small screens)
 * - Desktop: Fixed bottom-right window (380-420px wide, max 600px tall)
 * - Smooth spring animations with reduced motion support
 * - Focus trap with keyboard navigation
 * - Body scroll lock when open
 * - Backdrop overlay with click-to-close
 * 
 * @example
 * ```tsx
 * <ChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <div>Chat content here</div>
 * </ChatDialog>
 * ```
 */
export default function ChatDialog({
	isOpen,
	onClose,
	children,
	position = 'bottom-right',
	closeOnBackdropClick = true,
	closeOnEscape = true,
	title = 'Live Chat',
}: ChatDialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null)
	const closeButtonRef = useRef<HTMLButtonElement>(null)
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
	const [isMounted, setIsMounted] = useState(false)

	// Check for reduced motion preference
	useEffect(() => {
		if (typeof window === 'undefined') {return}

		// Initial check
		setPrefersReducedMotion(checkReducedMotion())

		// Listen to system preference changes
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => {
			setPrefersReducedMotion(checkReducedMotion())
		}

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

	// Portal mounting check (SSR-safe)
	useEffect(() => {
		if (typeof window !== 'undefined' && document.body) {
			setIsMounted(true)
		}
	}, [])

	// Common modal behaviors (focus trap, escape key, body scroll lock)
	useModal(
		dialogRef,
		isOpen,
		onClose,
		{
			closeOnEscape,
			lockBodyScroll: true,
			initialFocus: closeButtonRef,
			restoreFocus: true,
		}
	)

	// Animation variants for dialog (desktop: slide up from bottom, mobile: scale)
	// Note: Using 'as const' for type safety with framer-motion Variants type
	// This ensures TypeScript infers tuple types for ease arrays and literal types for strings
	const dialogVariants = useMemo(() => {
		if (prefersReducedMotion) {
			return REDUCED_MOTION_VARIANTS
		}

		return {
			hidden: {
				opacity: 0,
				scale: 0.95,
				y: 20,
			},
			visible: {
				opacity: 1,
				scale: 1,
				y: 0,
				transition: {
					type: 'spring' as const,
					stiffness: 300,
					damping: 30,
					mass: 0.8,
				},
			},
			exit: {
				opacity: 0,
				scale: 0.95,
				y: 20,
				transition: {
					duration: 0.2,
					ease: [0.4, 0, 0.2, 1] as const,
				},
			},
		} as const
	}, [prefersReducedMotion])

	// Backdrop animation variants
	// Note: Using 'as const' for type safety with framer-motion Variants type
	const backdropVariants = useMemo(() => {
		if (prefersReducedMotion) {
			return {
				hidden: { opacity: 0 },
				visible: { opacity: 1, transition: { duration: 0.001 } },
				exit: { opacity: 0, transition: { duration: 0.001 } },
			} as const
		}

		return {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },
			},
			exit: {
				opacity: 0,
				transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },
			},
		} as const
	}, [prefersReducedMotion])

	// Event handlers
	const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		// Only close if clicking directly on backdrop (not child elements)
		if (closeOnBackdropClick && e.target === e.currentTarget) {
			e.preventDefault()
			e.stopPropagation()
			onClose()
		}
	}, [closeOnBackdropClick, onClose])

	const handleBackdropKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
		// Keyboard support for backdrop (Enter or Space to close when enabled)
		if (closeOnBackdropClick && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault()
			onClose()
		}
	}, [closeOnBackdropClick, onClose])

	const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		// Prevent click events from bubbling to backdrop (prevents accidental dialog close)
		e.stopPropagation()
	}, [])

	// Don't render if not mounted or document.body doesn't exist (SSR-safe)
	if (!isMounted || typeof document === 'undefined' || !document.body) {
		return null
	}

	return createPortal(
		<AnimatePresence mode="wait">
			{isOpen && (
				<>
					{/* Backdrop Overlay */}
					<motion.div
						key="backdrop"
						variants={backdropVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="fixed inset-0 bg-black/50"
						onClick={handleBackdropClick}
						onKeyDown={handleBackdropKeyDown}
						role={closeOnBackdropClick ? 'button' : 'presentation'}
						tabIndex={closeOnBackdropClick ? -1 : undefined}
						aria-label={closeOnBackdropClick ? 'Close dialog' : undefined}
						aria-hidden="false"
						style={{ zIndex: 9998 }}
					/>

					{/* Dialog Container - Full screen on mobile, fixed bottom-right/left on desktop */}
					<div
						className={classNames(
							// Mobile: Full screen from bottom
							'fixed inset-0 flex items-end justify-center',
							// Desktop: Fixed position based on prop
							'sm:inset-auto sm:bottom-4 sm:flex',
							position === 'bottom-right' ? 'sm:right-4 sm:justify-end' : 'sm:left-4 sm:justify-start'
						)}
						style={{ zIndex: 9999 }}
						role="dialog"
						aria-modal="true"
						aria-labelledby="chat-dialog-title"
					>
						{/* Dialog Content */}
						<motion.div
							ref={dialogRef}
							key="dialog"
							variants={dialogVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className={classNames(
								// Base styles
								'relative flex flex-col',
								'bg-base-100 rounded-t-2xl sm:rounded-2xl',
								'shadow-2xl',
								'focus:outline-none',
								// Mobile: Full screen (with safe area insets)
								'w-full h-[calc(100vh-env(safe-area-inset-bottom))] max-h-screen',
								// Desktop: Fixed size window
								'sm:w-[380px] sm:max-w-[calc(100vw-2rem)]',
								'sm:h-auto sm:max-h-[600px] sm:min-h-[400px]',
								// Overflow handling
								'overflow-hidden'
							)}
							onClick={handleContentClick}
							tabIndex={-1}
						>
							{/* Header */}
							<div className="flex items-center justify-between p-4 md:p-6 border-b border-base-300 shrink-0">
								<div className="flex items-center gap-3">
									<MessageCircle className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden="true" />
									<h2 id="chat-dialog-title" className="text-xl md:text-2xl font-bold text-base-content">
										{title}
									</h2>
								</div>
								<Button
									ref={closeButtonRef}
									onClick={onClose}
									variant="ghost"
									size="sm"
									className="btn-circle focus:outline-2 focus:outline-offset-2 focus:outline-primary"
									aria-label="Close chat dialog"
								>
									<X size={20} />
								</Button>
							</div>

							{/* Content - Scrollable */}
							<div className="flex-1 overflow-y-auto p-4 md:p-6">
								{children}
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>,
		document.body
	)
}
