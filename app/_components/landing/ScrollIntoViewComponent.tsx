'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import PageContainer from '@_components/layouts/PageContainer'
import { useScrollSpy, useKeyboardNavigation, useElementRefs, useMediaQuery, useSectionMetrics, useScrollProgress } from '@_shared/hooks'
import { getCSSVariable, calculateScrollOffset } from '@_shared/utils/scrollUtils'
import classNames from 'classnames'

/**
 * Section configuration for navigation
 */
const SECTIONS = [
	{ id: 'hero', label: 'Overview' },
	{ id: 'featured-products', label: 'Featured Products' },
	{ id: 'why-medsource', label: 'Why MedSource' },
	{ id: 'categories', label: 'Categories' },
	{ id: 'faq', label: 'FAQ' },
	{ id: 'contact', label: 'Contact' },
] as const

/**
 * ScrollIntoViewComponent
 *
 * Elegant multi-variant navigation component with scroll spy functionality.
 * Provides quick anchor links to major landing page sections with active state indication.
 * Designed with industry best practices for elegant, powerful navigation (inspired by Apple, Stripe, Vercel, GitHub).
 *
 * **Responsive Variants (Progressive Enhancement):**
 * 1. **Mobile (< 768px)**: Sticky bottom horizontal scroll navigation
 * 2. **Medium (768px - 1279px)**: Sticky bottom centered horizontal navigation
 * 3. **Large (1280px+ with insufficient whitespace)**: Sticky bottom centered navigation (fallback)
 * 4. **Large (1280px+ with sufficient whitespace ≥150px)**: Fixed vertical timeline sidebar with progress indicator
 * 
 * **Navigation Availability:**
 * - Navigation is ALWAYS visible (industry best practice)
 * - Bottom navigation serves as fallback when timeline cannot display
 * - Progressive enhancement: timeline appears when space allows
 *
 * **Design Philosophy:**
 * - Mobile-first: Optimized for thumb-friendly navigation
 * - Elegant: Text links (not buttons) matching Navbar pattern
 * - Visual feedback: Subtle animations and progress indicators
 * - Accessible: Full keyboard navigation, ARIA labels, screen reader support
 * - Performance: Intersection Observer API, throttled scroll events
 *
 * **Mobile Variant (< 768px):**
 * - Fixed bottom navigation bar (follows user on scroll)
 * - Horizontal scroll with edge-to-edge padding
 * - Touch-friendly tap targets (44px minimum)
 * - Hidden scrollbar for clean appearance
 * - Subtle text color (base-content/70) for inactive items
 * - Elegant underline animation on hover and active
 *
 * **Medium Variant (768px - 1279px):**
 * - Fixed bottom navigation bar (follows user on scroll)
 * - Centered horizontal navigation with elegant spacing
 * - Full text color (base-content) for inactive items
 * - Spacing scales: gap-8 → lg:gap-10
 * - Elegant underline animation on hover and active
 *
 * **Large Variant (1280px+ with sufficient whitespace for labels):**
 * - Appears ONLY when viewport is 1280px+ AND labels can be displayed without overlap
 * - Conservative detection: Timeline only shows when labels are safe to display
 * - Mobile-first: Falls back to bottom navigation if labels would overlap
 * - Fixed vertical timeline on left side (in whitespace)
 * - Minimalist line-only design (inspired by Apple, Stripe, Vercel)
 * - Smooth progress line that interpolates between sections as user scrolls
 * - Pure typography approach: Labels are the ONLY visual indicators
 * - Active state: Bold, primary color, slightly larger text
 * - Past state: Medium weight, muted primary color
 * - Future state: Normal weight, subtle base color
 * - Smooth, hardware-accelerated animations for state transitions
 * - Elegant typography and color transitions (300-400ms duration)
 * - Industry best practice: Ultra-minimalist, elegant, professional design
 *
 * **Features:**
 * - Scroll spy: Automatically highlights current section as user scrolls
 * - Progress tracking: Visual progress indicator (large screens)
 * - Active state indication: Primary color + visual feedback
 * - Smooth scroll: Smooth scrolling with header offset calculation
 * - Keyboard navigation: Full keyboard support (Arrow keys, Enter, Space)
 * - Accessibility: ARIA labels, screen reader support, focus management
 * - Performance: Uses Intersection Observer API (better than scroll listeners)
 * - Modern design: Elegant styling with smooth animations
 *
 * **Accessibility:**
 * - ARIA labels for screen readers
 * - Keyboard navigation (Arrow keys, Enter, Space)
 * - Focus indicators with proper offset
 * - Respects reduced motion preferences
 *
 * **Performance:**
 * - Intersection Observer API (more efficient than scroll listeners)
 * - requestAnimationFrame for smooth scroll updates (60fps)
 * - Hardware-accelerated animations (GPU-accelerated transforms)
 * - Optimized scroll handling (only updates on significant position changes)
 * - Debounced state updates
 * - Automatic cleanup on unmount
 *
 * **Purpose:**
 * - Provides quick navigation to major page sections
 * - Shows user's position in the page (progress indicator)
 * - Enhances UX by reducing scroll distance to navigate
 * - Improves discoverability of page sections
 * - Maintains context as user scrolls
 * - Creates visual hierarchy and guides user through content
 *
 * **Strengths:**
 * - Responsive design adapts to screen size (mobile-first approach)
 * - Multiple variants optimized for different screen sizes
 * - Elegant visual feedback and smooth animations
 * - Accessible and keyboard-friendly (WCAG compliant)
 * - Performance-optimized (Intersection Observer + requestAnimationFrame)
 * - Smooth scroll progress interpolation (FAANG-level implementation)
 * - Progressive enhancement (always provides navigation)
 * - Hardware-accelerated animations (60fps performance)
 * - Dynamic whitespace detection prevents content overlap
 * - Graceful fallback to bottom navigation when needed
 *
 * **Weaknesses:**
 * - Fixed positioning may overlap content on very small screens (mitigated by whitespace detection)
 * - Timeline may be less visible on some backgrounds (acceptable trade-off)
 * - Requires JavaScript for full functionality (progressive enhancement mitigates)
 * - Complex scroll calculation may have slight performance impact (optimized with RAF)
 *
 * **How It Serves the Application:**
 * - **Navigation:** Primary navigation tool for long-form landing pages
 * - **User Orientation:** Visual progress indicator helps users understand page structure
 * - **Engagement:** Smooth animations create polished, professional experience
 * - **Accessibility:** Multiple navigation methods (click, keyboard, scroll spy)
 * - **Responsive:** Adapts seamlessly across all device sizes
 * - **Performance:** Optimized for 60fps smooth scrolling
 *
 * **Industry Comparison:**
 * - **Apple:** Similar smooth progress indicators in documentation sites
 * - **Stripe:** Progressive enhancement navigation patterns
 * - **Vercel:** Smooth scroll spy with timeline indicators
 * - **GitHub:** Section navigation with active state indicators
 * - **FAANG Standards:** Mobile-first, accessible, performant, progressive enhancement
 *
 * **Smooth Animation System:**
 * - Progress line interpolates smoothly between sections based on viewport center
 * - Active node transitions smoothly with scale and color animations (300ms)
 * - Hardware acceleration via translateZ(0) and will-change properties
 * - Respects prefers-reduced-motion for accessibility
 * - 60fps performance via requestAnimationFrame
 *
 * **Future Enhancements:**
 * - Add scroll progress percentage indicator
 * - Add section preview tooltips on hover
 * - Add keyboard shortcuts for navigation
 * - Add section completion indicators
 * - Add analytics tracking for navigation usage
 * - Add customizable positioning (left/right)
 * - Add animation customization options
 * - Add section height-based progress weighting
 *
 * @module ScrollIntoViewComponent
 */
export default function ScrollIntoViewComponent() {
	const navRef = useRef<HTMLElement>(null)
	const timelineRef = useRef<HTMLDivElement>(null)
	const labelRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
	const currentIndexRef = useRef<number>(0)
		const scrollWrapperRef = useRef<HTMLDivElement>(null)
	const [scrollProgress, setScrollProgress] = useState(0)
	const [hasWhitespace, setHasWhitespace] = useState(false)
	const [shouldShowLabels, setShouldShowLabels] = useState(false)
	const [isTimelineVisible, setIsTimelineVisible] = useState(false)
	const [shouldAnimate, setShouldAnimate] = useState(false)
		const [isOverflowing, setIsOverflowing] = useState(false)

	// Detect if viewport is large enough for timeline (xl: 1280px+)
	// Industry best practice: Progressive enhancement - show timeline when space allows
	// Lowered from 2xl to xl to ensure navigation is always available
	const isLargeScreen = useMediaQuery('(min-width: 1280px)')
	
	// Detect reduced motion preference (for accessibility)
	const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
		// Treat sub-700px as "narrow" where horizontal scrolling is preferred
		const isNarrowMobile = useMediaQuery('(max-width: 700px)')

	// Get navbar height for scroll offset (from CSS variable)
	const navbarHeight = getCSSVariable('--nav-height', 96)
	const scrollOffset = calculateScrollOffset(navbarHeight, 16)

	// Use element refs hook for button management
	const { getRef: getButtonRef, getElement: getButtonElement } = useElementRefs<HTMLAnchorElement>()

	// Use scroll spy hook (must be before whitespace detection to avoid dependency issues)
	// Industry best practice: Adjust rootMargin to account for scroll offset
	// When scrolling to a section, it should immediately become active
	// rootMargin: top margin accounts for offset, bottom margin keeps section active longer
	// Calculation: offset (112px) + small buffer (16px) = ~128px = ~12% of typical viewport (1080px)
	// More lenient bottom margin (-60%) allows section to stay active longer
	const { activeSection, scrollToSection, isSectionActive } = useScrollSpy({
		sectionIds: SECTIONS.map((s) => s.id),
		rootMargin: `-${scrollOffset + 16}px 0px -60% 0px`, // Account for offset + buffer, lenient bottom
		threshold: 0,
		offset: scrollOffset,
		debounceDelay: 50, // Reduced delay for more responsive updates
	})

	// Progressive enhancement: Timeline only appears when labels can be displayed without overlap
	// Industry best practice: Mobile-first - bottom navigation is default, timeline is enhancement
	// FAANG approach: Conservative detection - only show timeline when labels are safe to display
	// If labels would overlap, keep bottom navigation (consistent UX across all screen sizes)
	useEffect(() => {
		if (!isLargeScreen) {
			setHasWhitespace(false)
			setIsTimelineVisible(false)
			setShouldAnimate(false)
			setShouldShowLabels(false)
			return
		}

		const checkWhitespaceAndOverlap = () => {
			if (typeof window === 'undefined') return

			const viewportWidth = window.innerWidth
			
			// Find main content container (multiple fallback strategies for robustness)
			let mainContent: HTMLElement | null = null
			const selectors = [
				'[class*="container"][class*="mx-auto"]', // PageContainer pattern
				'main', // Main element
				'[id="page-content"]', // Explicit page content ID
				'[class*="PageContainer"]', // Direct PageContainer class
			]
			
			for (const selector of selectors) {
				const element = document.querySelector(selector) as HTMLElement
				if (element) {
					const rect = element.getBoundingClientRect()
					if (rect.width > 0 && rect.width < viewportWidth * 0.95) {
						mainContent = element
						break
					}
				}
			}
			
			let newHasWhitespace = false
			let newShouldShowLabels = false
			
			try {
				if (mainContent) {
					const containerRect = mainContent.getBoundingClientRect()
					const leftWhitespace = containerRect.left
					const contentLeftEdge = containerRect.left
					
					// Minimum space for timeline line (2px) + padding (left-4 = 16px) + spacing
					const minSpaceForTimeline = 80
					
					// First check: Is there enough space for the timeline line?
					if (leftWhitespace >= minSpaceForTimeline) {
						// Second check: Can labels be displayed without overlap?
						// Industry best practice: Use actual measurements when available, estimate otherwise
						// FAANG approach: Two-phase - estimate first, verify with actual measurements
						const SAFETY_MARGIN = 10 // 10px offset as requested
						let hasOverlap = false
						
						// Phase 1: Try to measure actual labels (if timeline is already rendered)
						if (timelineRef.current) {
							// Check all labels - early exit if any would overlap
							for (const section of SECTIONS) {
								const labelElement = labelRefs.current.get(section.id)
								if (!labelElement) continue
								
								const labelRect = labelElement.getBoundingClientRect()
								const labelRightEdge = labelRect.right
								
								// If ANY label (including active) would overlap, keep bottom navigation
								if (labelRightEdge + SAFETY_MARGIN > contentLeftEdge) {
									hasOverlap = true
									break // Early exit - no need to check others
								}
							}
						} else {
							// Phase 2: Estimate label widths when timeline not yet rendered
							// Calculate estimated maximum label width
							// Timeline position varies: left-4 (16px) on xl, left-8 (32px) on 2xl
							// Use current viewport to determine position
							const timelineLeftOffset = viewportWidth >= 1536 ? 32 : 16 // 2xl breakpoint
							const timelineLeftPosition = timelineLeftOffset + 2 + 24 // offset + line (2px) + pl-6 (24px)
							
							// Find longest label text to estimate maximum width
							const longestLabelLength = Math.max(...SECTIONS.map(s => s.label.length))
							// Estimate: ~7-9px per character depending on font weight
							// Active labels are text-base (16px), inactive are text-sm (14px)
							// Use conservative estimate: 9px per character for active (worst case)
							const estimatedLabelWidth = longestLabelLength * 9
							const estimatedLabelRightEdge = timelineLeftPosition + estimatedLabelWidth
							
							// Check if estimated label would overlap
							hasOverlap = estimatedLabelRightEdge + SAFETY_MARGIN > contentLeftEdge
						}
						
						// Timeline only appears if labels can be displayed without overlap
						// If labels would overlap, keep bottom navigation (mobile-first approach)
						newShouldShowLabels = !hasOverlap
						newHasWhitespace = newShouldShowLabels // Only show timeline if labels are safe
					} else {
						// Not enough space even for timeline line - use bottom navigation
						newHasWhitespace = false
						newShouldShowLabels = false
					}
				} else {
					// Fallback: Use viewport width heuristic (conservative)
					// Only show timeline on very wide screens where labels are likely safe
					const hasEnoughSpace = viewportWidth >= 1600
					newHasWhitespace = hasEnoughSpace
					newShouldShowLabels = hasEnoughSpace
				}
			} catch (error) {
				// Error handling: fallback to bottom navigation (safe default)
				console.warn('[ScrollIntoView] Whitespace detection error:', error)
				newHasWhitespace = false
				newShouldShowLabels = false
			}

			// Track timeline visibility for animation
			const wasVisible = isTimelineVisible
			const willBeVisible = newHasWhitespace

			setHasWhitespace(newHasWhitespace)
			setShouldShowLabels(newShouldShowLabels)
			
			// Trigger animation when timeline becomes visible
			if (!wasVisible && willBeVisible) {
				setIsTimelineVisible(true)
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						setShouldAnimate(true)
					})
				})
			} else if (wasVisible && !willBeVisible) {
				setIsTimelineVisible(false)
				setShouldAnimate(false)
			} else if (willBeVisible && !shouldAnimate) {
				setIsTimelineVisible(true)
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						setShouldAnimate(true)
					})
				})
			}
		}

		// Initial check (delay ensures DOM is ready)
		const timeoutId = setTimeout(checkWhitespaceAndOverlap, 150)

		// Throttled updates for performance (mobile-first: lightweight)
		let rafId: number | null = null
		const throttledCheck = () => {
			if (rafId === null) {
				rafId = requestAnimationFrame(() => {
					checkWhitespaceAndOverlap()
					rafId = null
				})
			}
		}

		window.addEventListener('resize', throttledCheck, { passive: true })
		window.addEventListener('scroll', throttledCheck, { passive: true })

		return () => {
			clearTimeout(timeoutId)
			window.removeEventListener('resize', throttledCheck)
			window.removeEventListener('scroll', throttledCheck)
			if (rafId !== null) {
				cancelAnimationFrame(rafId)
			}
		}
	}, [isLargeScreen, isTimelineVisible, shouldAnimate])

	// Verification step: Re-check with actual measurements after timeline renders
	// Industry best practice: Two-phase verification - estimate first, verify with actual DOM
	// This ensures accuracy after initial render
	useEffect(() => {
		if (!isLargeScreen || !hasWhitespace || !timelineRef.current) return

		// Small delay to ensure labels are rendered and measured
		const verifyTimeout = setTimeout(() => {
			const mainContent = document.querySelector('[class*="container"][class*="mx-auto"]') as HTMLElement ||
				document.querySelector('main') as HTMLElement ||
				document.querySelector('[id="page-content"]') as HTMLElement

			if (!mainContent) return

			const containerRect = mainContent.getBoundingClientRect()
			const contentLeftEdge = containerRect.left
			const SAFETY_MARGIN = 10
			let hasOverlap = false

			// Verify with actual measurements
			for (const section of SECTIONS) {
				const labelElement = labelRefs.current.get(section.id)
				if (!labelElement) continue

				const labelRect = labelElement.getBoundingClientRect()
				const labelRightEdge = labelRect.right

				if (labelRightEdge + SAFETY_MARGIN > contentLeftEdge) {
					hasOverlap = true
					break
				}
			}

			// If actual measurements show overlap, hide timeline and show bottom nav
			if (hasOverlap) {
				setHasWhitespace(false)
				setShouldShowLabels(false)
				setIsTimelineVisible(false)
				setShouldAnimate(false)
			}
		}, 200) // Delay to ensure DOM is ready

		return () => clearTimeout(verifyTimeout)
	}, [isLargeScreen, hasWhitespace, shouldShowLabels])

	// Enhanced ref callback that stores label refs for overlap detection
	// Industry best practice: Separate refs for different purposes (navigation vs measurement)
	const getLabelRef = useCallback((sectionId: string) => {
		return (element: HTMLAnchorElement | null) => {
			if (element) {
				labelRefs.current.set(sectionId, element)
			} else {
				labelRefs.current.delete(sectionId)
			}
			// Also set the navigation ref
			getButtonRef(sectionId)(element)
		}
	}, [getButtonRef])

	// Reusable section metrics hook - DRY, scalable, future-proof
	// Industry best practice: Single source of truth for section positions
	// FAANG approach: Reusable hook for scroll-triggered animations
	// Future-ready: Can be used for beautiful scroll animations
	const { metrics: sectionMetrics, isReady: metricsReady, getMetric } = useSectionMetrics({
		sectionIds: SECTIONS.map((s) => s.id),
		scrollOffset,
		enableViewportProgress: false, // Enable in future for animations
	})

	// Reusable scroll progress hook - DRY, scalable, future-proof
	// Industry best practice: Single source of truth for scroll progress
	// FAANG approach: Pixel-perfect scrollbar synchronization
	// Future-ready: Can be used for progress bars, animations, etc.
	const { progress: smoothTimelineProgress, scrollTop } = useScrollProgress({
		throttleMs: 16, // ~60fps
		enableImmediateUpdates: true, // For scrollbar drag
	})

	// Single source of truth for active section with user intent priority
	// FAANG approach: User intent (click) always takes priority over scroll-based detection
	// Industry best practice: Only use scroll-based detection during natural scrolling
	// 
	// Priority order:
	// 1. User intent (clicked section) - highest priority, immediate
	// 2. Scroll-based detection (natural scrolling) - secondary, after scroll settles
	// 3. Intersection Observer (fallback) - tertiary, when metrics not ready
	const [userIntentSection, setUserIntentSection] = useState<string | null>(null)
	const userIntentTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	// Enhanced active section detection: Synchronize with timeline progress
	// Industry best practice: Active section should align with timeline position
	// FAANG approach: Use section metrics for accurate detection, but respect user intent
	// DRY: Reuses section metrics hook instead of duplicating measurement logic
	const [enhancedActiveSection, setEnhancedActiveSection] = useState<string | null>(activeSection)

	useEffect(() => {
		// If user has explicitly clicked a section, don't override with scroll-based detection
		// User intent takes priority - this ensures clicked sections stay active
		if (userIntentSection) {
			setEnhancedActiveSection(userIntentSection)
			return
		}

		if (!metricsReady || sectionMetrics.length === 0) {
			// Fallback to Intersection Observer if metrics not ready
			setEnhancedActiveSection(activeSection)
			return
		}

		// Calculate which section should be active based on scroll position
		// Industry best practice: Section becomes active when scroll position reaches it
		// Use section metrics from hook (DRY principle)
		// Only applies during natural scrolling (not when user has clicked)
		let determinedSection: string | null = null

		// Calculate scroll reference (accounting for offset)
		const scrollReference = scrollTop + scrollOffset

		// Iterate backwards to find the last section we've passed
		// This ensures we get the most recent section we've reached
		for (let i = sectionMetrics.length - 1; i >= 0; i--) {
			const metric = sectionMetrics[i]
			
			// If scroll position has reached or passed this section's top
			// The section should be active when we've scrolled to it
			// Use a small buffer (16px) to account for timing differences
			if (scrollReference >= metric.top - 16) {
				determinedSection = metric.id
				break
			}
		}

		// Special case: If we're at or near the bottom (timeline at 100%)
		// The last section should always be active
		if (smoothTimelineProgress >= 95 && sectionMetrics.length > 0) {
			determinedSection = sectionMetrics[sectionMetrics.length - 1]?.id || null
		}

		// Fallback to first section if we're before all sections
		if (!determinedSection) {
			determinedSection = sectionMetrics[0]?.id || null
		}

		// Use timeline-based detection for visual alignment
		// This ensures timeline and active section are perfectly synchronized
		// When timeline reaches a section, that section becomes active
		setEnhancedActiveSection(determinedSection)
	}, [activeSection, scrollOffset, scrollTop, smoothTimelineProgress, sectionMetrics, metricsReady, userIntentSection])

	// Single source of truth: Determine final active section with priority
	// FAANG approach: User intent > Enhanced detection > Intersection Observer
	// Industry best practice: Clear priority order ensures consistent behavior
	const finalActiveSection = useMemo(() => {
		// Priority 1: User intent (clicked section) - highest priority
		if (userIntentSection) {
			return userIntentSection
		}
		
		// Priority 2: Enhanced detection (scroll-based, timeline-aligned)
		if (enhancedActiveSection) {
			return enhancedActiveSection
		}
		
		// Priority 3: Intersection Observer (fallback)
		return activeSection
	}, [userIntentSection, enhancedActiveSection, activeSection])

	// Calculate active section index for timeline progress
	const activeSectionIndex = useMemo(() => {
		if (!finalActiveSection) return 0
		const index = SECTIONS.findIndex((s) => s.id === finalActiveSection)
		return index >= 0 ? index : 0
	}, [finalActiveSection])

	// Enhanced section active check: Uses single source of truth
	// Industry best practice: Single function, single source of truth
	// FAANG approach: Clear, predictable active state determination
	const isSectionActiveEnhanced = useCallback(
		(sectionId: string) => {
			return finalActiveSection === sectionId
		},
		[finalActiveSection]
	)

	// Cleanup user intent timeout on unmount
	useEffect(() => {
		return () => {
			if (userIntentTimeoutRef.current) {
				clearTimeout(userIntentTimeoutRef.current)
			}
		}
	}, [])

	// Sync scroll progress state with useScrollProgress hook
	// Industry best practice: Single source of truth for scroll progress
	useEffect(() => {
		setScrollProgress(smoothTimelineProgress)
	}, [smoothTimelineProgress, setScrollProgress])

	// Use keyboard navigation hook
	const { handleKeyDown: handleKeyboardNavigation } = useKeyboardNavigation({
		items: SECTIONS,
		getItemId: (item) => item.id,
		onSelect: (item, index) => {
			currentIndexRef.current = index
			const button = getButtonElement(item.id)
			if (button) {
				button.focus()
				scrollToSection(item.id)
			}
		},
		preventDefault: true,
		wrapAround: true,
	})

	/**
	 * Handle keyboard navigation with focus management
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLAnchorElement>, sectionId: string, index: number) => {
			const newIndex = handleKeyboardNavigation(e, index)
			if (newIndex !== null) {
				currentIndexRef.current = newIndex
			}
		},
		[handleKeyboardNavigation]
	)

	/**
	 * Handle click with smooth scroll
	 * FAANG approach: User intent takes priority - clicked section is immediately active
	 * Industry best practice: Single source of truth with user intent priority
	 * Ensures clicked section stays active until scroll completes and natural detection takes over
	 */
	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
			e.preventDefault()
			
			// FAANG approach: Set user intent immediately - highest priority
			// This ensures the clicked section is active immediately, no matter what
			setUserIntentSection(sectionId)
			
			// Clear any existing timeout
			if (userIntentTimeoutRef.current) {
				clearTimeout(userIntentTimeoutRef.current)
			}

			// Scroll to section
			scrollToSection(sectionId)

			// Update current index for keyboard navigation
			const index = SECTIONS.findIndex((s) => s.id === sectionId)
			if (index !== -1) {
				currentIndexRef.current = index
			}

			// Industry best practice: Clear user intent after scroll completes
			// This allows natural scroll-based detection to take over after animation
			// Smooth scroll typically takes 300-500ms, so clear after 800ms to be safe
			const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
			const clearIntentDelay = prefersReducedMotion ? 200 : 800

			userIntentTimeoutRef.current = setTimeout(() => {
				// Clear user intent - allow natural scroll-based detection to take over
				setUserIntentSection(null)
				userIntentTimeoutRef.current = null
				
				// Force Intersection Observer to re-check by triggering a scroll event
				// This ensures the observer updates even if the section is at the exact boundary
				const element = document.getElementById(sectionId)
				if (element) {
					// Small scroll (1px) to trigger observer without visual movement
					// This is a common pattern for forcing Intersection Observer updates
					const currentScroll = window.scrollY
					window.scrollTo({ top: currentScroll + 1, behavior: 'auto' })
					requestAnimationFrame(() => {
						window.scrollTo({ top: currentScroll, behavior: 'auto' })
					})
				}
			}, clearIntentDelay)
		},
		[scrollToSection]
	)

	/**
	 * Sync current index with active section
	 * Uses single source of truth (finalActiveSection) for consistency
	 */
	useEffect(() => {
		if (finalActiveSection) {
			const index = SECTIONS.findIndex((s) => s.id === finalActiveSection)
			if (index !== -1) {
				currentIndexRef.current = index
			}
		}
	}, [finalActiveSection])

	// Detect horizontal overflow for mobile wrapper to decide between centering and scrolling
	useEffect(() => {
		const el = scrollWrapperRef.current
		if (!el) return

		const checkOverflow = () => {
			// If wrapper is narrower than content, enable scroll behavior
			setIsOverflowing(el.scrollWidth > el.clientWidth + 1)
		}

		checkOverflow()
		// Re-check shortly after mount for late layout shifts (e.g., fonts, images)
		const postMountId = window.setTimeout(checkOverflow, 250)

		// Resize-based re-check
		let rafId: number | null = null
		const onResize = () => {
			if (rafId === null) {
				rafId = requestAnimationFrame(() => {
					checkOverflow()
					rafId = null
				})
			}
		}

		window.addEventListener('resize', onResize, { passive: true })
		// Also observe size changes of the wrapper itself, if supported
		let ro: ResizeObserver | null = null
		try {
			if (typeof ResizeObserver !== 'undefined') {
				ro = new ResizeObserver(onResize)
				ro.observe(el)
			}
		} catch {
			// No-op: gracefully degrade without ResizeObserver
		}

		return () => {
			window.clearTimeout(postMountId)
			window.removeEventListener('resize', onResize)
			if (rafId !== null) cancelAnimationFrame(rafId)
			if (ro) ro.disconnect()
		}
	}, [])

	return (
		<>
			{/* Mobile & Medium & Large (when timeline unavailable): Sticky Bottom Navigation */}
			{/* Mobile (< 768px): Horizontal scroll, sticky bottom */}
			{/* Medium (768px - 1279px): Centered horizontal, sticky bottom */}
			{/* Large (1280px+): Fallback when timeline cannot display (labels would overlap) */}
			{/* Industry best practice: Always provide navigation - never leave users without navigation */}
			{/* Mobile-first: Bottom nav is default, only hidden when timeline can safely display labels */}
		<nav
			ref={navRef}
				className={classNames(
					'fixed bottom-0 left-0 right-0 z-30 bg-base-100/95 backdrop-blur-sm border-t border-base-300/40 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]',
					// Hide bottom nav only when timeline is successfully displaying with labels
					// Mobile-first: Bottom nav is default, timeline is progressive enhancement
					{
						'hidden': isLargeScreen && hasWhitespace && shouldShowLabels && isTimelineVisible,
					}
				)}
			role="navigation"
			aria-label="Page sections navigation">
				{/* Mobile: Horizontal scroll with edge-to-edge padding */}
				<div className="md:hidden py-3">
					<PageContainer>
						<div
							ref={scrollWrapperRef}
							className={classNames(
								'-mx-4 px-4',
								// Enable horizontal scrolling on narrow screens or when content overflows
								{ 'overflow-x-auto scrollbar-hide touch-pan-x': isNarrowMobile || isOverflowing }
							)}
						>
							<div
								className={classNames(
									'mx-auto flex items-center gap-6',
									// When scrolling, keep items left-aligned and force content width
									{ 'min-w-max justify-start': isNarrowMobile || isOverflowing,
										// When it fits, center the options
										'justify-center': !(isNarrowMobile || isOverflowing)
									}
								)}
							>
					{SECTIONS.map((section, index) => {
						const isActive = isSectionActiveEnhanced(section.id)

						return (
							<a
								key={section.id}
								ref={getButtonRef(section.id)}
								href={`#${section.id}`}
								onClick={(e) => handleClick(e, section.id)}
								onKeyDown={(e) => handleKeyDown(e, section.id, index)}
								className={classNames(
												// Base styles - Elegant text link
												'relative inline-flex items-center',
												'px-0 py-2.5', // Vertical padding for touch target (44px min)
												'text-sm font-medium whitespace-nowrap',
									'min-h-[44px]', // WCAG touch target minimum
												'transition-colors duration-200 ease-out',
												'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100',
												// Underline animation (elegant, subtle)
												'after:absolute after:bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:opacity-0 after:transition-all after:duration-200 after:ease-out',
												// Hover state
												'hover:text-primary hover:after:opacity-100',
												// Active state
												{
													// Active: Primary color + visible underline
													'text-primary after:opacity-100': isActive,
													// Inactive: Base content color (subtle for mobile)
													'text-base-content/70': !isActive,
												}
											)}
											aria-current={isActive ? 'page' : undefined}
											aria-label={`Navigate to ${section.label} section`}>
											{section.label}
										</a>
									)
								})}
							</div>
						</div>
					</PageContainer>
				</div>

				{/* Medium & Large (fallback): Centered navigation with elegant spacing */}
				<PageContainer className="hidden md:block py-4">
					<div className="w-full text-center">
						<div className="mx-auto flex w-full items-center justify-center gap-8 lg:gap-10">
						{SECTIONS.map((section, index) => {
							const isActive = isSectionActiveEnhanced(section.id)

							return (
								<a
									key={section.id}
									ref={getButtonRef(section.id)}
									href={`#${section.id}`}
									onClick={(e) => handleClick(e, section.id)}
									onKeyDown={(e) => handleKeyDown(e, section.id, index)}
									className={classNames(
										// Base styles - Elegant text link (matching Navbar pattern)
										'relative inline-flex items-center',
										'px-0 py-3', // Vertical padding for comfortable click target
										'text-base font-medium whitespace-nowrap',
										'transition-colors duration-200 ease-out',
										'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-4 focus-visible:ring-offset-base-100',
										// Underline animation (elegant, subtle)
										'after:absolute after:bottom-2 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:opacity-0 after:transition-all after:duration-200 after:ease-out',
										// Hover state (matching Navbar: color change + underline)
										'hover:text-primary hover:after:opacity-100',
									// Active state
									{
											// Active: Primary color + visible underline
											'text-primary after:opacity-100': isActive,
											// Inactive: Base content color (matching Navbar)
											'text-base-content': !isActive,
										}
									)}
									aria-current={isActive ? 'page' : undefined}
									aria-label={`Navigate to ${section.label} section`}>
									{section.label}
								</a>
							)
						})}
						</div>
					</div>
				</PageContainer>
			</nav>

			{/* Large Screens (xl+ with sufficient whitespace for labels): Vertical Timeline Sidebar */}
			{/* Shows ONLY when viewport is 1280px+ AND labels can be displayed without overlap */}
			{/* Industry best practice: Progressive enhancement - timeline only when labels are safe */}
			{/* Mobile-first: Falls back to bottom navigation if labels would overlap */}
			{isLargeScreen && hasWhitespace && shouldShowLabels && (
				<aside
					ref={timelineRef}
					className={classNames(
						'fixed left-4 2xl:left-8 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center',
						// Fade-in animation for timeline container
						'transition-opacity duration-500 ease-out',
						{
							'opacity-0': !isTimelineVisible,
							'opacity-100': isTimelineVisible,
						}
					)}
					role="navigation"
					aria-label="Page sections timeline navigation">
				<div className="relative flex flex-col items-start gap-5 py-5">
					{/* Timeline Line - Vertical progress indicator (minimalist design) */}
					{/* Industry best practice: Line-only design inspired by Apple, Stripe, Vercel */}
					{/* The line itself serves as the primary visual indicator - elegant and minimal */}
					<div className={classNames(
						'absolute left-0 top-0 bottom-0 w-[2px] rounded-full overflow-hidden',
						// Fade-in animation for timeline line
						'transition-opacity duration-700 ease-out',
						{
							'opacity-0': !shouldAnimate,
							'opacity-100': shouldAnimate,
						}
					)}>
						{/* Background line - subtle base */}
						<div 
							className="absolute inset-0 bg-base-300/30 rounded-full"
							aria-hidden="true"
						/>
						{/* Progress fill - animates smoothly as user scrolls */}
						{/* Industry best practice: Smooth CSS transitions for fluid animation */}
						<div
							className="absolute top-0 left-0 w-full bg-primary rounded-full"
							style={{
								height: `${Math.min(100, Math.max(0, smoothTimelineProgress))}%`,
								// Smooth transition for height changes (hardware-accelerated)
								transition: prefersReducedMotion 
									? 'height 0.01ms linear' 
									: 'height 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
								// Force GPU acceleration for smooth animation
								willChange: 'height',
								transform: 'translateZ(0)', // Force hardware acceleration
							}}
							aria-hidden="true"
						/>
					</div>

					{/* Timeline Labels - Minimalist text-only design */}
					{/* Industry best practice: Typography-first approach - labels are the indicators */}
					{/* Inspired by Apple's documentation, Stripe's navigation, Vercel's sidebars */}
					{SECTIONS.map((section, index) => {
						const isActive = isSectionActiveEnhanced(section.id)
						const isPast = activeSectionIndex > index
						const isFuture = activeSectionIndex < index
						
						// Simplified visibility: All labels (including active) respect overlap detection
						// Industry best practice: Single boolean state (lightweight, mobile-first)
						// FAANG approach: Consistent behavior - if ANY overlaps, hide ALL
						// This prevents active label from overlapping content
						const shouldShowLabel = shouldShowLabels
						
						// Calculate stagger delay: each label appears 60ms after the previous
						// Industry best practice: Faster stagger (60ms) for text elements
						const staggerDelay = shouldAnimate ? index * 60 : 0

						return (
							<a
								key={section.id}
								ref={getLabelRef(section.id)}
								href={`#${section.id}`}
								onClick={(e) => handleClick(e, section.id)}
								onKeyDown={(e) => handleKeyDown(e, section.id, index)}
								className={classNames(
									// Base styles - Label container with clickable area
									'relative flex items-center pl-6 group',
									// Industry best practice: Ensure clickable area with proper z-index
									'z-20', // Above timeline line to ensure clickability
									'transition-all duration-300 ease-out',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 focus-visible:rounded-md',
									// Fade-in with stagger animation (hardware-accelerated)
									'transform-gpu', // Force GPU acceleration
									// Ensure proper touch/click target size (WCAG minimum 44px height)
									'min-h-[44px] py-1',
									{
										// Initial state: invisible and slightly translated left
										'opacity-0 -translate-x-2': !shouldAnimate,
										// Animated state: visible and in position (only if label should be shown)
										'opacity-100 translate-x-0': shouldAnimate && shouldShowLabel,
										// Hidden state: completely invisible if label would overlap
										'invisible': shouldAnimate && !shouldShowLabel,
										// Hover state - subtle scale for feedback
										'hover:translate-x-1': shouldAnimate && !isActive && shouldShowLabel,
									}
								)}
								style={{
									// Stagger delay for sequential fade-in (disabled for reduced motion)
									transitionDelay: shouldAnimate && !prefersReducedMotion ? `${staggerDelay}ms` : '0ms',
									// Smooth transition for all properties (hardware-accelerated)
									transitionProperty: 'opacity, transform, color, visibility',
									// Respect reduced motion preference
									transitionDuration: prefersReducedMotion ? '0.01ms' : '400ms',
									transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
								}}
								aria-current={isActive ? 'page' : undefined}
								aria-label={`Navigate to ${section.label} section`}
								aria-hidden={!shouldShowLabel ? 'true' : undefined}>
								
								{/* Section Label - Pure typography design */}
								{/* Industry best practice: Typography-only approach - elegant and minimal */}
								{/* Inspired by Apple's documentation, Stripe's navigation, Vercel's sidebars */}
								{/* FAANG-level solution: Dynamic visibility prevents overlap while maintaining UX */}
								<span
									className={classNames(
										// Base styles - Label with smooth typography transitions
										'text-sm whitespace-nowrap transition-all duration-300 ease-out',
										// Position - Right of timeline line with proper spacing
										'relative',
										// Typography and color transitions
										{
											// Active: Bold, primary color, slightly larger (prominent but elegant)
											'font-semibold text-primary text-base': isActive,
											// Past: Medium weight, muted primary color (completed sections)
											'font-medium text-primary/60': isPast && !isActive,
											// Future: Normal weight, subtle base color (upcoming sections)
											'font-normal text-base-content/50': isFuture && !isActive,
											// Hover state - subtle color change for feedback
											'group-hover:text-primary/80': !isActive,
										}
									)}>
									{section.label}
								</span>
							</a>
						)
					})}
				</div>
			</aside>
			)}
		</>
	)
}
