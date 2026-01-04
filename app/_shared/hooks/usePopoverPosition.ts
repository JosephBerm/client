/**
 * usePopoverPosition - Viewport-Aware Popover Positioning Hook
 *
 * Calculates popover position relative to a trigger element with viewport
 * boundary detection. Essential for popovers rendered via portals (at document.body)
 * that need to stay visible within the viewport.
 *
 * **MAANG Pattern:**
 * This follows the same positioning strategy used by:
 * - AG Grid column filters
 * - MUI DataGrid X
 * - Radix UI Popover
 * - Ant Design Dropdown
 *
 * **Features:**
 * - Viewport boundary detection (right edge, left edge)
 * - Scroll-aware repositioning (recalculates on scroll)
 * - Resize-aware repositioning (recalculates on window resize)
 * - Configurable width and margins
 * - SSR-safe (only calculates position client-side)
 *
 * @example
 * ```tsx
 * const triggerRef = useRef<HTMLButtonElement>(null)
 * const position = usePopoverPosition(triggerRef, isOpen, { width: 300 })
 *
 * return (
 *   <>
 *     <button ref={triggerRef}>Open</button>
 *     {isOpen && createPortal(
 *       <div style={{ position: 'fixed', top: position.top, left: position.left }}>
 *         Popover content
 *       </div>,
 *       document.body
 *     )}
 *   </>
 * )
 * ```
 *
 * @module shared/hooks/usePopoverPosition
 */

'use client'

import { useState, useLayoutEffect, useRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface PopoverPosition {
	/** Top position in pixels (relative to viewport + scroll) */
	top: number
	/** Left position in pixels (relative to viewport + scroll) */
	left: number
	/** Whether the position has been calculated (prevents flash at 0,0) */
	isPositioned: boolean
}

export interface UsePopoverPositionOptions {
	/** Expected width of the popover in pixels (for boundary detection) */
	width?: number
	/** Margin between trigger and popover in pixels */
	margin?: number
	/** Minimum margin from viewport edges in pixels */
	viewportPadding?: number
	/** Alignment preference: 'start' aligns to left edge, 'end' aligns to right edge */
	alignment?: 'start' | 'end'
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_OPTIONS: Required<UsePopoverPositionOptions> = {
	width: 280,
	margin: 4,
	viewportPadding: 16,
	alignment: 'start',
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Calculate position synchronously (helper function).
 * Used to get initial position before first render to prevent flash at (0,0).
 */
function calculatePosition(
	trigger: HTMLElement,
	options: Required<UsePopoverPositionOptions>
): { top: number; left: number } {
	const { width, margin, viewportPadding, alignment } = options
	const rect = trigger.getBoundingClientRect()

	// Default: position below trigger
	const top = rect.bottom + margin + window.scrollY

	// Calculate left position based on alignment preference
	let left: number
	if (alignment === 'end') {
		left = rect.right - width + window.scrollX
	} else {
		left = rect.left + window.scrollX
	}

	// Boundary detection: prevent overflow on right edge
	if (left + width > window.innerWidth - viewportPadding) {
		left = rect.right - width + window.scrollX
	}

	// Boundary detection: prevent overflow on left edge
	if (left < viewportPadding) {
		left = viewportPadding
	}

	return { top, left }
}

/**
 * Hook to calculate popover position based on trigger element.
 * Handles viewport boundary detection and repositioning.
 *
 * **Flash Prevention (MAANG Pattern - Floating UI/Radix approach):**
 * 1. Calculates initial position synchronously during render (via lazy initializer)
 * 2. Returns `isPositioned: true` immediately if trigger exists
 * 3. Uses useLayoutEffect only for scroll/resize updates
 *
 * This prevents the visual "jump" from (0,0) to the correct position
 * by ensuring position is calculated BEFORE first paint.
 *
 * @param triggerRef - Ref to the trigger element
 * @param isOpen - Whether the popover is currently open
 * @param options - Configuration options
 * @returns PopoverPosition with top, left coordinates and isPositioned flag
 */
export function usePopoverPosition(
	triggerRef: React.RefObject<HTMLElement | null>,
	isOpen: boolean,
	options: UsePopoverPositionOptions = {}
): PopoverPosition {
	const mergedOptions = {
		...DEFAULT_OPTIONS,
		...options,
	}

	// Track if we've calculated initial position
	const hasCalculatedRef = useRef(false)

	// Calculate initial position synchronously via lazy initializer
	// This runs DURING render, not after, preventing flash
	const [position, setPosition] = useState<PopoverPosition>(() => {
		// Only calculate if open and trigger exists (client-side check)
		if (isOpen && triggerRef.current) {
			hasCalculatedRef.current = true
			const { top, left } = calculatePosition(triggerRef.current, mergedOptions)
			return { top, left, isPositioned: true }
		}
		return { top: 0, left: 0, isPositioned: false }
	})

	// Handle open state changes and scroll/resize updates
	useLayoutEffect(() => {
		// Reset when closed
		if (!isOpen) {
			hasCalculatedRef.current = false
			setPosition((prev) => (prev.isPositioned ? { top: 0, left: 0, isPositioned: false } : prev))
			return
		}

		if (!triggerRef.current) return

		const updatePosition = () => {
			const trigger = triggerRef.current
			if (!trigger) return

			const { top, left } = calculatePosition(trigger, mergedOptions)
			setPosition({ top, left, isPositioned: true })
		}

		// If lazy initializer didn't run (e.g., isOpen changed after mount),
		// calculate immediately
		if (!hasCalculatedRef.current) {
			hasCalculatedRef.current = true
			updatePosition()
		}

		// Recalculate on scroll/resize (handles sticky headers, window resize)
		// Use capture phase (true) to catch scroll events on any ancestor
		window.addEventListener('scroll', updatePosition, true)
		window.addEventListener('resize', updatePosition)

		return () => {
			window.removeEventListener('scroll', updatePosition, true)
			window.removeEventListener('resize', updatePosition)
		}
	}, [isOpen, triggerRef, mergedOptions.width, mergedOptions.margin, mergedOptions.viewportPadding, mergedOptions.alignment])

	return position
}

export default usePopoverPosition
