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

	// Calculate scroll position with offset
	const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
	const offsetPosition = elementPosition - offset

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

