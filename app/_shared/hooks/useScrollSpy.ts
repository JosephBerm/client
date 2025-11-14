'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { scrollToElement, getCSSVariable, calculateScrollOffset } from '@_shared/utils/scrollUtils'

/**
 * Configuration options for useScrollSpy hook
 */
export interface UseScrollSpyOptions {
	/**
	 * Array of section IDs to observe
	 */
	sectionIds: string[]

	/**
	 * Root margin for Intersection Observer (default: '-20% 0px -80% 0px')
	 * Negative top margin means section becomes active when it's 20% from top
	 * Negative bottom margin means section stays active until 80% scrolled
	 */
	rootMargin?: string

	/**
	 * Threshold for Intersection Observer (default: 0)
	 * 0 means section becomes active as soon as any part enters viewport
	 */
	threshold?: number | number[]

	/**
	 * Offset in pixels to account for fixed headers (default: 0)
	 */
	offset?: number

	/**
	 * Debounce delay in milliseconds for scroll events (default: 100)
	 */
	debounceDelay?: number
}

/**
 * Return type for useScrollSpy hook
 */
export interface UseScrollSpyReturn {
	/**
	 * Currently active section ID
	 */
	activeSection: string | null

	/**
	 * Function to scroll to a specific section
	 */
	scrollToSection: (sectionId: string) => void

	/**
	 * Check if a section is currently active
	 */
	isSectionActive: (sectionId: string) => boolean
}

/**
 * useScrollSpy Hook
 *
 * Custom hook for detecting which section is currently in view using Intersection Observer API.
 * Provides active section tracking and smooth scroll functionality.
 *
 * **Features:**
 * - Intersection Observer API for performance (better than scroll listeners)
 * - Debounced updates to prevent excessive re-renders
 * - Smooth scroll with offset calculation for fixed headers
 * - Mobile-first responsive behavior
 * - Accessible and keyboard-friendly
 *
 * **Performance:**
 * - Uses Intersection Observer (more efficient than scroll listeners)
 * - Debounced state updates
 * - Automatic cleanup on unmount
 * - Lazy initialization
 *
 * **Accessibility:**
 * - Respects user's reduced motion preferences
 * - Works with keyboard navigation
 * - Screen reader friendly
 *
 * @example
 * ```tsx
 * const { activeSection, scrollToSection, isSectionActive } = useScrollSpy({
 *   sectionIds: ['hero', 'products', 'about', 'contact'],
 *   offset: 96, // Account for fixed header
 * })
 *
 * // Check if section is active
 * const isActive = isSectionActive('hero')
 *
 * // Scroll to section
 * scrollToSection('products')
 * ```
 *
 * @param options - Configuration options
 * @returns Object with activeSection, scrollToSection, and isSectionActive
 */
export function useScrollSpy({
	sectionIds,
	rootMargin = '-20% 0px -80% 0px',
	threshold = 0,
	offset = 0,
	debounceDelay = 100,
}: UseScrollSpyOptions): UseScrollSpyReturn {
	const [activeSection, setActiveSection] = useState<string | null>(null)
	const observerRef = useRef<IntersectionObserver | null>(null)
	const sectionRefsRef = useRef<Map<string, HTMLElement>>(new Map())
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	/**
	 * Debounced function to update active section
	 */
	const updateActiveSection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			// Clear existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}

			// Debounce the update
			timeoutRef.current = setTimeout(() => {
				// Find the most visible section (highest intersection ratio)
				let maxRatio = 0
				let mostVisibleSection: string | null = null

				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
						maxRatio = entry.intersectionRatio
						mostVisibleSection = entry.target.id
					}
				})

				// If no section is intersecting, find the first section above viewport
				if (!mostVisibleSection && entries.length > 0) {
					const sortedEntries = [...entries].sort((a, b) => {
						const aTop = a.boundingClientRect.top
						const bTop = b.boundingClientRect.top
						return aTop - bTop
					})

					// Find the last section that's above the viewport
					for (let i = sortedEntries.length - 1; i >= 0; i--) {
						if (sortedEntries[i].boundingClientRect.top < 0) {
							mostVisibleSection = sortedEntries[i].target.id
							break
						}
					}

					// If all sections are below, use the first one
					if (!mostVisibleSection && sortedEntries.length > 0) {
						mostVisibleSection = sortedEntries[0].target.id
					}
				}

				if (mostVisibleSection && mostVisibleSection !== activeSection) {
					setActiveSection(mostVisibleSection)
				}
			}, debounceDelay)
		},
		[activeSection, debounceDelay]
	)

	/**
	 * Initialize Intersection Observer
	 */
	useEffect(() => {
		// Check if Intersection Observer is supported
		if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
			// Fallback: Set first section as active
			if (sectionIds.length > 0) {
				setActiveSection(sectionIds[0])
			}
			return
		}

		// Create observer with options
		observerRef.current = new IntersectionObserver(updateActiveSection, {
			root: null, // Use viewport as root
			rootMargin,
			threshold,
		})

		// Observe all sections
		sectionIds.forEach((id) => {
			const element = document.getElementById(id)
			if (element) {
				sectionRefsRef.current.set(id, element)
				observerRef.current?.observe(element)
			}
		})

		// Cleanup - capture refs in closure to avoid stale refs
		const currentObserver = observerRef.current
		const currentSectionRefs = sectionRefsRef.current
		const currentTimeout = timeoutRef.current

		return () => {
			if (currentTimeout) {
				clearTimeout(currentTimeout)
			}
			if (currentObserver) {
				currentObserver.disconnect()
			}
			currentSectionRefs.clear()
		}
	}, [sectionIds, rootMargin, threshold, updateActiveSection])

	/**
	 * Scroll to a specific section with smooth behavior and offset
	 */
	const scrollToSection = useCallback(
		(sectionId: string) => {
			const success = scrollToElement(sectionId, {
				offset,
				behavior: 'smooth',
				respectReducedMotion: true,
			})

			// Update active section immediately for better UX
			if (success) {
				setActiveSection(sectionId)
			}
		},
		[offset]
	)

	/**
	 * Check if a section is currently active
	 */
	const isSectionActive = useCallback(
		(sectionId: string) => {
			return activeSection === sectionId
		},
		[activeSection]
	)

	return {
		activeSection,
		scrollToSection,
		isSectionActive,
	}
}

