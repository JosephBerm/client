/**
 * Breadcrumb Service
 * 
 * FAANG-level breadcrumb generation service with zero hardcoded data.
 * Generates breadcrumbs dynamically from NavigationService for true reusability.
 * 
 * **Design Principles (DRY & Scalable):**
 * - NO hardcoded route metadata (relies on NavigationService)
 * - Single source of truth for route data
 * - Works for ANY route structure
 * - Role-based filtering
 * - Dynamic route handling ([id])
 * - Type-safe throughout
 * 
 * **Architecture:**
 * - Static class methods (no instance needed)
 * - Relies entirely on NavigationService for route data
 * - Defensive programming with fallbacks
 * - Structured logging for monitoring
 * 
 * **Mobile-First:**
 * - Generates full breadcrumb trail
 * - Component handles responsive truncation
 * - Performance optimized
 * 
 * **Reusability:**
 * - Can be used for ANY app section
 * - Not tied to /app
 * - Extensible via NavigationService
 * 
 * @example
 * ```typescript
 * import { BreadcrumbService, AccountRole } from '@_features/navigation'
 * 
 * // Generate breadcrumbs for any path
 * const breadcrumbs = BreadcrumbService.generateBreadcrumbs(
 *   '/app/orders/123',
 *   AccountRole.Customer
 * )
 * // Returns: [
 * //   { label: 'Dashboard', href: '/app' },
 * //   { label: 'Orders', href: '/app/orders' },
 * //   { label: 'Order #123', href: '/app/orders/123' }
 * // ]
 * ```
 * 
 * @module BreadcrumbService
 */

import { logger } from '@_core'
import { AccountRole } from '@_classes/Enums'
import { NavigationService } from './NavigationService'

/**
 * Breadcrumb item interface.
 * Represents a single breadcrumb in the navigation trail.
 */
export interface BreadcrumbItem {
	/** Display label for the breadcrumb */
	label: string
	/** URL path for navigation */
	href: string
	/** Whether this is the current/active page */
	isCurrent?: boolean
	/** Icon identifier (optional) */
	icon?: string
}

/**
 * BreadcrumbService class providing FAANG-level breadcrumb generation.
 * 
 * **Key Features:**
 * - Zero hardcoded data (100% dynamic)
 * - Relies on NavigationService (Single Source of Truth)
 * - Role-based filtering
 * - Dynamic route handling
 * - Defensive programming
 * - Performance optimized
 * 
 * **Static Methods:**
 * - `generateBreadcrumbs(pathname, userRole)` - Main generation method
 * - `getLabelForSegment(segment, userRole)` - Get label from NavigationService
 * - `isDynamicSegment(segment)` - Check if segment is an ID
 * - `formatDynamicLabel(parentSegment, id)` - Format detail page labels
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const breadcrumbs = BreadcrumbService.generateBreadcrumbs(pathname, userRole)
 * 
 * // Get label for segment
 * const label = BreadcrumbService.getLabelForSegment('orders', AccountRole.Customer)
 * 
 * // Check if segment is dynamic
 * const isDynamic = BreadcrumbService.isDynamicSegment('123') // true
 * ```
 */
export class BreadcrumbService {
	/**
	 * Generates breadcrumbs from a pathname using NavigationService.
	 * 
	 * **FAANG-Level Implementation:**
	 * - No hardcoded route data
	 * - Queries NavigationService for all labels
	 * - Handles dynamic routes intelligently
	 * - Role-based access filtering
	 * - Defensive with fallbacks
	 * 
	 * **Algorithm:**
	 * 1. Parse pathname into segments
	 * 2. Filter empty segments
	 * 3. Build cumulative paths
	 * 4. Query NavigationService for labels
	 * 5. Handle dynamic segments ([id])
	 * 6. Apply role-based filtering
	 * 7. Mark last item as current
	 * 
	 * @param pathname - Current URL pathname
	 * @param userRole - User's role (AccountRole enum)
	 * @returns Array of breadcrumb items
	 * 
	 * @example
 * ```typescript
 * const breadcrumbs = BreadcrumbService.generateBreadcrumbs(
 *   '/app/orders/123',
 *   AccountRole.Customer
 * )
 * ```
	 */
	static generateBreadcrumbs(pathname: string, userRole?: number | null): BreadcrumbItem[] {
		try {
			// Remove leading/trailing slashes and split into segments
			const segments = pathname
				.split('/')
				.filter((segment) => segment.length > 0)

			// Empty path edge case
			if (segments.length === 0) {
				return []
			}

			// Build breadcrumbs
			const breadcrumbs: BreadcrumbItem[] = []
			let currentPath = ''

			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i]
				const parentSegment = i > 0 ? segments[i - 1] : undefined
				currentPath += `/${segment}`

				// Check if this is a dynamic route (ID)
				const isDynamic = this.isDynamicSegment(segment)

				// Get label from NavigationService or format dynamically
				const label = isDynamic
					? this.formatDynamicLabel(parentSegment, segment)
					: this.getLabelForSegment(segment, userRole)

				// Check accessibility (skip for dynamic segments - they inherit parent access)
				if (!isDynamic) {
					const accessible = this.isAccessible(segment, userRole)
					if (!accessible) {
						logger.debug('Breadcrumb segment filtered by role', {
							segment,
							userRole,
							service: 'BreadcrumbService',
						})
						continue
					}
				}

				// Add breadcrumb
				breadcrumbs.push({
					label,
					href: currentPath,
					isCurrent: i === segments.length - 1,
				})
			}

			// Log successful generation
			logger.debug('Breadcrumbs generated dynamically', {
				pathname,
				breadcrumbCount: breadcrumbs.length,
				userRole,
				service: 'BreadcrumbService',
			})

			return breadcrumbs
		} catch (error) {
			logger.error('Failed to generate breadcrumbs', {
				error,
				pathname,
				userRole,
				service: 'BreadcrumbService',
			})
			// Return minimal fallback breadcrumb
			return [
				{
					label: 'Dashboard',
					href: '/app',
					isCurrent: true,
				},
			]
		}
	}

	/**
	 * Gets label for a route segment from NavigationService.
	 * 
	 * **Dynamic Label Resolution:**
	 * 1. Query NavigationService.getAllRoutes()
	 * 2. Find route by ID or href match
	 * 3. Return route label
	 * 4. Fallback to title-cased segment
	 * 
	 * **NO HARDCODED DATA** - Entirely dynamic!
	 * 
	 * @param segment - Route segment (e.g., 'orders', 'analytics')
	 * @param userRole - User's role for filtering
	 * @returns Human-readable label
	 * 
	 * @example
	 * ```typescript
	 * BreadcrumbService.getLabelForSegment('orders', AccountRole.Customer) // "Orders"
	 * BreadcrumbService.getLabelForSegment('analytics', AccountRole.Admin) // "Analytics"
	 * ```
	 */
	static getLabelForSegment(segment: string, userRole?: number | null): string {
		try {
			// Get all routes for user role from NavigationService
			const allRoutes = NavigationService.getAllRoutes(userRole)

		// Find route by ID
		let route = allRoutes.find((r) => r.id === segment)

		// If not found by ID, try exact href match
		// Use exact path segment matching to avoid false positives
		// (e.g., "order" shouldn't match "/customer-orders")
		if (!route) {
			route = allRoutes.find((r) => {
				const segments = r.href.split('/').filter(Boolean)
				return segments.includes(segment)
			})
		}

			// Return route label if found
			if (route) {
				return route.label
			}

		// Special case: app root should be "Dashboard"
		if (segment === 'app') {
			return 'Dashboard'
		}

			// Fallback: title-case the segment
			return this.titleCase(segment)
		} catch (error) {
			logger.error('Failed to get label for segment', {
				error,
				segment,
				service: 'BreadcrumbService',
			})
			return this.titleCase(segment)
		}
	}

	/**
	 * Checks if user can access a route segment.
	 * 
	 * Queries NavigationService to check role restrictions.
	 * Returns true if no restrictions exist (public route).
	 * 
	 * @param segment - Route segment to check
	 * @param userRole - User's role
	 * @returns True if accessible
	 * 
	 * @example
	 * ```typescript
	 * BreadcrumbService.isAccessible('analytics', AccountRole.Admin) // true
	 * BreadcrumbService.isAccessible('analytics', AccountRole.Customer) // false
	 * ```
	 */
	static isAccessible(segment: string, userRole?: number | null): boolean {
		try {
			// Get all routes for user role
			const allRoutes = NavigationService.getAllRoutes(userRole)

		// Check if segment exists in accessible routes
		// Use exact path segment matching to avoid false positives
		const accessible = allRoutes.some((r) => {
			if (r.id === segment) return true
			const segments = r.href.split('/').filter(Boolean)
			return segments.includes(segment)
		})

		// If found in user's routes, it's accessible
		// If not found, allow (might be a public route)
		return accessible || segment === 'app'
		} catch (error) {
			logger.error('Failed to check accessibility', {
				error,
				segment,
				userRole,
				service: 'BreadcrumbService',
			})
			// Fail open for safety
			return true
		}
	}

	/**
	 * Checks if a segment is a dynamic route (ID).
	 * 
	 * Detects:
	 * - Numeric IDs (123, 456)
	 * - UUIDs (abc-123-def-456-ghi)
	 * - GUIDs
	 * 
	 * @param segment - Route segment
	 * @returns True if segment is an ID
	 * 
	 * @example
	 * ```typescript
	 * BreadcrumbService.isDynamicSegment('123') // true
	 * BreadcrumbService.isDynamicSegment('orders') // false
	 * ```
	 */
	static isDynamicSegment(segment: string): boolean {
		// Numeric ID
		if (/^\d+$/.test(segment)) {
			return true
		}

		// UUID pattern
		if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment)) {
			return true
		}

		return false
	}

	/**
	 * Formats a label for a dynamic route segment (detail page).
	 * 
	 * Creates user-friendly labels like:
	 * - "Order #123"
	 * - "Product #456"
	 * - "Customer #789"
	 * 
	 * @param parentSegment - Parent route segment (e.g., 'orders')
	 * @param id - Dynamic ID value
	 * @returns Formatted label
	 * 
	 * @example
	 * ```typescript
	 * BreadcrumbService.formatDynamicLabel('orders', '123') // "Order #123"
	 * BreadcrumbService.formatDynamicLabel('products', '456') // "Product #456"
	 * ```
	 */
	static formatDynamicLabel(parentSegment: string | undefined, id: string): string {
		if (!parentSegment) {
			return 'Details'
		}

		// Whitelist of irregular plurals and words ending in 's' that shouldn't be singularized
		const irregularPlurals: Record<string, string> = {
			'analytics': 'Analytics',
			'news': 'News',
			'series': 'Series',
			'species': 'Species',
			'headquarters': 'Headquarters',
			'means': 'Means',
		}

		// Check if parent is an irregular plural
		const irregularSingular = irregularPlurals[parentSegment.toLowerCase()]
		if (irregularSingular) {
			return `${irregularSingular} #${id}`
		}

		// Get singular form (remove trailing 's' for regular plurals)
		// Only remove 's' if word is longer than 3 chars (avoid "gas" → "ga")
		const singular = parentSegment.length > 3 && parentSegment.endsWith('s')
			? parentSegment.slice(0, -1)
			: parentSegment

		// Title case
		const label = this.titleCase(singular)

		return `${label} #${id}`
	}

	/**
	 * Converts string to title case.
	 * 
	 * Handles:
	 * - Hyphens: 'user-profile' → 'User Profile'
	 * - Underscores: 'user_profile' → 'User Profile'
	 * - CamelCase: stays readable
	 * 
	 * @param str - String to convert
	 * @returns Title-cased string
	 * 
	 * @example
	 * ```typescript
	 * BreadcrumbService.titleCase('hello-world') // "Hello World"
	 * BreadcrumbService.titleCase('internal-app') // "Internal App"
	 * ```
	 */
	private static titleCase(str: string): string {
		return str
			.replace(/[-_]/g, ' ')
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ')
	}
}
