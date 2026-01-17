/**
 * Tabs UI Component
 *
 * Accessible tabbed interface component following WCAG 2.1 guidelines.
 * Provides keyboard navigation, ARIA attributes, and smooth transitions.
 *
 * **Features:**
 * - Multiple visual variants (boxed, bordered, lifted)
 * - Animated sliding indicator (Material Design-style)
 * - Mobile-first horizontal scroll with fade indicators
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Full ARIA support (tablist, tab, tabpanel roles)
 * - Controlled component pattern
 * - Icon support in tab labels
 * - Badge/count support with variants (default, admin)
 * - Disabled and hidden tabs
 * - Theme-aware (DaisyUI)
 * - Reduced motion support
 *
 * **Accessibility:**
 * - Proper ARIA roles and attributes
 * - Keyboard navigation (Left/Right arrows, Home, End)
 * - Focus management
 * - Screen reader announcements
 * - Hidden tabs removed from tab order
 *
 * @example
 * ```tsx
 * import { Tabs, TabsList, Tab, TabPanel } from '@_components/ui/Tabs';
 *
 * const [activeTab, setActiveTab] = useState('profile');
 *
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <Tab value="profile" icon={<User />}>Profile</Tab>
 *     <Tab value="security" icon={<Shield />}>Security</Tab>
 *     <Tab value="activity" icon={<Activity />} badge={5}>Activity</Tab>
 *     <Tab value="admin" badge="Admin" badgeVariant="admin" hidden={!isAdmin}>
 *       Admin Only
 *     </Tab>
 *   </TabsList>
 *
 *   <TabPanel value="profile">
 *     <ProfileContent />
 *   </TabPanel>
 *   <TabPanel value="security">
 *     <SecurityContent />
 *   </TabPanel>
 *   <TabPanel value="activity">
 *     <ActivityContent />
 *   </TabPanel>
 * </Tabs>
 * ```
 *
 * @module Tabs
 */

'use client'

import React, {
	createContext,
	useContext,
	useRef,
	useState,
	useEffect,
	useLayoutEffect,
	type ReactNode,
	type KeyboardEvent,
	type RefObject,
} from 'react'

import classNames from 'classnames'
import { motion } from 'framer-motion'

import { checkReducedMotion, MODAL_ANIMATION } from '@_components/common/animations'
import Button from '@_components/ui/Button'

// ============================================================================
// TYPES
// ============================================================================

export type TabsVariant = 'boxed' | 'bordered' | 'lifted'

export type BadgeVariant = 'default' | 'admin'

export interface TabsProps {
	/** Currently active tab value */
	value: string
	/** Callback when tab changes */
	onValueChange: (value: string) => void
	/** Visual variant */
	variant?: TabsVariant
	/** Enable animated sliding indicator (default: true for 'bordered') */
	slidingIndicator?: boolean
	/** Tab content (TabsList and TabPanels) */
	children: ReactNode
	/** Additional CSS classes */
	className?: string
}

export interface TabsListProps {
	/** Tab components */
	children: ReactNode
	/** Additional CSS classes */
	className?: string
}

export interface TabProps {
	/** Unique tab identifier */
	value: string
	/** Tab label content */
	children: ReactNode
	/** Optional icon before label */
	icon?: ReactNode
	/** Optional badge/count after label */
	badge?: number | string
	/** Badge variant for special styling */
	badgeVariant?: BadgeVariant
	/** Whether tab is disabled */
	disabled?: boolean
	/** Hide tab based on permissions */
	hidden?: boolean
	/** Additional CSS classes */
	className?: string
}

export interface TabPanelProps {
	/** Tab value this panel corresponds to */
	value: string
	/** Panel content */
	children: ReactNode
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface IndicatorStyle {
	width: number
	left: number
}

interface TabsContextValue {
	value: string
	onValueChange: (value: string) => void
	variant: TabsVariant
	slidingIndicator: boolean
	registerTab: (tabValue: string, element: HTMLButtonElement) => void
	unregisterTab: (tabValue: string) => void
	tabsListRef: RefObject<HTMLDivElement | null>
}

// ============================================================================
// CONTEXT
// ============================================================================

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
	const context = useContext(TabsContext)
	if (!context) {
		throw new Error('Tab components must be used within a Tabs provider')
	}
	return context
}

// ============================================================================
// INTERNAL HOOKS
// ============================================================================

/**
 * Hook to calculate the position and size of the active tab indicator
 * Uses useLayoutEffect for synchronous DOM measurements
 */
function useTabIndicator(
	containerRef: RefObject<HTMLDivElement | null>,
	activeValue: string,
	tabRefs: Map<string, HTMLButtonElement>,
	enabled: boolean
): IndicatorStyle | null {
	const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle | null>(null)

	useLayoutEffect(() => {
		if (!enabled) {
			setIndicatorStyle(null)
			return
		}

		const activeTab = tabRefs.get(activeValue)
		const container = containerRef.current
		if (!activeTab || !container) {
			setIndicatorStyle(null)
			return
		}

		const updateIndicator = () => {
			const containerRect = container.getBoundingClientRect()
			const tabRect = activeTab.getBoundingClientRect()

			setIndicatorStyle({
				width: tabRect.width,
				left: tabRect.left - containerRect.left + container.scrollLeft,
			})
		}

		// Initial calculation
		updateIndicator()

		// Recalculate on scroll (for horizontal scrolling tabs)
		container.addEventListener('scroll', updateIndicator, { passive: true })

		// Recalculate on resize
		const resizeObserver = new ResizeObserver(updateIndicator)
		resizeObserver.observe(container)
		resizeObserver.observe(activeTab)

		return () => {
			container.removeEventListener('scroll', updateIndicator)
			resizeObserver.disconnect()
		}
	}, [activeValue, tabRefs, containerRef, enabled])

	return indicatorStyle
}

/**
 * Hook to detect horizontal scroll overflow and track scroll position
 * Used to show fade indicators when tabs overflow on mobile
 */
function useScrollFade(containerRef: RefObject<HTMLDivElement | null>) {
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		const updateScrollState = () => {
			const { scrollLeft, scrollWidth, clientWidth } = container
			setCanScrollLeft(scrollLeft > 1) // Small threshold to avoid floating point issues
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
		}

		// Initial check
		updateScrollState()

		// Update on scroll
		container.addEventListener('scroll', updateScrollState, { passive: true })

		// Update on resize (content or container size changes)
		const resizeObserver = new ResizeObserver(updateScrollState)
		resizeObserver.observe(container)

		return () => {
			container.removeEventListener('scroll', updateScrollState)
			resizeObserver.disconnect()
		}
	}, [containerRef])

	return { canScrollLeft, canScrollRight }
}

// ============================================================================
// TABS ROOT
// ============================================================================

/**
 * Tabs container component.
 * Provides context for child Tab and TabPanel components.
 */
export function Tabs({
	value,
	onValueChange,
	variant = 'bordered',
	slidingIndicator = true,
	children,
	className,
}: TabsProps) {
	const tabsListRef = useRef<HTMLDivElement>(null)
	const tabRefsRef = useRef<Map<string, HTMLButtonElement>>(new Map())

	// Force re-render when tabs register (needed for indicator calculation)
	const [, setTabsVersion] = useState(0)

	const registerTab = (tabValue: string, element: HTMLButtonElement) => {
		tabRefsRef.current.set(tabValue, element)
		setTabsVersion((v) => v + 1)
	}

	const unregisterTab = (tabValue: string) => {
		tabRefsRef.current.delete(tabValue)
		setTabsVersion((v) => v + 1)
	}

	// Context value - React Compiler will optimize this
	const contextValue: TabsContextValue = {
		value,
		onValueChange,
		variant,
		slidingIndicator: slidingIndicator && variant === 'bordered',
		registerTab,
		unregisterTab,
		tabsListRef,
	}

	return (
		<TabsContext.Provider value={contextValue}>
			<div className={classNames('w-full', className)}>{children}</div>
		</TabsContext.Provider>
	)
}

// ============================================================================
// TABS LIST
// ============================================================================

/**
 * Container for Tab components.
 * Handles keyboard navigation between tabs and renders the sliding indicator.
 */
export function TabsList({ children, className }: TabsListProps) {
	const { variant, slidingIndicator, tabsListRef, value } = useTabsContext()
	const internalRef = useRef<HTMLDivElement>(null)

	// Use the shared ref from context for indicator calculations
	const containerRef = tabsListRef || internalRef

	// Get tab refs from parent via DOM traversal (cleaner than additional context)
	const [tabRefs] = useState<Map<string, HTMLButtonElement>>(() => new Map())

	// Collect tab refs after render
	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		tabRefs.clear()
		const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
		tabs.forEach((tab) => {
			const tabValue = tab.getAttribute('data-value')
			if (tabValue) {
				tabRefs.set(tabValue, tab)
			}
		})
	})

	// Calculate indicator position
	const indicatorStyle = useTabIndicator(containerRef, value, tabRefs, slidingIndicator)

	// Scroll fade detection
	const { canScrollLeft, canScrollRight } = useScrollFade(containerRef)

	// Check reduced motion preference
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
	useEffect(() => {
		setPrefersReducedMotion(checkReducedMotion())

		// Listen for changes to reduced motion preference
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => setPrefersReducedMotion(checkReducedMotion())
		mediaQuery.addEventListener('change', handleChange)

		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	// Keyboard navigation handler
	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const tabs = containerRef.current?.querySelectorAll<HTMLButtonElement>(
			'[role="tab"]:not([disabled]):not([data-hidden="true"])'
		)
		if (!tabs?.length) return

		const currentIndex = Array.from(tabs).findIndex((tab) => tab === document.activeElement)

		let nextIndex = currentIndex

		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault()
				nextIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1
				break
			case 'ArrowRight':
				e.preventDefault()
				nextIndex = currentIndex >= tabs.length - 1 ? 0 : currentIndex + 1
				break
			case 'Home':
				e.preventDefault()
				nextIndex = 0
				break
			case 'End':
				e.preventDefault()
				nextIndex = tabs.length - 1
				break
			default:
				return
		}

		tabs[nextIndex]?.focus()
	}

	const variantClasses: Record<TabsVariant, string> = {
		boxed: 'tabs-boxed',
		bordered: 'border-b border-base-300',
		lifted: 'tabs-lifted',
	}

	return (
		<div className='relative'>
			{/* Left fade indicator */}
			{canScrollLeft && (
				<div
					className='pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-base-100 to-transparent'
					aria-hidden='true'
				/>
			)}

			<div
				ref={containerRef as RefObject<HTMLDivElement>}
				role='tablist'
				className={classNames(
					'tabs relative flex gap-1',
					// Mobile: horizontal scroll, hide scrollbar
					'overflow-x-auto scrollbar-hide',
					'pb-px', // Prevent border cut-off
					variantClasses[variant],
					className
				)}
				onKeyDown={handleKeyDown}>
				{children}

				{/* Sliding indicator for bordered variant */}
				{slidingIndicator && indicatorStyle && (
					<motion.div
						layoutId='tabs-active-indicator'
						className='pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary'
						style={{
							width: indicatorStyle.width,
							left: indicatorStyle.left,
						}}
						transition={
							prefersReducedMotion
								? { duration: 0.001 }
								: {
										type: 'spring',
										stiffness: MODAL_ANIMATION.content.spring.stiffness,
										damping: MODAL_ANIMATION.content.spring.damping,
										mass: MODAL_ANIMATION.content.spring.mass,
								  }
						}
					/>
				)}
			</div>

			{/* Right fade indicator */}
			{canScrollRight && (
				<div
					className='pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-base-100 to-transparent'
					aria-hidden='true'
				/>
			)}
		</div>
	)
}

// ============================================================================
// TAB
// ============================================================================

/**
 * Individual tab button component.
 */
export function Tab({
	value,
	children,
	icon,
	badge,
	badgeVariant = 'default',
	disabled = false,
	hidden = false,
	className,
}: TabProps) {
	const { value: activeValue, onValueChange, variant, registerTab, unregisterTab } = useTabsContext()
	const buttonRef = useRef<HTMLButtonElement>(null)
	const isActive = value === activeValue

	// Register/unregister tab element for indicator positioning
	useEffect(() => {
		if (buttonRef.current && !hidden) {
			registerTab(value, buttonRef.current)
		}
		return () => unregisterTab(value)
	}, [value, hidden, registerTab, unregisterTab])

	// Don't render hidden tabs
	if (hidden) return null

	const baseClasses =
		'tab relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200'

	// Active classes per variant (excluding border for bordered - handled by indicator)
	const activeClasses: Record<TabsVariant, string> = {
		boxed: 'tab-active bg-primary text-primary-content',
		bordered: 'text-primary', // No border - sliding indicator handles it
		lifted: 'tab-active tab-lifted',
	}

	const inactiveClasses = 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
	const disabledClasses = 'opacity-50 cursor-not-allowed'

	// Badge classes based on variant
	// Active tabs use primary colors, inactive tabs use muted colors
	const badgeClasses =
		badgeVariant === 'admin'
			? 'bg-base-200 text-base-content/70' // Subtle admin badge
			: isActive
				? 'bg-primary/15 text-primary' // Active: primary-tinted badge
				: 'bg-base-300 text-base-content/70' // Inactive: muted badge

	return (
		<Button
			ref={buttonRef}
			type='button'
			role='tab'
			// Always use ghost variant - active styling handled via className
			// This prevents the filled button background on active tabs
			variant='ghost'
			aria-selected={isActive}
			aria-controls={`tabpanel-${value}`}
			id={`tab-${value}`}
			data-value={value}
			tabIndex={isActive ? 0 : -1}
			disabled={disabled}
			onClick={() => !disabled && onValueChange(value)}
			className={classNames(
				baseClasses,
				isActive ? activeClasses[variant] : inactiveClasses,
				disabled && disabledClasses,
				'h-auto',
				className
			)}
			leftIcon={icon}
			contentDrivenHeight>
			<span className='whitespace-nowrap'>{children}</span>
			{badge !== undefined && (
				<span
					className={classNames(
						'ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
						badgeClasses
					)}>
					{badge}
				</span>
			)}
		</Button>
	)
}

// ============================================================================
// TAB PANEL
// ============================================================================

/**
 * Tab panel component.
 * Only renders content when its tab is active.
 */
export function TabPanel({ value, children, className }: TabPanelProps) {
	const { value: activeValue } = useTabsContext()
	const isActive = value === activeValue

	if (!isActive) return null

	return (
		<div
			role='tabpanel'
			id={`tabpanel-${value}`}
			aria-labelledby={`tab-${value}`}
			tabIndex={0}
			className={classNames(
				'mt-4 focus:outline-none',
				// Animation
				'animate-fade-in',
				className
			)}>
			{children}
		</div>
	)
}

// Default export for convenience
export default Tabs
