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

export interface UseScrollRevealOptions {
	/** Intersection threshold (0-1, default: 0.1 = 10% visible) */
	threshold?: number
	/** Root margin for early triggering (default: '0px 0px -100px 0px') */
	rootMargin?: string
	/** Delay between staggered animations in milliseconds (default: 100ms) */
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
	rootMargin = '0px 0px -100px 0px',
	staggerDelay = 100,
	index = 0,
	enabled = true,
	onReveal,
}: UseScrollRevealOptions = {}): UseScrollRevealReturn {
	const [isVisible, setIsVisible] = useState(false)
	const [hasAnimated, setHasAnimated] = useState(false)
	const elementRef = useRef<HTMLElement | null>(null)
	const observerRef = useRef<IntersectionObserver | null>(null)
	const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const indexRef = useRef(index)

	// Check for reduced motion preference
	const prefersReducedMotion = useRef(false)
	
	useEffect(() => {
		if (typeof window === 'undefined') return
		
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		prefersReducedMotion.current = mediaQuery.matches
		
		const handleChange = (e: MediaQueryListEvent) => {
			prefersReducedMotion.current = e.matches
		}
		
		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	/**
	 * Handle intersection observer callback
	 * Triggers animation when element enters viewport
	 */
	const handleIntersection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const entry = entries[0]
			if (!entry) return

			const isIntersecting = entry.isIntersecting

			// Update visibility state
			setIsVisible(isIntersecting)

			// Trigger animation if element is visible and hasn't animated yet
			if (isIntersecting && !hasAnimated) {
				if (enabled && !prefersReducedMotion.current) {
					// Staggered animation: delay based on index
					// This creates a cascading effect where cards animate one after another
					const delay = indexRef.current * staggerDelay

					// Clear any existing timeout
					if (animationTimeoutRef.current) {
						clearTimeout(animationTimeoutRef.current)
					}

					animationTimeoutRef.current = setTimeout(() => {
						setHasAnimated(true)
						if (onReveal) {
							onReveal(indexRef.current)
						}
					}, delay)
				} else {
					// For reduced motion or disabled, show immediately
					setHasAnimated(true)
					if (onReveal) {
						onReveal(indexRef.current)
					}
				}
			}
		},
		[hasAnimated, enabled, staggerDelay, onReveal]
	)

	// Update index ref when index prop changes
	useEffect(() => {
		indexRef.current = index
	}, [index])

	/**
	 * Ref callback to attach element to observer
	 * FAANG pattern: Single observer instance, efficient element tracking
	 */
	const setRef = useCallback(
		(node: HTMLElement | null) => {
			// Cleanup previous observer
			if (observerRef.current && elementRef.current) {
				observerRef.current.unobserve(elementRef.current)
				observerRef.current.disconnect()
			}

			// Clear animation timeout
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current)
				animationTimeoutRef.current = null
			}

			elementRef.current = node

			// Create new observer if element exists
			if (node && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
				try {
					observerRef.current = new IntersectionObserver(handleIntersection, {
						threshold,
						rootMargin,
					})

					observerRef.current.observe(node)
				} catch (error) {
					// Fallback: if Intersection Observer fails, show immediately
					console.warn('IntersectionObserver not supported or failed:', error)
					setIsVisible(true)
					setHasAnimated(true)
				}
			} else if (node) {
				// Fallback: if Intersection Observer not available, show immediately
				setIsVisible(true)
				setHasAnimated(true)
			}
		},
		[threshold, rootMargin, handleIntersection]
	)

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current)
			}
		}
	}, [])

	return {
		ref: setRef,
		isVisible,
		hasAnimated,
	}
}

