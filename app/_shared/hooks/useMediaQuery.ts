/**
 * useMediaQuery Hook
 * 
 * Custom React hook for responsive design with media queries.
 * Prevents hydration mismatches by returning false during SSR.
 * 
 * **Features:**
 * - SSR-safe (no hydration errors)
 * - Automatic cleanup
 * - Re-renders on media query changes
 * - Type-safe
 * 
 * **Use Cases:**
 * - Responsive component behavior
 * - Conditional rendering based on screen size
 * - Mobile/desktop detection
 * 
 * @module useMediaQuery
 */

'use client'

import { useState, useEffect } from 'react'

/**
 * Hook that listens to a media query and returns whether it matches.
 * 
 * Returns `false` during SSR to prevent hydration mismatches.
 * Updates when the media query match state changes.
 * 
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns Boolean indicating whether the media query matches
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useMediaQuery('(max-width: 1023px)')
 *   const isDesktop = useMediaQuery('(min-width: 1024px)')
 *   
 *   return (
 *     <div>
 *       {isMobile && <MobileLayout />}
 *       {isDesktop && <DesktopLayout />}
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Common breakpoints
 * const isMobile = useMediaQuery('(max-width: 767px)')
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
	// Initialize with false to prevent hydration mismatches
	const [matches, setMatches] = useState(false)

	useEffect(() => {
		// Skip if window is not defined (SSR)
		if (typeof window === 'undefined') {return}

		const mediaQuery = window.matchMedia(query)
		
		// Set initial value
		setMatches(mediaQuery.matches)

		// Create event listener
		const handleChange = (event: MediaQueryListEvent) => {
			setMatches(event.matches)
		}

		// Add listener (use newer addEventListener if available, fallback to addListener)
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener('change', handleChange)
		} else {
			// Fallback for older browsers
			mediaQuery.addListener(handleChange)
		}

		// Cleanup
		return () => {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener('change', handleChange)
			} else {
				// Fallback for older browsers
				mediaQuery.removeListener(handleChange)
			}
		}
	}, [query])

	return matches
}

