/**
 * Internal Routes Configuration
 * 
 * Centralized configuration for internal application routes (/app).
 * Provides metadata for page titles, descriptions, breadcrumbs, and actions.
 * 
 * **Purpose:**
 * - Single source of truth for internal route metadata
 * - Auto-generate page headers and breadcrumbs
 * - Type-safe route definitions
 * - Role-based route filtering
 * 
 * **Architecture:**
 * - Extends NavigationService with page-specific metadata
 * - Provides helpers for page layout generation
 * - Supports dynamic routes ([id])
 * 
 * **Mobile-First:**
 * - Responsive page titles (shorter on mobile)
 * - Contextual descriptions
 * - Action button placement
 * 
 * @module internalRoutes
 */

import { logger } from '@_core'

import { AccountRole } from '@_classes/Enums'

/**
 * Page metadata interface.
 * Defines the structure of metadata for each internal page.
 */
export interface InternalPageMetadata {
	/** Page title (displayed in header) */
	title: string
	/** Page description (displayed below title) */
	description?: string
	/** Breadcrumb label (if different from title) */
	breadcrumbLabel?: string
	/** Icon identifier */
	icon?: string
	/** Whether page requires specific role */
	requiresRole?: number[]
	/** Whether page supports search */
	hasSearch?: boolean
	/** Whether page supports create action */
	hasCreateAction?: boolean
	/** Create action label */
	createActionLabel?: string
}

/**
 * Internal route metadata map.
 * Maps route paths to their metadata.
 * 
 * **Pattern:**
 * - Key: route segment (e.g., 'orders', 'quotes')
 * - Value: page metadata
 */
export const INTERNAL_ROUTE_METADATA: Record<string, InternalPageMetadata> = {
	// Dashboard (root of internal app)
	'': {
		title: 'Dashboard',
		description: 'Monitor recent activity and manage your account',
		breadcrumbLabel: 'Dashboard',
		icon: 'dashboard',
	},

	// Orders Management
	orders: {
		title: 'Orders',
		description: 'View and manage customer orders',
		icon: 'shopping-cart',
		hasSearch: true,
		hasCreateAction: true,
		createActionLabel: 'Create Order',
	},

	// Quotes Management
	quotes: {
		title: 'Quotes',
		description: 'Manage quote requests and pricing',
		icon: 'file-text',
		hasSearch: true,
	},

	// Products/Store Management
	store: {
		title: 'Products',
		description: 'Manage your medical equipment inventory',
		icon: 'package',
		hasSearch: true,
		hasCreateAction: true,
		createActionLabel: 'Add Product',
	},

	// Provider Management
	providers: {
		title: 'Providers',
		description: 'Manage supplier relationships',
		icon: 'building',
		hasSearch: true,
		hasCreateAction: true,
		createActionLabel: 'Add Provider',
		requiresRole: [AccountRole.Admin],
	},

	// Account Management
	accounts: {
		title: 'Accounts',
		description: 'Manage user accounts and permissions',
		icon: 'users',
		hasSearch: true,
		hasCreateAction: true,
		createActionLabel: 'Create Account',
		requiresRole: [AccountRole.Admin],
	},

	// Customer Management
	customers: {
		title: 'Customers',
		description: 'Manage customer organizations',
		icon: 'building',
		hasSearch: true,
		hasCreateAction: true,
		createActionLabel: 'Add Customer',
		requiresRole: [AccountRole.Admin],
	},

	// Analytics Dashboard
	analytics: {
		title: 'Analytics',
		description: 'View reports and business metrics',
		icon: 'bar-chart',
		requiresRole: [AccountRole.Admin],
	},

	// User Profile
	profile: {
		title: 'Profile',
		description: 'View and edit your profile',
		icon: 'user',
	},

	// Notifications
	notifications: {
		title: 'Notifications',
		description: 'Manage your notifications',
		icon: 'bell',
	},
}

/**
 * Gets page metadata for a given pathname.
 * 
 * Extracts the last segment of the pathname and looks up
 * its metadata. Handles dynamic routes and nested paths.
 * 
 * **Algorithm:**
 * 1. Parse pathname into segments
 * 2. Find last non-dynamic segment
 * 3. Look up metadata
 * 4. Return with defaults if not found
 * 
 * @param pathname - Current pathname (e.g., '/app/orders')
 * @returns Page metadata or defaults
 * 
 * @example
 * ```typescript
 * getPageMetadata('/app/orders')
 * // Returns: { title: 'Orders', description: '...', hasSearch: true, ... }
 * 
 * getPageMetadata('/app/orders/123')
 * // Returns: { title: 'Order Details', description: '...', ... }
 * ```
 */
export function getPageMetadata(pathname: string): InternalPageMetadata {
	try {
		// Remove leading/trailing slashes and split
		const segments = pathname
			.split('/')
			.filter((s) => s.length > 0)

	// Remove 'app' prefix
	const relevantSegments = segments.filter((s) => s !== 'app')

		// If no segments, return dashboard metadata
		if (relevantSegments.length === 0) {
			return INTERNAL_ROUTE_METADATA[''] || getDefaultMetadata()
		}

		// Get last non-dynamic segment
		const routeSegment = relevantSegments[0] // Start with first segment

		// If this is a detail page (has numeric ID), use parent segment
		if (relevantSegments.length > 1 && isDynamicSegment(relevantSegments[1])) {
			// For detail pages, modify the title
			const metadata = INTERNAL_ROUTE_METADATA[routeSegment]
			if (metadata) {
				const singular = routeSegment.endsWith('s') 
					? routeSegment.slice(0, -1) 
					: routeSegment
				
				return {
					...metadata,
					title: `${titleCase(singular)} Details`,
					description: `View and manage ${singular} information`,
					hasSearch: false, // Detail pages don't have search
					hasCreateAction: false, // Detail pages don't have create action
				}
			}
		}

		// Look up metadata
		const metadata = INTERNAL_ROUTE_METADATA[routeSegment]
		if (metadata) {
			logger.debug('Page metadata found', {
				pathname,
				routeSegment,
				service: 'internalRoutes',
			})
			return metadata
		}

		// Fallback: create default metadata
		logger.debug('Page metadata not found, using defaults', {
			pathname,
			routeSegment,
			service: 'internalRoutes',
		})
		
		return {
			title: titleCase(routeSegment),
			description: undefined,
		}
	} catch (error) {
		logger.error('Failed to get page metadata', {
			error,
			pathname,
			service: 'internalRoutes',
		})
		return getDefaultMetadata()
	}
}

/**
 * Gets the page title for a pathname.
 * 
 * Shorthand for getting just the title from metadata.
 * 
 * @param pathname - Current pathname
 * @returns Page title
 * 
 * @example
 * ```typescript
 * getPageTitle('/app/orders') // "Orders"
 * getPageTitle('/app/analytics') // "Analytics"
 * ```
 */
export function getPageTitle(pathname: string): string {
	return getPageMetadata(pathname).title
}

/**
 * Gets the page description for a pathname.
 * 
 * Shorthand for getting just the description from metadata.
 * 
 * @param pathname - Current pathname
 * @returns Page description or undefined
 * 
 * @example
 * ```typescript
 * getPageDescription('/app/orders')
 * // "View and manage customer orders"
 * ```
 */
export function getPageDescription(pathname: string): string | undefined {
	return getPageMetadata(pathname).description
}

/**
 * Checks if user can access a route based on role requirements.
 * 
 * Compares user role against route metadata role requirements.
 * Returns true if no role restrictions exist.
 * 
 * @param pathname - Route pathname
 * @param userRole - User's role number
 * @returns True if user can access route
 * 
 * @example
 * ```typescript
 * import { AccountRole } from '@_classes/Enums'
 * 
 * canAccessRoute('/app/analytics', AccountRole.Admin) // true
 * canAccessRoute('/app/analytics', AccountRole.Customer) // false
 * canAccessRoute('/app/orders', AccountRole.Customer) // true
 * ```
 */
export function canAccessRoute(pathname: string, userRole?: number | null): boolean {
	const metadata = getPageMetadata(pathname)
	
	// If no role requirements, allow access
	if (!metadata.requiresRole || metadata.requiresRole.length === 0) {
		return true
	}
	
	// Check if user role matches any required role
	if (userRole === null || userRole === undefined) {
		return false
	}
	
	return metadata.requiresRole.includes(userRole)
}

/**
 * Checks if a segment is a dynamic route (ID).
 * 
 * Helper function to detect numeric IDs or UUIDs.
 * 
 * @param segment - Route segment
 * @returns True if segment is dynamic
 */
function isDynamicSegment(segment: string): boolean {
	// Check if numeric
	if (/^\d+$/.test(segment)) {
		return true
	}
	
	// Check if UUID
	if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment)) {
		return true
	}
	
	return false
}

/**
 * Converts string to title case.
 * 
 * Helper for formatting segment names.
 * 
 * @param str - String to convert
 * @returns Title-cased string
 */
function titleCase(str: string): string {
	return str
		.replace(/[-_]/g, ' ')
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

/**
 * Gets default metadata for unknown routes.
 * 
 * Fallback when route metadata is not found.
 * 
 * @returns Default page metadata
 */
function getDefaultMetadata(): InternalPageMetadata {
	return {
		title: 'Dashboard',
		description: undefined,
	}
}

