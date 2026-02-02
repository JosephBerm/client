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
import { RoleLevels } from '@_types/navigation'

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
	 * **Role Levels:**
	 * - Customer: 1000 (base level)
	 * - FulfillmentCoordinator: 2000 (operations track - fulfillment, shipping)
	 * - SalesRep: 3000 (sales track - customers, quotes, orders)
	 * - SalesManager: 4000 (sales management - approvals, team oversight)
	 * - Admin: 5000 (full access to all sections)
	 * - SuperAdmin: 9999 (system administration + tenant management)
	 *
	 * **Important:** FulfillmentCoordinator and SalesRep are PARALLEL role tracks.
	 * A SalesRep does NOT inherit FulfillmentCoordinator access automatically.
	 * Only Admin+ has access to BOTH tracks.
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
		const isAdmin = userRole != null && userRole >= RoleLevels.Admin

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

		// Check role levels for different access
		// Note: FulfillmentCoordinator and SalesRep are PARALLEL role tracks, not hierarchical
		// FulfillmentCoordinator = operations track (fulfillment, shipping)
		// SalesRep = sales track (customers, quotes, orders)
		// Only Admin+ has access to BOTH tracks
		const isFulfillmentCoordinator =
			userRole != null && userRole >= RoleLevels.FulfillmentCoordinator && userRole < RoleLevels.SalesRep
		const isSalesRep = userRole != null && userRole >= RoleLevels.SalesRep
		const isSalesManager = userRole != null && userRole >= RoleLevels.SalesManager
		const isSuperAdmin = userRole != null && userRole >= RoleLevels.SuperAdmin

		// Operations section - ONLY for FulfillmentCoordinator role (not Sales track)
		// PRD: Fulfillment Coordinator focuses on order fulfillment and shipping coordination
		if (isFulfillmentCoordinator && !isAdmin) {
			sections.push({
				id: 'operations',
				title: 'Operations',
				routes: [
					{
						id: 'fulfillment',
						label: 'Fulfillment Queue',
						href: Routes.Fulfillment.location,
						icon: 'truck',
						description: 'Process and ship orders',
					},
					{
						id: 'inventory',
						label: 'Inventory',
						href: Routes.Inventory.location,
						icon: 'archive',
						description: 'View stock levels',
					},
				],
			})
		}

		// Sales section - For SalesRep and SalesManager (sales track)
		// PRD: Sales Rep manages customer relationships, quotes, and orders
		if (isSalesRep && !isAdmin) {
			const salesRoutes: NavigationRoute[] = [
				{
					id: 'customers',
					label: 'Customers',
					href: Routes.Customers.location,
					icon: 'hospital',
					description: 'Manage assigned customers',
				},
			]

			// Approval Queue for SalesManager+ only
			if (isSalesManager) {
				salesRoutes.push({
					id: 'approvals',
					label: 'Approval Queue',
					href: Routes.Approvals.location,
					icon: 'check-circle',
					description: 'Review pending approvals',
				})
			}

			sections.push({
				id: 'sales',
				title: 'Sales',
				routes: salesRoutes,
			})
		}

		// Pricing Engine section (SalesRep+ for viewing, Admin for management)
		// PRD Reference: client/md/PRDs/internal-routes/prd_pricing_engine.md
		// Role-Based Access: View: Admin, SalesManager, SalesRep | Manage: Admin only
		if (isSalesRep) {
			sections.push({
				id: 'pricing',
				title: 'Pricing',
				routes: [
					{
						id: 'pricing-dashboard',
						label: 'Pricing Dashboard',
						href: Routes.Pricing.location,
						icon: 'receipt',
						description: 'Advanced B2B pricing management',
					},
					{
						id: 'price-lists',
						label: 'Price Lists',
						href: Routes.Pricing.priceLists,
						icon: 'clipboard-list',
						description: 'Contract and customer pricing',
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
							description: 'Manage product catalog',
						},
						{
							id: 'inventory',
							label: 'Inventory',
							href: Routes.Inventory.location,
							icon: 'archive',
							description: 'Stock levels and tracking',
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
						{
							id: 'fulfillment',
							label: 'Fulfillment Queue',
							href: Routes.Fulfillment.location,
							icon: 'truck',
							description: 'Process and ship orders',
						},
						{
							id: 'approvals',
							label: 'Approval Queue',
							href: Routes.Approvals.location,
							icon: 'check-circle',
							description: 'Review pending approvals',
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
				// Note: Pricing section moved outside admin block - visible to SalesRep+
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
						// Tenants visible only to SuperAdmin
						...(isSuperAdmin
							? [
									{
										id: 'tenants',
										label: 'Tenants',
										href: Routes.Tenants.location,
										icon: 'building' as const,
										description: 'Multi-tenant management',
									},
							  ]
							: []),
					],
					// Note: Section visibility controlled by isAdmin check (line 80), not roles array
				},
				// ERP Integrations (Admin only)
				// PRD Reference: client/md/PRDs/internal-routes/prd_erp_integration.md
				{
					id: 'integrations',
					title: 'Integrations',
					routes: [
						{
							id: 'integrations-dashboard',
							label: 'ERP Integrations',
							href: Routes.Integrations.location,
							icon: 'plug',
							description: 'Connect and manage ERP systems',
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
			if (route) {
				return route
			}
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
