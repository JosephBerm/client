/**
 * useScrollProgress Hook
 * 
 * Reusable hook for calculating scroll progress (0-100%).
 * Optimized for timeline indicators, progress bars, and scroll-triggered animations.
 * 
 * **Features:**
 * - Calculates scroll progress matching browser scrollbar exactly
 * - Supports custom scroll containers (not just window)
 * - Throttled with requestAnimationFrame for smooth performance
 * - Handles edge cases (short pages, dynamic content)
 * - Future-proof: Ready for scroll-triggered animations
 * 
 * **Use Cases:**
 * - Timeline progress indicators
 * - Reading progress bars
 * - Scroll-triggered animations
 * - Parallax effects
 * 
 * **Industry Best Practices:**
 * - FAANG-level: Pixel-perfect scrollbar synchronization
 * - Performance: RAF throttling, passive event listeners
 * - Robustness: Handles edge cases, dynamic content
 * - Scalability: Works with any scroll container
 * 
 * @module shared/hooks/useScrollProgress
 */

'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'

export interface UseScrollProgressOptions {
	/** Optional: Custom scroll container (default: window) */
	container?: HTMLElement | null
	/** Optional: Throttle delay in milliseconds (default: 16ms for ~60fps) */
	throttleMs?: number
	/** Optional: Enable immediate updates (for scrollbar drag) */
	enableImmediateUpdates?: boolean
}

export interface UseScrollProgressReturn {
	/** Scroll progress percentage (0-100) */
	progress: number
	/** Current scroll position in pixels */
	scrollTop: number
	/** Total scrollable height in pixels */
	scrollableHeight: number
	/** Document/viewport height in pixels */
	viewportHeight: number
}

/**
 * useScrollProgress Hook
 * 
 * Calculates scroll progress matching browser scrollbar position exactly.
 * 
 * @param options - Configuration options
 * @returns Scroll progress and metrics
 * 
 * @example
 * ```tsx
 * const { progress } = useScrollProgress({
 *   throttleMs: 16, // ~60fps
 *   enableImmediateUpdates: true // For scrollbar drag
 * })
 * 
 * // Use in component
 * <div style={{ width: `${progress}%` }} />
 * ```
 */
export function useScrollProgress({
	container,
	throttleMs = 16,
	enableImmediateUpdates = true,
}: UseScrollProgressOptions = {}): UseScrollProgressReturn {
	const [progress, setProgress] = useState(0)
	const [scrollTop, setScrollTop] = useState(0)
	const [scrollableHeight, setScrollableHeight] = useState(0)
	const [viewportHeight, setViewportHeight] = useState(0)

	const rafIdRef = useRef<number | null>(null)
	const lastUpdateTimeRef = useRef(0)
	const lastScrollTopRef = useRef(0)
	const containerRef = useRef<HTMLElement | null>(container || null)

	// Update container ref when it changes
	useEffect(() => {
		containerRef.current = container || null
	}, [container])

	/**
	 * Calculate scroll progress
	 * Optimized: useCallback to prevent unnecessary re-creations
	 * FAANG approach: Memoized calculation function with error handling
	 */
	const calculateProgress = useCallback(() => {
		try {
			// Determine scroll container
			const currentContainer = containerRef.current
			const scrollContainer = currentContainer || window
			const isWindow = scrollContainer === window

			// Get scroll metrics with error handling
			let currentScrollTop: number
			let containerHeight: number
			let contentHeight: number

			if (isWindow) {
				currentScrollTop = window.scrollY || document.documentElement.scrollTop
				containerHeight = window.innerHeight
				contentHeight = document.documentElement.scrollHeight
			} else {
				// Validate container is still in DOM
				if (!currentContainer || !document.contains(currentContainer)) {
					// Container was removed from DOM, reset to window
					containerRef.current = null
					return
				}

				const element = currentContainer
				currentScrollTop = element.scrollTop
				containerHeight = element.clientHeight
				contentHeight = element.scrollHeight
			}

			// Validate metrics are valid numbers
			if (
				!Number.isFinite(currentScrollTop) ||
				!Number.isFinite(containerHeight) ||
				!Number.isFinite(contentHeight)
			) {
				console.warn('Invalid scroll metrics detected, skipping update')
				return
			}

			// Calculate scrollable height (total content height minus viewport)
			const scrollable = contentHeight - containerHeight

			// Edge cases: Handle when content is shorter than viewport
			if (scrollable <= 0) {
				setProgress(0)
				setScrollTop(currentScrollTop)
				setScrollableHeight(0)
				setViewportHeight(containerHeight)
				return
			}

			// Calculate progress percentage (0-100) matching scrollbar exactly
			// Formula: (current scroll position / total scrollable distance) * 100
			const progressPercent = (currentScrollTop / scrollable) * 100

			// Clamp to 0-100 range for safety
			const clampedProgress = Math.min(100, Math.max(0, progressPercent))

			// Batch state updates for better performance
			// Industry best practice: Minimize state updates to prevent unnecessary re-renders
			// FAANG approach: Use functional updates with change detection
			setProgress((prev) => {
				// Only update if value actually changed (prevent unnecessary re-renders)
				// Use epsilon comparison for floating point numbers
				return Math.abs(prev - clampedProgress) > 0.01 ? clampedProgress : prev
			})
			setScrollTop((prev) => (Math.abs(prev - currentScrollTop) >= 1 ? currentScrollTop : prev))
			setScrollableHeight((prev) => (prev !== scrollable ? scrollable : prev))
			setViewportHeight((prev) => (prev !== containerHeight ? containerHeight : prev))
		} catch (error) {
			// Error handling: Log but don't crash
			console.error('Error in calculateProgress:', error)
		}
	}, [])

	/**
	 * Hybrid scroll handler: Immediate updates + RAF throttling
	 * Industry best practice: Immediate updates for scrollbar drag + RAF for smooth wheel scrolling
	 * FAANG-level: Pixel-perfect synchronization with scrollbar position
	 * Optimized: useCallback to prevent unnecessary re-creations
	 */
	const handleScroll = useCallback(() => {
		const now = Date.now()
		const currentContainer = containerRef.current
		const currentScrollTop = currentContainer
			? currentContainer.scrollTop
			: window.scrollY || document.documentElement.scrollTop

		// Always update immediately (handles scrollbar drag)
		// This ensures progress updates even when RAF doesn't fire during drag
		// Critical for pixel-perfect scrollbar synchronization
		if (enableImmediateUpdates) {
			calculateProgress()
		}

		// Also use RAF for smooth wheel scrolling (throttled for performance)
		// Only throttle if scroll position changed significantly
		if (Math.abs(currentScrollTop - lastScrollTopRef.current) >= 1) {
			lastScrollTopRef.current = currentScrollTop

			// Throttle RAF updates to specified fps
			if (now - lastUpdateTimeRef.current >= throttleMs) {
				if (rafIdRef.current === null) {
					rafIdRef.current = requestAnimationFrame(() => {
						// Double-check scroll position hasn't changed during RAF
						const latestContainer = containerRef.current
						const latestScrollTop = latestContainer
							? latestContainer.scrollTop
							: window.scrollY || document.documentElement.scrollTop
						if (Math.abs(latestScrollTop - lastScrollTopRef.current) >= 1) {
							calculateProgress()
						}
						rafIdRef.current = null
						lastUpdateTimeRef.current = now
					})
				}
			}
		}
	}, [enableImmediateUpdates, throttleMs, calculateProgress])

	useEffect(() => {
		if (typeof window === 'undefined') {return}

		// Initial calculation
		calculateProgress()

		// Determine event target (use ref to get latest container)
		const currentContainer = containerRef.current
		const eventTarget = currentContainer || window

		// Use both scroll and wheel events for comprehensive coverage
		// Also listen to resize to recalculate when viewport changes
		// Industry best practice: Passive listeners for better scroll performance
		// FAANG approach: Proper event listener management with cleanup
		try {
			eventTarget.addEventListener('scroll', handleScroll, { passive: true })
			eventTarget.addEventListener('wheel', handleScroll, { passive: true })
			window.addEventListener('resize', calculateProgress, { passive: true })
		} catch (error) {
			console.error('Error setting up scroll listeners:', error)
		}

		return () => {
			// Cleanup: Remove all event listeners
			// Use same eventTarget reference for proper cleanup
			try {
				eventTarget.removeEventListener('scroll', handleScroll)
				eventTarget.removeEventListener('wheel', handleScroll)
				window.removeEventListener('resize', calculateProgress)
			} catch (error) {
				console.error('Error removing scroll listeners:', error)
			}

			// Cancel any pending RAF
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current)
				rafIdRef.current = null
			}
		}
	}, [container, throttleMs, enableImmediateUpdates, calculateProgress, handleScroll])

	// Memoize return value to prevent unnecessary re-renders
	// Industry best practice: Stable return value reference
	return useMemo(
		() => ({
			progress,
			scrollTop,
			scrollableHeight,
			viewportHeight,
		}),
		[progress, scrollTop, scrollableHeight, viewportHeight]
	)
}

