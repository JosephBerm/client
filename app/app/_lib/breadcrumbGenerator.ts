/**
 * Breadcrumb Generator Utility
 * 
 * Helper utilities for generating breadcrumbs specific to the internal application.
 * Wraps BreadcrumbService with internal app-specific logic.
 * 
 * **Purpose:**
 * - Simplified API for internal app breadcrumbs
 * - Pre-configured for /app routes
 * - Type-safe breadcrumb generation
 * 
 * **Architecture:**
 * - Thin wrapper around BreadcrumbService
 * - Internal app route awareness
 * - Mobile-first responsive breadcrumbs
 * 
 * @module breadcrumbGenerator
 */

import type { BreadcrumbItem } from '@_features/navigation'
import { BreadcrumbService } from '@_features/navigation'
import { logger } from '@_core'

/**
 * Generates breadcrumbs for internal application routes.
 * 
 * Convenience wrapper around BreadcrumbService.getBreadcrumbsFromPath
 * with internal app-specific defaults and logging.
 * 
 * **Mobile Optimization:**
 * - Returns full breadcrumbs
 * - Component handles responsive truncation
 * - Last 2 items shown on mobile
 * - Full trail on desktop
 * 
 * @param pathname - Current pathname (e.g., '/app/orders/123')
 * @param userRole - User's role number
 * @returns Array of breadcrumb items
 * 
 * @example
 * ```typescript
 * import { generateBreadcrumbs } from '@/app/app/_lib'
 * 
 * const breadcrumbs = generateBreadcrumbs(
 *   '/app/orders',
 *   userRole
 * )
 * ```
 */
export function generateBreadcrumbs(
	pathname: string,
	userRole?: number | null
): BreadcrumbItem[] {
	try {
		// Use BreadcrumbService to generate
		const breadcrumbs = BreadcrumbService.generateBreadcrumbs(pathname, userRole)
		
		// Log for monitoring
		logger.debug('Internal breadcrumbs generated', {
			pathname,
			count: breadcrumbs.length,
			userRole,
			utility: 'breadcrumbGenerator',
		})
		
		return breadcrumbs
	} catch (error) {
		logger.error('Failed to generate internal breadcrumbs', {
			error,
			pathname,
			userRole,
			utility: 'breadcrumbGenerator',
		})
		
		// Return minimal fallback
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
 * Gets responsive breadcrumbs for mobile display.
 * 
 * Returns last N breadcrumbs for mobile screens.
 * Typically used with limit=2 for mobile.
 * 
 * @param pathname - Current pathname
 * @param userRole - User's role number
 * @param limit - Maximum number of breadcrumbs (default: 2)
 * @returns Array of breadcrumb items (truncated)
 * 
 * @example
 * ```typescript
 * // For mobile display (show last 2)
 * const mobileBreadcrumbs = getResponsiveBreadcrumbs(pathname, userRole, 2)
 * 
 * // Full path: Dashboard > Orders > Order #123
 * // Mobile shows: Orders > Order #123
 * ```
 */
export function getResponsiveBreadcrumbs(
	pathname: string,
	userRole?: number | null,
	limit: number = 2
): BreadcrumbItem[] {
	const allBreadcrumbs = generateBreadcrumbs(pathname, userRole)
	
	// If breadcrumbs fit within limit, return all
	if (allBreadcrumbs.length <= limit) {
		return allBreadcrumbs
	}
	
	// Return last N items
	return allBreadcrumbs.slice(-limit)
}

/**
 * Checks if breadcrumbs should be truncated.
 * 
 * Helper to determine if responsive truncation is needed.
 * Useful for showing "..." ellipsis indicator.
 * 
 * @param pathname - Current pathname
 * @param userRole - User's role number
 * @param limit - Maximum visible breadcrumbs
 * @returns True if truncation occurred
 * 
 * @example
 * ```typescript
 * const shouldTruncate = isTruncated(pathname, userRole, 2)
 * if (shouldTruncate) {
 *   // Show ellipsis before breadcrumbs
 * }
 * ```
 */
export function isTruncated(
	pathname: string,
	userRole?: number | null,
	limit: number = 2
): boolean {
	const allBreadcrumbs = generateBreadcrumbs(pathname, userRole)
	return allBreadcrumbs.length > limit
}

