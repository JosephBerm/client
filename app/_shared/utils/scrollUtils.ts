/**
 * Scroll Utilities
 *
 * Pure utility functions for scroll-related operations.
 * Follows FAANG-level patterns for separation of concerns.
 *
 * **Features:**
 * - Scroll to element with offset calculation
 * - CSS variable reading utilities
 * - Reduced motion preference detection
 * - Viewport calculations
 *
 * **Use Cases:**
 * - Smooth scroll navigation
 * - Scroll spy implementations
 * - Fixed header offset calculations
 * - Scroll position tracking
 *
 * @module scrollUtils
 */

/**
 * Scroll to an element with smooth behavior and offset
 * 
 * Industry best practice: Use reliable position calculation that works for all elements
 * FAANG approach: Handle edge cases (top of page, fixed headers, dynamic content)
 *
 * @param elementId - ID of the element to scroll to
 * @param options - Scroll options including offset and behavior
 * @returns Whether the scroll was successful
 *
 * @example
 * ```ts
 * scrollToElement('hero', { offset: 96, behavior: 'smooth' })
 * ```
 */
export function scrollToElement(
	elementId: string,
	options: {
		offset?: number
		behavior?: ScrollBehavior
		respectReducedMotion?: boolean
	} = {}
): boolean {
	const { offset = 0, behavior = 'smooth', respectReducedMotion = true } = options

	if (typeof window === 'undefined') return false

	const element = document.getElementById(elementId)
	if (!element) return false

	// Check for reduced motion preference
	const prefersReducedMotion = respectReducedMotion
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false

	// Industry best practice: Calculate element position relative to document
	// FAANG approach: Use multiple calculation methods for maximum reliability
	// 
	// Primary method: Use getBoundingClientRect() + current scroll position
	// This works correctly regardless of element position or scroll state
	const rect = element.getBoundingClientRect()
	const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
	
	// Calculate element's absolute position in the document using getBoundingClientRect
	// This is the most reliable method for elements with any positioning context
	const elementPositionFromRect = rect.top + currentScrollTop
	
	// Alternative method: Use offsetTop (for validation and edge cases)
	// This is more reliable for elements at the very top of the document
	let elementPositionFromOffset = 0
	let currentElement: HTMLElement | null = element
	while (currentElement && currentElement !== document.body) {
		elementPositionFromOffset += currentElement.offsetTop
		currentElement = currentElement.offsetParent as HTMLElement | null
	}
	
	// Use the more reliable of the two methods
	// For elements at the top, offsetTop is more accurate
	// For elements with complex positioning, getBoundingClientRect is better
	const elementPosition = elementPositionFromOffset < 50 
		? elementPositionFromOffset  // Use offsetTop for top-of-page elements
		: elementPositionFromRect    // Use getBoundingClientRect for others

	// Calculate final scroll position with offset
	// Industry best practice: Handle top-of-page elements specially
	// FAANG approach: For elements at document start (position 0 or very close), scroll to top
	// For other elements, apply offset to account for fixed header
	let offsetPosition: number
	
	// Check if element is at the very top of the document (within 10px tolerance)
	// This handles hero sections and other top-of-page elements
	// Tolerance accounts for potential margin/padding on body or html
	if (elementPosition <= 10) {
		// Element is at the very top of the document
		// Industry best practice: Scroll to absolute top (0) for hero/top sections
		// The fixed header will naturally cover the top, so we don't need offset
		offsetPosition = 0
	} else {
		// Element is further down the page, apply offset to account for fixed header
		// This ensures the element appears just below the fixed header
		offsetPosition = Math.max(0, elementPosition - offset)
	}

	// Scroll to element
	window.scrollTo({
		top: offsetPosition,
		behavior: prefersReducedMotion ? 'auto' : behavior,
	})

	return true
}

/**
 * Get a CSS custom property value from the document root
 *
 * @param propertyName - Name of the CSS custom property (e.g., '--nav-height')
 * @param fallback - Fallback value if property is not found (default: '0')
 * @returns The property value as a number, or fallback
 *
 * @example
 * ```ts
 * const navHeight = getCSSVariable('--nav-height', 96)
 * ```
 */
export function getCSSVariable(propertyName: string, fallback: number = 0): number {
	if (typeof window === 'undefined') return fallback

	try {
		const value = getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim()
		if (!value) return fallback

		// Parse the value (handles '96px', '96', etc.)
		const parsed = parseFloat(value)
		return isNaN(parsed) ? fallback : parsed
	} catch (error) {
		console.warn(`Failed to read CSS variable ${propertyName}:`, error)
		return fallback
	}
}

/**
 * Check if user prefers reduced motion
 *
 * @returns True if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Calculate scroll offset accounting for fixed headers
 *
 * @param headerHeight - Height of fixed header in pixels
 * @param additionalOffset - Additional offset in pixels (default: 16)
 * @returns Total scroll offset
 *
 * @example
 * ```ts
 * const offset = calculateScrollOffset(96, 16) // 112px
 * ```
 */
export function calculateScrollOffset(headerHeight: number, additionalOffset: number = 16): number {
	return headerHeight + additionalOffset
}

/**
 * Get element's position relative to viewport
 *
 * @param elementId - ID of the element
 * @returns Element's bounding rect, or null if not found
 */
export function getElementPosition(elementId: string): DOMRect | null {
	if (typeof window === 'undefined') return null

	const element = document.getElementById(elementId)
	if (!element) return null

	return element.getBoundingClientRect()
}

