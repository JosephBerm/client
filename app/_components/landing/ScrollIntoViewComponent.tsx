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
 * Enhanced sticky bottom navigation bar with scroll spy functionality.
 * Provides quick anchor links to major landing page sections with active state indication.
 *
 * **Features:**
 * - Scroll spy: Automatically highlights current section as user scrolls
 * - Active state indication: Visual feedback for current section
 * - Smooth scroll: Smooth scrolling with header offset calculation
 * - Keyboard navigation: Full keyboard support (Arrow keys, Enter, Space)
 * - Mobile-first: Responsive design optimized for all screen sizes
 * - Accessibility: ARIA labels, screen reader support, focus management
 * - Performance: Uses Intersection Observer API (better than scroll listeners)
 * - Modern design: Elegant styling with smooth animations
 *
 * **Behavior:**
 * - Sticky on desktop (md:sticky md:bottom-0)
 * - Normal positioning on mobile
 * - Auto-updates active state as user scrolls
 * - Smooth scroll to sections with header offset
 * - Keyboard navigation support
 *
 * **Accessibility:**
 * - ARIA labels for screen readers
 * - Keyboard navigation (Arrow keys, Enter, Space)
 * - Focus indicators
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
			<PageContainer className="py-3 md:py-4">
				<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:flex-nowrap md:justify-between md:gap-2 lg:gap-4">
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
									// Base styles - Mobile-first
									'inline-flex items-center justify-center',
									'px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-2.5',
									'text-xs sm:text-sm md:text-base',
									'font-medium',
									'rounded-lg',
									'min-h-[44px]', // WCAG touch target minimum
									'transition-all duration-300 ease-in-out',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
									// Mobile: Equal width, wraps
									'flex-1 sm:flex-1 md:flex-initial',
									'min-w-[calc(50%-0.25rem)] sm:min-w-[calc(33.333%-0.5rem)] md:min-w-0',
									// Active state
									{
										// Active: Primary background, white text
										'bg-primary text-primary-content shadow-md scale-105': isActive,
										// Inactive: Outline style
										'bg-transparent border border-base-300 text-base-content hover:bg-base-200 hover:border-primary/50 hover:text-primary': !isActive,
									}
								)}
								aria-current={isActive ? 'page' : undefined}
								aria-label={`Navigate to ${section.label} section`}>
								<span className="whitespace-nowrap">{section.label}</span>
							</a>
						)
					})}
				</div>
			</PageContainer>
		</nav>
	)
}
