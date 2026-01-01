/**
 * Navigation Service
 * 
 * Centralized service for managing all navigation data and configuration.
 * This service provides a single source of truth for navigation structure,
 * routes, and role-based access control.
 * 
 * **Purpose:**
 * - Centralizes navigation data (sections, routes)
 * - Provides role-based filtering
 * - Enables easy lookup of routes by ID
 * - Separates navigation structure from UI components
 * 
 * **Architecture:**
 * - Static class methods (no instance needed)
 * - Returns structured data consumed by Navbar and Sidebar components
 * - Type-safe through TypeScript interfaces
 * - Icon mapping through centralized helper
 * 
 * @module NavigationService
 */

import type { NavigationSection, NavigationRoute } from '@_types/navigation'
import { AccountRole } from '@_types/navigation'

import Routes from './routes'

/**
 * NavigationService class providing navigation data and utilities.
 * 
 * **Static Methods:**
 * - `getNavigationSections(userRole)` - Get filtered navigation sections
 * - `getRouteById(id)` - Find a specific route by its ID
 * 
 * @example
 * ```typescript
 * // Get navigation sections
 * const sections = NavigationService.getNavigationSections(userRole)
 * 
 * // Find a specific route
 * const route = NavigationService.getRouteById('dashboard')
 * ```
 */
export class NavigationService {
	/**
	 * Retrieves all navigation sections filtered by user role level.
	 * 
	 * Navigation sections are organized into logical groups:
	 * - **Main**: Dashboard, Store (all users)
	 * - **My Orders**: Orders, Quotes (customers only)
	 * - **Management**: Products, Orders, Quotes (admin-level users)
	 * - **Users**: Accounts, Customers, Providers (admin-level users)
	 * - **Analytics**: Reports, metrics, and insights (admin-level users)
	 * - **Access Control**: RBAC management (admin-level users)
	 * - **Account**: Profile, Notifications (all users)
	 * 
	 * Each section contains routes with:
	 * - Unique ID for identification
	 * - Label and optional description for display
	 * - Path for navigation
	 * - Icon identifier for visual representation
	 * 
	 * **Role Hierarchy (threshold-based):**
	 * - Customer: 1000 (base level)
	 * - FulfillmentCoordinator: 2000
	 * - SalesRep: 3000
	 * - SalesManager: 4000
	 * - Admin: 5000
	 * - SuperAdmin: 9999
	 * 
	 * Admin sections shown to any user with roleLevel >= Admin (5000)
	 * 
	 * @param userRole - User's role level (number), null if not logged in
	 * @returns Array of navigation sections filtered by role
	 * 
	 * @example
	 * ```tsx
	 * const user = useAuthStore(state => state.user)
	 * // Use roleLevel directly (Zustand stores plain JSON, not class instances)
	 * const sections = NavigationService.getNavigationSections(user?.roleLevel)
	 * ```
	 */
	static getNavigationSections(userRole?: number | null): NavigationSection[] {
	// Check if user is an administrator (Admin level or higher, including SuperAdmin)
	// Using >= threshold check for proper RBAC hierarchy
	const isAdmin = userRole != null && userRole >= AccountRole.Admin

		// Initialize sections array with main section (visible to all)
		const sections: NavigationSection[] = [
			{
				id: 'main',
				title: 'Main',
				routes: [
				{
					id: 'dashboard',
					label: 'Dashboard',
					href: Routes.Dashboard.location,
					icon: 'dashboard',
					description: 'Overview and insights',
				},
					{
						id: 'store',
						label: 'Store',
						href: Routes.Store.location,
						icon: 'store',
						description: 'Browse our catalog',
					},
				],
			},
		]

		// Customer-specific sections (orders and quotes)
		// Shown only to non-admin users (regular customers)
		if (!isAdmin) {
			sections.push({
				id: 'my-orders',
				title: 'My Orders',
				routes: [
				{
					id: 'orders',
					label: 'Orders',
					href: Routes.Orders.location,
					icon: 'clipboard-list',
					description: 'Track your purchases',
				},
				{
					id: 'quotes',
					label: 'Quotes',
					href: Routes.Quotes.location,
					icon: 'receipt',
					description: 'Request price quotes',
				},
				],
			})
		}

		// Admin-specific sections (product management, user management, analytics)
		// Only visible to users with Admin role
		if (isAdmin) {
			sections.push(
				// Product and order management
				{
					id: 'management',
					title: 'Management',
					routes: [
					{
						id: 'products',
						label: 'Products',
						href: Routes.InternalStore.location,
						icon: 'package',
						description: 'Manage inventory',
					},
					{
						id: 'admin-orders',
						label: 'Orders',
						href: Routes.Orders.location,
						icon: 'clipboard-list',
						description: 'Process customer orders',
					},
				{
					id: 'admin-quotes',
					label: 'Quotes',
					href: Routes.Quotes.location,
					icon: 'receipt',
					description: 'Review quote requests',
				},
				],
				// Note: Section visibility controlled by isAdmin check (line 80), not roles array
			},
				// User and company management
				{
					id: 'users',
					title: 'Users',
					routes: [
					{
						id: 'accounts',
						label: 'Accounts',
						href: Routes.Accounts.location,
						icon: 'users',
						description: 'Manage user accounts',
					},
					{
						id: 'customers',
						label: 'Customers',
						href: Routes.Customers.location,
						icon: 'hospital',
						description: 'Healthcare facilities and professionals',
					},
				{
					id: 'providers',
					label: 'Providers',
					href: Routes.Providers.location,
					icon: 'factory',
					description: 'Supplier management',
				},
				],
				// Note: Section visibility controlled by isAdmin check (line 80), not roles array
			},
				// Analytics and reporting
				{
					id: 'analytics',
					title: 'Analytics',
					routes: [
				{
					id: 'analytics-dashboard',
					label: 'Analytics',
					href: Routes.Analytics.location,
					icon: 'bar-chart',
					description: 'Reports, metrics, and insights',
				},
				],
				// Note: Section visibility controlled by isAdmin check (line 80), not roles array
			},
				// RBAC/Access Control (Admin only)
				{
					id: 'rbac',
					title: 'Access Control',
					routes: [
					{
						id: 'rbac-dashboard',
						label: 'RBAC Dashboard',
						href: Routes.RBAC.location,
						icon: 'settings',
						description: 'Roles and permissions overview',
					},
					{
						id: 'rbac-roles',
						label: 'Role Definitions',
						href: Routes.RBAC.roles,
						icon: 'users',
						description: 'View role capabilities',
					},
				{
					id: 'rbac-permissions',
					label: 'Permissions Matrix',
					href: Routes.RBAC.permissions,
					icon: 'settings',
					description: 'Resource permissions by role',
				},
				],
				// Note: Section visibility controlled by isAdmin check (line 80), not roles array
			}
			)
		}

		// Account section (visible to all authenticated users)
		// Includes profile settings and notifications
		sections.push({
			id: 'account',
			title: 'Account',
			routes: [
			{
				id: 'profile',
				label: 'Profile',
				href: Routes.Profile.location,
				icon: 'user',
				description: 'View and edit profile',
			},
			{
				id: 'notifications',
				label: 'Notifications',
				href: Routes.Notifications.location,
				icon: 'bell',
				description: 'Manage notifications',
			},
			],
		})

		return sections
	}

	/**
	 * Finds a navigation route by its unique identifier.
	 * 
	 * Searches through all navigation sections to find a route matching
	 * the provided ID. Useful for programmatic navigation and route validation.
	 * 
	 * @param id - The unique identifier of the route
	 * @param userRole - Optional user role for filtering
	 * @returns The route if found, undefined otherwise
	 * 
	 * @example
	 * ```tsx
	 * const route = NavigationService.getRouteById('dashboard')
	 * if (route) {
	 *   router.push(route.href) // Navigate to Routes.Dashboard.location
	 * }
	 * ```
	 */
	static getRouteById(id: string, userRole?: number | null): NavigationRoute | undefined {
		const sections = this.getNavigationSections(userRole)
		for (const section of sections) {
			const route = section.routes.find((r) => r.id === id)
			if (route) {return route}
		}
		return undefined
	}

	/**
	 * Gets all routes from all sections (flattened).
	 * 
	 * @param userRole - Optional user role for filtering
	 * @returns Array of all routes
	 */
	static getAllRoutes(userRole?: number | null): NavigationRoute[] {
		const sections = this.getNavigationSections(userRole)
		return sections.flatMap((section) => section.routes)
	}
}


