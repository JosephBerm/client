/**
 * Tabs UI Component
 * 
 * Accessible tabbed interface component following WCAG 2.1 guidelines.
 * Provides keyboard navigation, ARIA attributes, and smooth transitions.
 * 
 * **Features:**
 * - Multiple visual variants (boxed, bordered, lifted)
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Full ARIA support (tablist, tab, tabpanel roles)
 * - Controlled component pattern
 * - Mobile-responsive with horizontal scroll
 * - Icon support in tab labels
 * - Badge/count support
 * - Disabled tabs
 * - Theme-aware (DaisyUI)
 * 
 * **Accessibility:**
 * - Proper ARIA roles and attributes
 * - Keyboard navigation (Left/Right arrows, Home, End)
 * - Focus management
 * - Screen reader announcements
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

import React, { createContext, useContext, useCallback, useRef, type ReactNode, type KeyboardEvent } from 'react'

import classNames from 'classnames'

// ============================================================================
// CONTEXT
// ============================================================================

interface TabsContextValue {
	value: string
	onValueChange: (value: string) => void
	variant: TabsVariant
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
	const context = useContext(TabsContext)
	if (!context) {
		throw new Error('Tab components must be used within a Tabs provider')
	}
	return context
}

// ============================================================================
// TYPES
// ============================================================================

export type TabsVariant = 'boxed' | 'bordered' | 'lifted'

export interface TabsProps {
	/** Currently active tab value */
	value: string
	/** Callback when tab changes */
	onValueChange: (value: string) => void
	/** Visual variant */
	variant?: TabsVariant
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
	/** Whether tab is disabled */
	disabled?: boolean
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
	children,
	className,
}: TabsProps) {
	return (
		<TabsContext.Provider value={{ value, onValueChange, variant }}>
			<div className={classNames('w-full', className)}>
				{children}
			</div>
		</TabsContext.Provider>
	)
}

// ============================================================================
// TABS LIST
// ============================================================================

/**
 * Container for Tab components.
 * Handles keyboard navigation between tabs.
 */
export function TabsList({ children, className }: TabsListProps) {
	const { variant } = useTabsContext()
	const tabsRef = useRef<HTMLDivElement>(null)
	
	// Keyboard navigation handler
	const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
		const tabs = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
		if (!tabs?.length) return
		
		const currentIndex = Array.from(tabs).findIndex(
			(tab) => tab === document.activeElement
		)
		
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
	}, [])
	
	const variantClasses: Record<TabsVariant, string> = {
		boxed: 'tabs-boxed',
		bordered: 'border-b border-base-300',
		lifted: 'tabs-lifted',
	}
	
	return (
		<div
			ref={tabsRef}
			role="tablist"
			className={classNames(
				'tabs flex gap-1',
				// Mobile: horizontal scroll, Desktop: flex wrap
				'overflow-x-auto scrollbar-thin scrollbar-thumb-base-300',
				'pb-px', // Prevent border cut-off
				variantClasses[variant],
				className
			)}
			onKeyDown={handleKeyDown}
		>
			{children}
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
	disabled = false,
	className,
}: TabProps) {
	const { value: activeValue, onValueChange, variant } = useTabsContext()
	const isActive = value === activeValue
	
	const baseClasses = 'tab relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200'
	
	const activeClasses: Record<TabsVariant, string> = {
		boxed: 'tab-active bg-primary text-primary-content',
		bordered: 'tab-active border-b-2 border-primary text-primary',
		lifted: 'tab-active tab-lifted',
	}
	
	const inactiveClasses = 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'
	const disabledClasses = 'opacity-50 cursor-not-allowed'
	
	return (
		<button
			type="button"
			role="tab"
			aria-selected={isActive}
			aria-controls={`tabpanel-${value}`}
			id={`tab-${value}`}
			tabIndex={isActive ? 0 : -1}
			disabled={disabled}
			onClick={() => !disabled && onValueChange(value)}
			className={classNames(
				baseClasses,
				isActive ? activeClasses[variant] : inactiveClasses,
				disabled && disabledClasses,
				className
			)}
		>
			{icon && <span className="shrink-0">{icon}</span>}
			<span className="whitespace-nowrap">{children}</span>
			{badge !== undefined && (
				<span
					className={classNames(
						'ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
						isActive
							? 'bg-primary-content/20 text-primary-content'
							: 'bg-base-300 text-base-content/70'
					)}
				>
					{badge}
				</span>
			)}
		</button>
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
			role="tabpanel"
			id={`tabpanel-${value}`}
			aria-labelledby={`tab-${value}`}
			tabIndex={0}
			className={classNames(
				'mt-4 focus:outline-none',
				// Animation
				'animate-fade-in',
				className
			)}
		>
			{children}
		</div>
	)
}

// Default export for convenience
export default Tabs
