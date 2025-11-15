/**
 * useSectionMetrics Hook
 * 
 * Reusable hook for measuring section positions, dimensions, and metrics.
 * Optimized for scroll-triggered animations and timeline positioning.
 * 
 * **Features:**
 * - Measures section positions, heights, and boundaries
 * - Automatically updates on scroll, resize, and content changes
 * - Uses ResizeObserver for dynamic content (images, lazy-loaded content)
 * - Throttled with requestAnimationFrame for performance
 * - Future-proof: Ready for scroll-triggered animations
 * 
 * **Use Cases:**
 * - Timeline navigation (position labels based on actual section positions)
 * - Scroll-triggered animations (fade-in, slide-in, etc.)
 * - Active section detection
 * - Scroll progress calculations
 * 
 * **Industry Best Practices:**
 * - FAANG-level: Single source of truth for section metrics
 * - Performance: RAF throttling, passive event listeners
 * - Robustness: Multiple measurement strategies (immediate, delayed, observer-based)
 * - Scalability: Handles dynamic content, lazy loading, responsive layouts
 * 
 * @module shared/hooks/useSectionMetrics
 */

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'

export interface SectionMetric {
	/** Section ID */
	id: string
	/** Top position relative to document */
	top: number
	/** Bottom position relative to document */
	bottom: number
	/** Section height in pixels */
	height: number
	/** Section index in the sections array */
	index: number
	/** Center position relative to document */
	center: number
	/** Whether section is currently in viewport */
	isInViewport: boolean
	/** Progress of section through viewport (0-1) */
	viewportProgress: number
}

export interface UseSectionMetricsOptions {
	/** Array of section IDs to measure */
	sectionIds: readonly string[]
	/** Optional: Custom scroll offset (e.g., for fixed headers) */
	scrollOffset?: number
	/** Optional: Enable viewport progress calculation (for animations) */
	enableViewportProgress?: boolean
	/** Optional: Debounce delay in milliseconds (default: 0, uses RAF) */
	debounceDelay?: number
}

export interface UseSectionMetricsReturn {
	/** Array of section metrics, ordered by sectionIds */
	metrics: SectionMetric[]
	/** Whether metrics are ready (at least one section measured) */
	isReady: boolean
	/** Get metric for a specific section ID */
	getMetric: (sectionId: string) => SectionMetric | undefined
	/** Re-measure all sections manually (useful for dynamic content) */
	remount: () => void
}

/**
 * useSectionMetrics Hook
 * 
 * Measures and tracks section positions, dimensions, and viewport state.
 * Automatically updates on scroll, resize, and content changes.
 * 
 * @param options - Configuration options
 * @returns Section metrics and utilities
 * 
 * @example
 * ```tsx
 * const { metrics, isReady, getMetric } = useSectionMetrics({
 *   sectionIds: ['hero', 'about', 'contact'],
 *   scrollOffset: 112, // Fixed header height
 *   enableViewportProgress: true // For animations
 * })
 * 
 * // Use in component
 * {isReady && metrics.map(metric => (
 *   <Section key={metric.id} style={{ opacity: metric.viewportProgress }}>
 *     Content
 *   </Section>
 * ))}
 * ```
 */
export function useSectionMetrics({
	sectionIds,
	scrollOffset = 0,
	enableViewportProgress = false,
	debounceDelay = 0,
}: UseSectionMetricsOptions): UseSectionMetricsReturn {
	const [metrics, setMetrics] = useState<SectionMetric[]>([])
	const [isReady, setIsReady] = useState(false)
	const rafIdRef = useRef<number | null>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const resizeObserverRef = useRef<ResizeObserver | null>(null)
	const mutationObserverRef = useRef<MutationObserver | null>(null)
	const sectionIdsRef = useRef<readonly string[]>(sectionIds)
	const enableViewportProgressRef = useRef(enableViewportProgress)

	// Create stable string representation for dependency comparison
	// FAANG approach: Memoize array comparison to prevent unnecessary re-runs
	const sectionIdsKey = useMemo(() => sectionIds.join(','), [sectionIds])

	// Update refs when values change (for stable closures)
	useEffect(() => {
		sectionIdsRef.current = sectionIds
		enableViewportProgressRef.current = enableViewportProgress
	}, [sectionIds, enableViewportProgress])

	/**
	 * Measure all sections and calculate metrics
	 * Industry best practice: Single measurement function, reusable for multiple purposes
	 * FAANG approach: DRY principle - measure once, use everywhere
	 * Optimized: useCallback with refs to prevent stale closures
	 */
	const measureSections = useCallback(() => {
		if (typeof window === 'undefined') return

		try {
			const scrollTop = window.scrollY || document.documentElement.scrollTop
			const windowHeight = window.innerHeight
			const viewportTop = scrollTop
			const viewportBottom = scrollTop + windowHeight

			const newMetrics: SectionMetric[] = []
			const currentSectionIds = sectionIdsRef.current
			const shouldCalculateViewportProgress = enableViewportProgressRef.current

			// Use refs to avoid stale closures
			currentSectionIds.forEach((sectionId, index) => {
				const element = document.getElementById(sectionId)
				if (!element) return

				try {
					const rect = element.getBoundingClientRect()

					// Only measure if element has valid dimensions
					if (rect.height > 0 && rect.width > 0) {
						const top = scrollTop + rect.top
						const bottom = top + rect.height
						const height = rect.height
						const center = top + height / 2

						// Calculate viewport state (for animations)
						let isInViewport = false
						let viewportProgress = 0

						if (shouldCalculateViewportProgress) {
							// Section is in viewport if any part is visible
							isInViewport = bottom > viewportTop && top < viewportBottom

							if (isInViewport) {
								// Calculate progress: 0 = section top entering viewport, 1 = section bottom leaving viewport
								const sectionTopInViewport = Math.max(0, viewportTop - top)
								const sectionBottomInViewport = Math.min(height, viewportBottom - top)
								const visibleHeight = sectionBottomInViewport - sectionTopInViewport
								viewportProgress = Math.min(1, Math.max(0, visibleHeight / height))
							} else if (top < viewportTop) {
								// Section is above viewport
								viewportProgress = 0
							} else {
								// Section is below viewport
								viewportProgress = 1
							}
						}

						newMetrics.push({
							id: sectionId,
							top,
							bottom,
							height,
							index,
							center,
							isInViewport,
							viewportProgress,
						})
					}
				} catch (error) {
					// Silently skip elements that fail to measure
					// Prevents one bad element from breaking entire measurement
					console.warn(`Failed to measure section ${sectionId}:`, error)
				}
			})

			// Sort by top position to ensure correct order
			newMetrics.sort((a, b) => a.top - b.top)

			// Optimized state update: Only update if metrics actually changed
			// FAANG approach: Efficient comparison using JSON.stringify for deep equality
			// Note: For small arrays, this is more efficient than manual comparison
			setMetrics((prevMetrics) => {
				// Quick length check first (most common case)
				if (prevMetrics.length !== newMetrics.length) {
					return newMetrics
				}

				// Deep equality check (optimized for small arrays)
				// For larger arrays, consider using a more sophisticated comparison
				const hasChanged = prevMetrics.some((prev, i) => {
					const next = newMetrics[i]
					if (!next) return true
					// Use epsilon comparison for floating point numbers
					return (
						prev.id !== next.id ||
						Math.abs(prev.top - next.top) > 0.5 ||
						Math.abs(prev.bottom - next.bottom) > 0.5 ||
						Math.abs(prev.height - next.height) > 0.5 ||
						prev.isInViewport !== next.isInViewport ||
						Math.abs(prev.viewportProgress - next.viewportProgress) > 0.01
					)
				})

				return hasChanged ? newMetrics : prevMetrics
			})

			setIsReady((prev) => {
				const newReady = newMetrics.length > 0
				return prev !== newReady ? newReady : prev
			})
		} catch (error) {
			// Error handling: Log but don't crash
			console.error('Error in measureSections:', error)
		}
	}, []) // Empty deps - uses refs to avoid stale closures

	/**
	 * Throttled measurement function
	 * Industry best practice: RAF throttling for smooth performance
	 * Optimized: useCallback to prevent unnecessary re-creations
	 */
	const throttledMeasure = useCallback(() => {
		if (debounceDelay > 0) {
			// Debounced measurement
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			timeoutRef.current = setTimeout(() => {
				measureSections()
			}, debounceDelay)
		} else {
			// RAF throttled measurement (default, smoother)
			if (rafIdRef.current === null) {
				rafIdRef.current = requestAnimationFrame(() => {
					measureSections()
					rafIdRef.current = null
				})
			}
		}
	}, [debounceDelay, measureSections])

	useEffect(() => {
		if (typeof window === 'undefined' || sectionIds.length === 0) {
			setMetrics([])
			setIsReady(false)
			return
		}

		// Initial measurement - optimized strategy for robustness
		// Industry best practice: Ensure DOM is fully loaded before measuring
		// FAANG approach: Smart measurement strategy (immediate + delayed fallback)
		let cleanupTimeouts: (() => void) | undefined

		// Try immediate measurement
		measureSections()

		// Use MutationObserver for dynamic content (more efficient than multiple timeouts)
		// Industry best practice: Observe DOM changes for late-rendering content
		// FAANG approach: Targeted observation (only observe sections, not entire body)
		// Optimized: Observe only section containers to reduce performance impact
		let mutationObserver: MutationObserver | null = null
		
		try {
			mutationObserver = new MutationObserver(() => {
				// Re-measure when DOM changes (handles lazy-loaded content, images, etc.)
				throttledMeasure()
			})

			// Observe only the sections we care about (more efficient than entire body)
			// This reduces the number of mutation events we need to process
			const currentSectionIds = sectionIdsRef.current
			currentSectionIds.forEach((sectionId) => {
				const element = document.getElementById(sectionId)
				if (element) {
					// Observe only this element and its children (not entire document)
					mutationObserver?.observe(element, {
						childList: true,
						subtree: true,
						attributes: false, // Only watch for new elements, not attribute changes
						characterData: false, // Don't watch text changes
					})
				}
			})

			mutationObserverRef.current = mutationObserver
		} catch (error) {
			// Fallback if MutationObserver is not supported
			console.warn('MutationObserver not supported, using fallback strategy:', error)
		}

		// Single delayed fallback for edge cases (reduced from 3 timeouts to 1)
		const fallbackTimeout = setTimeout(() => {
			measureSections()
		}, 100)

		cleanupTimeouts = () => {
			clearTimeout(fallbackTimeout)
		}

		// Setup ResizeObserver for dynamic content changes
		// Industry best practice: Observe DOM changes for accurate measurements
		// FAANG approach: ResizeObserver for comprehensive coverage
		// Optimized: Use callback refs pattern for better cleanup
		const resizeObserver = new ResizeObserver(() => {
			throttledMeasure()
		})

		// Observe all sections for size changes
		// Industry best practice: Batch DOM queries for performance
		const elementsToObserve: HTMLElement[] = []
		sectionIds.forEach((sectionId) => {
			const element = document.getElementById(sectionId)
			if (element) {
				elementsToObserve.push(element)
				resizeObserver.observe(element)
			}
		})

		resizeObserverRef.current = resizeObserver

		// Setup scroll listener (for viewport progress updates)
		// Industry best practice: Passive listeners for performance
		const handleScroll = () => {
			if (enableViewportProgress) {
				throttledMeasure()
			}
		}

		// Setup resize listener
		const handleResize = () => {
			throttledMeasure()
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleResize, { passive: true })

		// Cleanup
		return () => {
			cleanupTimeouts?.()
			if (mutationObserverRef.current) {
				mutationObserverRef.current.disconnect()
				mutationObserverRef.current = null
			}
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect()
				resizeObserverRef.current = null
			}
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleResize)
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current)
				rafIdRef.current = null
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
		}
	}, [
		// Use stable comparison for sectionIds (compare by content, not reference)
		// FAANG approach: Memoized string key for efficient comparison
		// sectionIdsKey ensures we only re-run when section IDs actually change (content-wise)
		// sectionIds is also included to satisfy linter (refs are updated separately)
		sectionIdsKey,
		sectionIds, // Included for linter, but effect uses sectionIdsRef.current to avoid stale closures
		scrollOffset,
		enableViewportProgress,
		debounceDelay,
		measureSections,
		throttledMeasure,
	])

	/**
	 * Get metric for a specific section ID
	 * Optimized: useMemo for O(1) lookup instead of O(n) find
	 */
	const metricsMap = useMemo(() => {
		const map = new Map<string, SectionMetric>()
		metrics.forEach((metric) => {
			map.set(metric.id, metric)
		})
		return map
	}, [metrics])

	/**
	 * Get metric for a specific section ID
	 * Optimized: O(1) lookup using Map instead of O(n) array find
	 */
	const getMetric = useCallback(
		(sectionId: string): SectionMetric | undefined => {
			return metricsMap.get(sectionId)
		},
		[metricsMap]
	)

	/**
	 * Force re-measurement (useful for dynamic content)
	 * Optimized: useCallback to prevent unnecessary re-creations
	 */
	const remount = useCallback(() => {
		measureSections()
	}, [measureSections])

	return {
		metrics,
		isReady,
		getMetric,
		remount,
	}
}

