/**
 * Live Chat Bubble Component
 * 
 * Beautiful, floating live chat widget button following industry best practices.
 * Inspired by Intercom, Drift, and other leading customer communication platforms.
 * 
 * **Features:**
 * - Fixed position (bottom-right corner)
 * - Mobile-first responsive design
 * - Smooth animations and transitions
 * - Hover and focus states
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Professional chat dialog (MAANG-level implementation)
 * - Badge support for unread messages (future)
 * 
 * **FAANG Principles:**
 * - Mobile-first responsive design
 * - Smooth animations (60fps)
 * - Accessible to all users
 * - Performance optimized
 * - Clean, modern aesthetic
 * - Portal rendering for proper z-index stacking
 * - Focus trap and keyboard navigation
 * 
 * **Future Enhancements:**
 * - Connect to real chat service (Intercom, Drift, custom)
 * - Unread message badge
 * - Online/offline status indicator
 * - Preview of last message
 * - Expandable chat window
 * - Typing indicators
 * - Sound notifications
 * 
 * @module components/ui/LiveChatBubble
 */

'use client'

import { useState, useEffect } from 'react'

import classNames from 'classnames'
import { MessageCircle } from 'lucide-react'

import { logger } from '@_core/logger'

import ChatDialog from './ChatDialog'

export interface LiveChatBubbleProps {
	/** Show/hide the chat bubble */
	visible?: boolean
	/** Position on screen */
	position?: 'bottom-right' | 'bottom-left'
	/** Number of unread messages (future feature) */
	unreadCount?: number
	/** Custom z-index */
	zIndex?: number
	/** Custom className */
	className?: string
	/** External control for opening the chat */
	isOpen?: boolean
	/** Callback when chat is opened/closed */
	onOpenChange?: (isOpen: boolean) => void
	/**
	 * CSS selectors for bottom-fixed elements to avoid overlapping with.
	 * The bubble will measure these elements and raise itself accordingly.
	 */
	avoidOverlapSelectors?: string[]
	/** Extra breathing room above avoided elements (in px). */
	additionalBottomPadding?: number
	/** Use a more compact button footprint on small screens. */
	compact?: boolean
}

/**
 * Live Chat Bubble Component
 * 
 * Floating action button for initiating live chat.
 * Currently shows "Coming Soon" message - ready for future integration.
 * 
 * @example
 * ```tsx
 * <LiveChatBubble />
 * ```
 * 
 * @example With custom position
 * ```tsx
 * <LiveChatBubble position="bottom-left" />
 * ```
 */
export default function LiveChatBubble({
	visible = true,
	position = 'bottom-right',
	unreadCount = 0,
	zIndex = 1000,
	className,
	isOpen: externalIsOpen,
	onOpenChange,
	avoidOverlapSelectors = ['nav[aria-label="Page sections navigation"]', '[data-bottom-bar="true"]'],
	additionalBottomPadding = 8,
	compact = true,
}: LiveChatBubbleProps) {
	const [internalIsOpen, setInternalIsOpen] = useState(false)
	const [isHovered, setIsHovered] = useState(false)
	const [computedBottomOffset, setComputedBottomOffset] = useState<number>(0)

	// Use external state if provided, otherwise use internal state
	// More defensive: if externalIsOpen is explicitly provided (even if false), use external control
	const isDialogOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
	// Only use internal state setter if external control (onOpenChange) is not provided
	const setIsDialogOpen = onOpenChange ? onOpenChange : setInternalIsOpen

	/**
	 * Compute safe bottom offset so the bubble does not overlap bottom-fixed UI
	 * like the section navigation. Mobile-first; recalculates on resize/scroll.
	 */
	useEffect(() => {
		if (typeof window === 'undefined') {return}

		let rafId: number | null = null
		let lastOffset = -1

		const measure = () => {
			try {
				// Tailwind base spacing used by classes (bottom-4 vs sm:bottom-6)
				const baseBottom = window.matchMedia('(min-width: 640px)').matches ? 24 : 16

				let maxAvoidHeight = 0
				for (const selector of avoidOverlapSelectors) {
					const elements = Array.from(document.querySelectorAll(selector))
					for (const el of elements) {
						const style = window.getComputedStyle(el)
						const isFixed = style.position === 'fixed'
						const isVisible = style.display !== 'none' && style.visibility !== 'hidden'
						if (!isFixed || !isVisible) {continue}
						const rect = el.getBoundingClientRect()
						const atBottom = Math.abs(window.innerHeight - rect.bottom) <= 2 || style.bottom !== 'auto'
						if (atBottom) {
							maxAvoidHeight = Math.max(maxAvoidHeight, rect.height)
						}
					}
				}

				const extra = maxAvoidHeight > 0 ? maxAvoidHeight + additionalBottomPadding : 0
				const next = baseBottom + extra
				if (next !== lastOffset) {
					lastOffset = next
					setComputedBottomOffset(next)
					logger.debug('LiveChatBubble: bottom offset updated', {
						component: 'LiveChatBubble',
						offset: next,
						maxAvoidHeight,
					})
				}
			} catch (error) {
				logger.warn('LiveChatBubble: bottom offset measurement failed', {
					component: 'LiveChatBubble',
					error,
				})
			} finally {
				rafId = null
			}
		}

		const schedule = () => {
			if (rafId === null) {rafId = requestAnimationFrame(measure)}
		}

		const init = setTimeout(schedule, 50)
		window.addEventListener('resize', schedule, { passive: true })
		window.addEventListener('scroll', schedule, { passive: true })

		const ResizeObserverImpl = (window as any).ResizeObserver as typeof ResizeObserver | undefined
		const ro = ResizeObserverImpl ? new ResizeObserverImpl(() => schedule()) : undefined
		if (ro) {
			for (const selector of avoidOverlapSelectors) {
				document.querySelectorAll(selector).forEach((el) => ro.observe(el))
			}
		}

		return () => {
			clearTimeout(init)
			window.removeEventListener('resize', schedule)
			window.removeEventListener('scroll', schedule)
			if (rafId !== null) {cancelAnimationFrame(rafId)}
			if (ro) {ro.disconnect()}
		}
	}, [avoidOverlapSelectors, additionalBottomPadding])

	// Don't render if not visible
	if (!visible) {return null}

	const handleClick = () => {
		// Prevent opening if already open (defensive)
		if (!isDialogOpen) {
			setIsDialogOpen(true)
		}
	}

	const handleClose = () => {
		// Prevent closing if already closed (defensive)
		if (isDialogOpen) {
			setIsDialogOpen(false)
		}
	}

	const positionClasses = {
		'bottom-right': 'right-4 sm:right-6',
		'bottom-left': 'left-4 sm:left-6',
	} as const

	const sizeClasses = compact
		? 'h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16'
		: 'h-14 w-14 sm:h-16 sm:w-16'

	return (
		<>
			{/* Chat Bubble Button */}
			<button
				onClick={handleClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className={classNames(
					// Base styles
					'fixed flex items-center justify-center',
					'rounded-full shadow-lg',
					'transition-all duration-300 ease-out',
					// Size (mobile-first)
					sizeClasses,
					// Colors and hover states
					'bg-primary text-primary-content',
					'hover:scale-110 hover:shadow-xl',
					'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
					// Active state
					'active:scale-95',
					// Position
					positionClasses[position],
					// Custom z-index
					className
				)}
				style={{
					zIndex,
					// Respect iOS/Android safe areas and measured bottom bars
					bottom: `calc(env(safe-area-inset-bottom, 0px) + ${computedBottomOffset}px)`,
				}}
				aria-label="Open live chat"
				aria-haspopup="dialog"
				aria-expanded={isDialogOpen}
			>
				{/* Icon with rotation animation */}
				<MessageCircle
					className={classNames(
						'h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-transform duration-300',
						isHovered && 'rotate-12'
					)}
					style={{ minWidth: 'var(--fz-lg)' }}
					strokeWidth={2}
					aria-hidden="true"
				/>

				{/* Unread Badge (future feature) */}
				{unreadCount > 0 && (
					<span
						className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-error-content shadow-md"
						aria-label={`${unreadCount} unread messages`}
					>
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}

				{/* Pulse animation ring (when there are unread messages) */}
				{unreadCount > 0 && (
					<span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" aria-hidden="true" />
				)}
			</button>

			{/* Professional Chat Dialog - MAANG-level implementation */}
			<ChatDialog
				isOpen={isDialogOpen}
				onClose={handleClose}
				position={position}
			>
				<div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
					<MessageCircle className="h-12 w-12 text-primary" strokeWidth={1.5} aria-hidden="true" />
					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-base-content">
							Coming Soon!
						</h3>
						<p className="text-sm text-base-content/70 max-w-md">
							We&apos;re building something amazing. Our live chat feature will be available soon to help you get instant support.
						</p>
					</div>
				</div>
			</ChatDialog>
		</>
	)
}

