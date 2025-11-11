/**
 * Navigation Service
 * 
 * Manages application navigation structure with role-based access control.
 * Generates dynamic navigation menus based on user roles (Customer vs Admin).
 * Uses Lucide React icons for a consistent, modern icon system.
 * 
 * **Features:**
 * - Role-based navigation filtering
 * - Icon management with Lucide React
 * - Type-safe navigation structure
 * - Optional badge support for notifications
 * - Sectioned navigation for better organization
 * 
 * **Navigation Sections:**
 * - Main: Dashboard, Public Store (all users)
 * - My Orders: Orders, Quotes (customers only)
 * - Management: Products, Orders, Quotes (admin only)
 * - Users: Accounts, Customers, Providers (admin only)
 * - Analytics: Dashboard (admin only)
 * - Account: Profile, Notifications (all users)
 * 
 * @module NavigationService
 */

import type { LucideIcon } from 'lucide-react'
import {
	LayoutDashboard,
	Package,
	FileText,
	ShoppingCart,
	Users,
	Building2,
	BarChart3,
	User,
	Settings,
	ShoppingBag,
} from 'lucide-react'

/**
 * Single navigation menu item with icon and optional badge.
 */
export interface NavigationItem {
	/** Display title for the navigation item */
	title: string
	/** URL path to navigate to */
	href: string
	/** Lucide React icon component */
	icon: LucideIcon
	/** Optional badge number (e.g., notification count) */
	badge?: number
	/** Optional role restriction (empty = visible to all) */
	roles?: number[]
}

/**
 * Navigation section containing multiple related items.
 * Sections help organize the sidebar into logical groups.
 */
export interface NavigationSection {
	/** Section header title */
	title: string
	/** Array of navigation items in this section */
	items: NavigationItem[]
	/** Optional role restriction for entire section */
	roles?: number[]
}

/**
 * User role definitions matching the backend enum values.
 * Used for role-based navigation filtering and access control.
 * 
 * @constant
 */
export const UserRoles = {
	/** Customer role (default users) */
	Customer: 0,
	/** Administrator role (full access) */
	Admin: 9999999,
} as const

/**
 * Generates navigation sections dynamically based on user role.
 * Filters sections and items to only show what the user has access to.
 * 
 * **Navigation Structure:**
 * - Customers see: Dashboard, Store, My Orders, Profile
 * - Admins see: Dashboard, Store, Management, Users, Analytics, Profile
 * 
 * @param {number | null} userRole - User's role number (0 = Customer, 9999999 = Admin, null = not logged in)
 * 
 * @returns {NavigationSection[]} Array of navigation sections filtered by role
 * 
 * @example
 * ```typescript
 * // Get navigation for a customer
 * const customerNav = getNavigationSections(UserRoles.Customer);
 * // Returns: Main, My Orders, Account sections
 * 
 * // Get navigation for an admin
 * const adminNav = getNavigationSections(UserRoles.Admin);
 * // Returns: Main, Management, Users, Analytics, Account sections
 * 
 * // Use in Sidebar component
 * const user = useAuthStore(state => state.user);
 * const sections = getNavigationSections(user?.role);
 * 
 * sections.map(section => (
 *   <div key={section.title}>
 *     <h3>{section.title}</h3>
 *     {section.items.map(item => (
 *       <Link key={item.href} href={item.href}>
 *         <item.icon /> {item.title}
 *       </Link>
 *     ))}
 *   </div>
 * ));
 * ```
 */
export function getNavigationSections(userRole?: number | null): NavigationSection[] {
	// Check if user is an administrator
	const isAdmin = userRole === UserRoles.Admin

	// Initialize sections array with main section (visible to all)
	const sections: NavigationSection[] = [
		{
			title: 'Main',
			items: [
				{
					title: 'Dashboard',
					href: '/medsource-app',
					icon: LayoutDashboard,
				},
				{
					title: 'Store',
					href: '/store',  // Public store (browsing)
					icon: ShoppingBag,
				},
			],
		},
	]

	// Customer-specific sections (orders and quotes)
	// Shown only to non-admin users (regular customers)
	if (!isAdmin) {
		sections.push({
			title: 'My Orders',
			items: [
				{
					title: 'Orders',
					href: '/medsource-app/orders',
					icon: ShoppingCart,
				},
				{
					title: 'Quotes',
					href: '/medsource-app/quotes',
					icon: FileText,
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
				title: 'Management',
				items: [
					{
						title: 'Products',
						href: '/medsource-app/store',  // Internal product management
						icon: Package,
					},
					{
						title: 'Orders',
						href: '/medsource-app/orders',  // All orders
						icon: ShoppingCart,
					},
					{
						title: 'Quotes',
						href: '/medsource-app/quotes',  // All quote requests
						icon: FileText,
					},
				],
				roles: [UserRoles.Admin],
			},
			// User and company management
			{
				title: 'Users',
				items: [
					{
						title: 'Accounts',
						href: '/medsource-app/accounts',
						icon: Users,
					},
					{
						title: 'Customers',
						href: '/medsource-app/customers',
						icon: Building2,
					},
					{
						title: 'Providers',
						href: '/medsource-app/providers',
						icon: Building2,
					},
				],
				roles: [UserRoles.Admin],
			},
			// Analytics and reporting
			{
				title: 'Analytics',
				items: [
					{
						title: 'Dashboard',
						href: '/medsource-app/analytics',
						icon: BarChart3,
					},
				],
				roles: [UserRoles.Admin],
			}
		)
	}

	// Account section (visible to all authenticated users)
	// Includes profile settings and notifications
	sections.push({
		title: 'Account',
		items: [
			{
				title: 'Profile',
				href: '/medsource-app/profile',
				icon: User,
			},
			{
				title: 'Notifications',
				href: '/medsource-app/notifications',
				icon: Settings,
			},
		],
	})

	return sections
}


