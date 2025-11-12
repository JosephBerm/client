/**
 * Navigation Type Definitions
 * 
 * Provides type-safe interfaces and types for the navigation system.
 * These types define the structure of navigation routes, sections, and
 * configuration, enabling type safety throughout the navigation system.
 * 
 * **Architecture:**
 * - Icon type for consistent icon usage
 * - Route interface for individual navigation items
 * - Section interface for grouping routes
 * - Role-based access control types
 * 
 * @module NavigationTypes
 */

import type { LucideIcon } from 'lucide-react'

/**
 * Icon identifier type for navigation items.
 * Maps string identifiers to Lucide React icon components.
 */
export type NavigationIconType =
	| 'dashboard'
	| 'package'
	| 'shopping-cart'
	| 'file-text'
	| 'users'
	| 'building'
	| 'bar-chart'
	| 'user'
	| 'settings'
	| 'shopping-bag'
	| 'bell'

/**
 * Navigation route item interface.
 * 
 * Represents a single navigation item (link) in the navigation system.
 * Routes appear in the sidebar navigation.
 * 
 * @interface NavigationRoute
 */
export interface NavigationRoute {
	/** Unique identifier for the route */
	id: string
	/** Display label shown to users */
	label: string
	/** Optional subtitle or description shown below the label */
	description?: string
	/** URL path for navigation */
	href: string
	/** Icon identifier for visual representation */
	icon: NavigationIconType
	/** Whether this route opens in a new tab/window */
	isExternal?: boolean
	/** Whether this route requires specific role */
	roles?: number[]
	/** Optional badge or notification count */
	badge?: number | string
}

/**
 * Navigation section interface.
 * 
 * Represents a group of related navigation routes displayed together.
 * Sections appear in the sidebar navigation and can be collapsible.
 * 
 * @interface NavigationSection
 */
export interface NavigationSection {
	/** Unique identifier for the section */
	id: string
	/** Display title for the section */
	title: string
	/** Array of navigation routes in this section */
	routes: NavigationRoute[]
	/** Whether this section can be collapsed/expanded */
	collapsible?: boolean
	/** Whether this section starts collapsed */
	defaultCollapsed?: boolean
	/** Role restrictions for entire section */
	roles?: number[]
}

/**
 * User role definitions matching backend enum values.
 */
export const UserRoles = {
	/** Customer role (default users) */
	Customer: 0,
	/** Administrator role (full access) */
	Admin: 9999999,
} as const

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles]

