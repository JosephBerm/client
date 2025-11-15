'use client'

import { useEffect, useRef, useCallback } from 'react'
import PageContainer from '@_components/layouts/PageContainer'
import { useScrollSpy, useKeyboardNavigation, useElementRefs } from '@_shared/hooks'
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
 * Elegant sticky bottom navigation bar with scroll spy functionality.
 * Provides quick anchor links to major landing page sections with active state indication.
 * Designed with industry best practices for elegant, powerful navigation (inspired by Apple, Stripe, Vercel).
 *
 * **Design:**
 * - Elegant text links (not buttons) matching Navbar pattern
 * - Subtle underline animation on hover and active states
 * - Proper spacing that scales with screen size
 * - Mobile-first approach with horizontal scroll
 * - Touch-friendly targets (44px minimum)
 *
 * **Features:**
 * - Scroll spy: Automatically highlights current section as user scrolls
 * - Active state indication: Primary color + visible underline
 * - Smooth scroll: Smooth scrolling with header offset calculation
 * - Keyboard navigation: Full keyboard support (Arrow keys, Enter, Space)
 * - Mobile-first: Horizontal scroll on mobile, centered navigation on desktop
 * - Accessibility: ARIA labels, screen reader support, focus management
 * - Performance: Uses Intersection Observer API (better than scroll listeners)
 * - Modern design: Elegant styling with smooth animations
 *
 * **Mobile Behavior (< 768px):**
 * - Horizontal scroll with edge-to-edge padding
 * - Touch-friendly tap targets (44px minimum)
 * - Hidden scrollbar for clean appearance
 * - Subtle text color (base-content/70) for inactive items
 *
 * **Desktop Behavior (>= 768px):**
 * - Centered navigation with elegant spacing
 * - Spacing scales with screen size: gap-8 → lg:gap-10 → xl:gap-12 → 2xl:gap-16
 * - Full text color (base-content) for inactive items
 * - Sticky positioning (sticky bottom-0)
 *
 * **Accessibility:**
 * - ARIA labels for screen readers
 * - Keyboard navigation (Arrow keys, Enter, Space)
 * - Focus indicators with proper offset
 * - Respects reduced motion preferences
 *
 * **Performance:**
 * - Intersection Observer API (more efficient than scroll listeners)
 * - Debounced state updates
 * - Automatic cleanup on unmount
 *
 * @module ScrollIntoViewComponent
 */
export default function ScrollIntoViewComponent() {
	const navRef = useRef<HTMLElement>(null)
	const currentIndexRef = useRef<number>(0)

	// Get navbar height for scroll offset (from CSS variable)
	const navbarHeight = getCSSVariable('--nav-height', 96)
	const scrollOffset = calculateScrollOffset(navbarHeight, 16)

	// Use element refs hook for button management
	const { getRef: getButtonRef, getElement: getButtonElement } = useElementRefs<HTMLAnchorElement>()

	// Use scroll spy hook
	const { activeSection, scrollToSection, isSectionActive } = useScrollSpy({
		sectionIds: SECTIONS.map((s) => s.id),
		rootMargin: '-20% 0px -80% 0px', // Section becomes active when 20% from top
		threshold: 0,
		offset: scrollOffset,
		debounceDelay: 100,
	})

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
	 */
	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
			e.preventDefault()
			scrollToSection(sectionId)

			// Update current index for keyboard navigation
			const index = SECTIONS.findIndex((s) => s.id === sectionId)
			if (index !== -1) {
				currentIndexRef.current = index
			}
		},
		[scrollToSection]
	)

	/**
	 * Sync current index with active section
	 */
	useEffect(() => {
		if (activeSection) {
			const index = SECTIONS.findIndex((s) => s.id === activeSection)
			if (index !== -1) {
				currentIndexRef.current = index
			}
		}
	}, [activeSection])

	return (
		<nav
			ref={navRef}
			className="z-20 bg-base-100/95 backdrop-blur-sm border-t border-base-300/40 md:sticky md:bottom-0 md:shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
			role="navigation"
			aria-label="Page sections navigation">
			{/* Mobile: Horizontal scroll with edge-to-edge padding (similar to ProductsCarousel pattern) */}
			<div className="md:hidden py-4">
				<PageContainer>
					<div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
						<div className="flex items-center gap-6 min-w-max">
							{SECTIONS.map((section, index) => {
								const isActive = isSectionActive(section.id)

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

			{/* Desktop: Centered navigation with elegant spacing (matching Navbar pattern) */}
			<PageContainer className="hidden md:block py-5">
				<div className="flex items-center justify-center gap-8 lg:gap-10 xl:gap-12 2xl:gap-16">
					{SECTIONS.map((section, index) => {
						const isActive = isSectionActive(section.id)

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
			</PageContainer>
		</nav>
	)
}
