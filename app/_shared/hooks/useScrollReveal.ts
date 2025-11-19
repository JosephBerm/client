/**
 * useScrollReveal Hook
 * 
 * Reusable hook for scroll-triggered reveal animations using Intersection Observer API.
 * Optimized for staggered animations where elements "fall" into place as they enter the viewport.
 * 
 * **Features:**
 * - Uses Intersection Observer for performant scroll detection
 * - Supports staggered animations (one element at a time)
 * - Respects reduced motion preferences (accessibility)
 * - Configurable threshold and root margin
 * - Automatic cleanup on unmount
 * - Row-by-row animation support
 * 
 * **Use Cases:**
 * - Product card grid animations
 * - Staggered list item reveals
 * - Scroll-triggered content animations
 * - Progressive disclosure patterns
 * 
 * **Industry Best Practices:**
 * - FAANG-level: Intersection Observer for performance
 * - Accessibility: Respects prefers-reduced-motion
 * - Performance: Single observer instance, efficient callbacks
 * - Robustness: Handles edge cases, cleanup, error handling
 * 
 * @module shared/hooks/useScrollReveal
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSharedIntersectionObserver } from './useSharedIntersectionObserver'

export interface UseScrollRevealOptions {
	/** Intersection threshold (0-1, default: 0.1 = 10% visible) */
	threshold?: number
	/** Root margin for anticipatory triggering (default: '0px 0px 200px 0px' = 200px before viewport) */
	rootMargin?: string
	/** Delay between staggered animations in milliseconds (default: 50ms for smooth cascade) */
	staggerDelay?: number
	/** Index for staggered animation (0-based, default: 0) */
	index?: number
	/** Whether to enable animations (default: true, respects reduced motion) */
	enabled?: boolean
	/** Callback when element becomes visible */
	onReveal?: (index: number) => void
}

export interface UseScrollRevealReturn {
	/** Ref to attach to the element */
	ref: (node: HTMLElement | null) => void
	/** Whether the element is currently visible */
	isVisible: boolean
	/** Whether the animation has been triggered */
	hasAnimated: boolean
}

/**
 * useScrollReveal Hook
 * 
 * Detects when an element enters the viewport and triggers reveal animation.
 * Supports staggered animations for multiple elements.
 * 
 * @param options - Configuration options
 * @returns Ref and visibility state
 * 
 * @example
 * ```tsx
 * const { ref, isVisible, hasAnimated } = useScrollReveal({
 *   threshold: 0.1,
 *   rootMargin: '0px 0px -100px 0px',
 *   staggerDelay: 100,
 *   onReveal: (index) => console.log('Revealed:', index)
 * })
 * 
 * // Use in component
 * <div ref={ref} className={hasAnimated ? 'animate-fall-in' : 'opacity-0'}>
 *   Content
 * </div>
 * ```
 */
export function useScrollReveal({
	threshold = 0.1,
	rootMargin = '0px 0px 200px 0px', // Anticipatory: trigger 200px BEFORE viewport
	staggerDelay = 50, // Optimized for FAANG-level smooth cascade
	index = 0,
	enabled = true,
	onReveal,
}: UseScrollRevealOptions = {}): UseScrollRevealReturn {
	const [isVisible, setIsVisible] = useState(false)
	const [hasAnimated, setHasAnimated] = useState(false)
	const elementRef = useRef<HTMLElement | null>(null)
	const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const indexRef = useRef(index)
	const callbackRef = useRef<((entry: IntersectionObserverEntry) => void) | null>(null)
	const hasAnimatedRef = useRef(false) // Ref to avoid callback recreation
	
	// Use shared observer for efficiency (industry best practice)
	const { observe, unobserve } = useSharedIntersectionObserver({
		threshold,
		rootMargin,
	})

	// Check for reduced motion preference (system + user override)
	const prefersReducedMotion = useRef(false)
	
	const checkReducedMotion = useCallback(() => {
		if (typeof window === 'undefined') return false
		
		// Check user override first (data-reduced-motion attribute)
		const userOverride = document.documentElement.getAttribute('data-reduced-motion')
		if (userOverride === 'true') return true
		
		// Fall back to system preference
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches
	}, [])
	
	useEffect(() => {
		if (typeof window === 'undefined') return
		
		// Initial check
		prefersReducedMotion.current = checkReducedMotion()
		
		// Listen to system preference changes
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleMediaChange = (e: MediaQueryListEvent) => {
			prefersReducedMotion.current = checkReducedMotion()
		}
		
		// Listen to data attribute changes (user override)
		const observer = new MutationObserver(() => {
			prefersReducedMotion.current = checkReducedMotion()
		})
		
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-reduced-motion'],
		})
		
		mediaQuery.addEventListener('change', handleMediaChange)
		
		return () => {
			mediaQuery.removeEventListener('change', handleMediaChange)
			observer.disconnect()
		}
	}, [checkReducedMotion])

	/**
	 * Handle intersection observer callback
	 * Triggers animation when element enters viewport
	 * Uses shared observer pattern for efficiency
	 * FAANG optimization: Uses refs to avoid callback recreation on every state change
	 */
	const handleIntersection = useCallback(
		(entry: IntersectionObserverEntry) => {
			if (!entry) return

			const isIntersecting = entry.isIntersecting

			// Update visibility state
			setIsVisible(isIntersecting)

			// Trigger animation if element is visible and hasn't animated yet
			// FAANG optimization: Use ref to check state without causing callback recreation
			if (isIntersecting && !hasAnimatedRef.current) {
				hasAnimatedRef.current = true // Mark as animated immediately to prevent duplicate triggers
				
				if (enabled && !prefersReducedMotion.current) {
					// FAANG best practice: Staggered animation using row-aware index
					// The index passed to hook is already row-aware (calculated in ScrollRevealCard)
					// This creates elegant row-by-row cascading effect
					const delay = indexRef.current * staggerDelay

					// Clear any existing timeout
					if (animationTimeoutRef.current) {
						clearTimeout(animationTimeoutRef.current)
					}

					// FAANG optimization: Use requestAnimationFrame for smoother timing
					// This ensures animation starts at optimal frame timing
					requestAnimationFrame(() => {
						animationTimeoutRef.current = setTimeout(() => {
							setHasAnimated(true)
							if (onReveal) {
								onReveal(indexRef.current)
							}
							// OPTIMIZATION: Unobserve after animation completes
							// Prevents unnecessary callbacks for already-animated elements
							if (elementRef.current) {
								unobserve(elementRef.current)
							}
						}, delay)
					})
				} else {
					// For reduced motion or disabled, show immediately
					setHasAnimated(true)
					if (onReveal) {
						onReveal(indexRef.current)
					}
					// Unobserve immediately for reduced motion
					if (elementRef.current) {
						unobserve(elementRef.current)
					}
				}
			}
		},
		[enabled, staggerDelay, onReveal, unobserve] // Removed hasAnimated to prevent callback recreation
	)
	
	// Sync ref with state for cleanup
	useEffect(() => {
		hasAnimatedRef.current = hasAnimated
	}, [hasAnimated])
	
	// Store callback ref for shared observer
	useEffect(() => {
		callbackRef.current = handleIntersection
	}, [handleIntersection])

	// Update index ref when index prop changes
	useEffect(() => {
		indexRef.current = index
	}, [index])

	/**
	 * Ref callback to attach element to shared observer
	 * INDUSTRY BEST PRACTICE: Uses shared observer pattern for efficiency
	 * Single observer handles all elements (scales to 100+ efficiently)
	 */
	const setRef = useCallback(
		(node: HTMLElement | null) => {
			// Unobserve previous element
			if (elementRef.current) {
				unobserve(elementRef.current)
			}

			// Clear animation timeout
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current)
				animationTimeoutRef.current = null
			}

			// Store previous element to detect changes
			const previousElement = elementRef.current
			elementRef.current = node

			// Reset animation state when element changes (handles product list updates)
			// This ensures cards re-animate when products change (filtering, pagination)
			// Note: The key prop on the grid container also helps reset state via React remounting
			if (node && previousElement !== node) {
				// Only reset if this is a new element (not just re-render of same element)
				// The key prop on parent grid ensures proper remounting
				setHasAnimated(false)
				setIsVisible(false)
				hasAnimatedRef.current = false // Sync ref with state
			}

			// Observe new element with shared observer
			if (node && callbackRef.current) {
				observe(node, callbackRef.current)
			} else if (node) {
				// Fallback: if Intersection Observer not available, show immediately
				setIsVisible(true)
				setHasAnimated(true)
			}
		},
		[observe, unobserve]
	)

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Unobserve element
			if (elementRef.current) {
				unobserve(elementRef.current)
			}
			// Clear timeout
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current)
			}
		}
	}, [unobserve])

	return {
		ref: setRef,
		isVisible,
		hasAnimated,
	}
}

