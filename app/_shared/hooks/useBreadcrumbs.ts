/**
 * useBreadcrumbs Hook
 * 
 * Auto-generates breadcrumbs from current pathname and user role.
 * Integrates with BreadcrumbService for internal application pages.
 * 
 * **Purpose:**
 * - Simplifies breadcrumb generation for internal pages
 * - Handles role-based filtering automatically
 * - Memoized for performance
 * - Type-safe
 * 
 * **Use Cases:**
 * - Internal application pages (/app/*)
 * - Role-based navigation
 * - Dynamic routes ([id])
 * 
 * **Architecture:**
 * - Wraps BreadcrumbService.generateBreadcrumbs
 * - Reads user role from auth store
 * - Memoizes result to prevent recalculation
 * 
 * @example
 * ```tsx
 * import { useBreadcrumbs } from '@_shared/hooks'
 * import Breadcrumb from '@_components/ui/Breadcrumb'
 * 
 * function InternalPage() {
 *   const breadcrumbs = useBreadcrumbs()
 *   
 *   return <Breadcrumb items={breadcrumbs} mobileLimit={2} />
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // With custom pathname (rare)
 * const breadcrumbs = useBreadcrumbs('/app/orders/123')
 * ```
 * 
 * @module useBreadcrumbs
 */

'use client'

import { useMemo } from 'react'

import { usePathname } from 'next/navigation'

import { useAuthStore } from '@_features/auth'
import { BreadcrumbService } from '@_features/navigation'

import type { BreadcrumbItem } from '@_types/navigation'

/**
 * useBreadcrumbs Hook
 * 
 * Auto-generates breadcrumbs from pathname and user role.
 * Memoized for performance - only recalculates when pathname or role changes.
 * 
 * **Features:**
 * - Auto-generates from current pathname
 * - Role-based filtering (Admin vs Customer)
 * - Handles dynamic routes ([id])
 * - Performance optimized (memoized)
 * - Type-safe
 * 
 * **Algorithm:**
 * 1. Get current pathname from Next.js router
 * 2. Get user role from auth store
 * 3. Call BreadcrumbService.generateBreadcrumbs
 * 4. Memoize result
 * 5. Return breadcrumb items
 * 
 * @param customPathname - Optional custom pathname (defaults to current)
 * @returns Array of breadcrumb items
 * 
 * @example
 * ```tsx
 * function OrdersPage() {
 *   const breadcrumbs = useBreadcrumbs()
 *   // Pathname: /app/orders
 *   // Returns: [
 *   //   { label: 'Dashboard', href: '/app' },
 *   //   { label: 'Orders', href: '/app/orders', isCurrent: true }
 *   // ]
 *   
 *   return <Breadcrumb items={breadcrumbs} mobileLimit={2} />
 * }
 * ```
 */
export function useBreadcrumbs(customPathname?: string): BreadcrumbItem[] {
	const routerPathname = usePathname()
	const user = useAuthStore((state) => state.user)
	
	// Use custom pathname if provided, otherwise use current pathname
	const pathname = customPathname ?? routerPathname

	// Generate breadcrumbs (memoized)
	// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
	const breadcrumbs = useMemo(() => {
		return BreadcrumbService.generateBreadcrumbs(pathname, user?.roleLevel)
	}, [pathname, user?.roleLevel])

	return breadcrumbs
}

