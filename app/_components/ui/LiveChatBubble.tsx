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
 * - "Coming Soon" tooltip for future feature
 * - Badge support for unread messages (future)
 * 
 * **FAANG Principles:**
 * - Mobile-first responsive design
 * - Smooth animations (60fps)
 * - Accessible to all users
 * - Performance optimized
 * - Clean, modern aesthetic
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
import { MessageCircle, X } from 'lucide-react'
import classNames from 'classnames'
import { logger } from '@_core/logger'

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
	const isTooltipVisible = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
	const setIsTooltipVisible = onOpenChange || setInternalIsOpen

	// Auto-hide tooltip after 3 seconds
	useEffect(() => {
		if (isTooltipVisible) {
			const timer = setTimeout(() => {
				setIsTooltipVisible(false)
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [isTooltipVisible, setIsTooltipVisible])

	/**
	 * Compute safe bottom offset so the bubble does not overlap bottom-fixed UI
	 * like the section navigation. Mobile-first; recalculates on resize/scroll.
	 */
	useEffect(() => {
		if (typeof window === 'undefined') return

		let rafId: number | null = null
		let lastOffset = -1

		const measure = () => {
			try {
				// Tailwind base spacing used by classes (bottom-4 vs sm:bottom-6)
				const baseBottom = window.matchMedia('(min-width: 640px)').matches ? 24 : 16

				let maxAvoidHeight = 0
				for (const selector of avoidOverlapSelectors) {
					const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
					for (const el of elements) {
						const style = window.getComputedStyle(el)
						const isFixed = style.position === 'fixed'
						const isVisible = style.display !== 'none' && style.visibility !== 'hidden'
						if (!isFixed || !isVisible) continue
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
			if (rafId === null) rafId = requestAnimationFrame(measure)
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
			if (rafId !== null) cancelAnimationFrame(rafId)
			if (ro) ro.disconnect()
		}
	}, [avoidOverlapSelectors, additionalBottomPadding])

	// Don't render if not visible
	if (!visible) return null

	const handleClick = () => {
		setIsTooltipVisible(true)
		// Future: Open chat window
		// openChatWindow()
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
				aria-expanded={isTooltipVisible}
			>
				{/* Icon with rotation animation */}
				<MessageCircle
					className={classNames(
						compact
							? 'h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 transition-transform duration-300'
							: 'h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300',
						isHovered && 'rotate-12'
					)}
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

			{/* Coming Soon Tooltip */}
			{isTooltipVisible && (
				<div
					className={classNames(
						'fixed flex items-center gap-2',
						'rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xl',
						'transition-all duration-300 ease-out',
						// Position relative to button
						position === 'bottom-right' ? 'right-4 sm:right-6' : 'left-4 sm:left-6',
						// Animation
						'animate-in fade-in slide-in-from-bottom-2',
						// Mobile-first responsive width
						'w-[calc(100vw-2rem)] max-w-xs sm:w-auto'
					)}
					style={{
						zIndex: zIndex + 1,
						// Tooltip sits above the bubble; add button size + small gap
						bottom: `calc(env(safe-area-inset-bottom, 0px) + ${computedBottomOffset + (compact ? 48 : 56) + 12}px)`,
					}}
					role="tooltip"
					aria-live="polite"
				>
					<div className="flex-1">
						<div className="flex items-center gap-2">
							<MessageCircle className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden="true" />
							<p className="font-semibold text-base-content">Live Chat</p>
						</div>
						<p className="mt-1 text-sm text-base-content/70">
							Coming Soon! We're building something amazing.
						</p>
					</div>

					{/* Close button */}
					<button
						onClick={() => setIsTooltipVisible(false)}
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
						aria-label="Close tooltip"
					>
						<X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
					</button>
				</div>
			)}
		</>
	)
}

