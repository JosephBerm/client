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

export interface NavigationItem {
	title: string
	href: string
	icon: LucideIcon
	badge?: number
	roles?: number[] // Which user roles can see this item (empty = all)
}

export interface NavigationSection {
	title: string
	items: NavigationItem[]
	roles?: number[] // Which user roles can see this section
}

// Role definitions (matching backend)
export const UserRoles = {
	Customer: 0,
	Admin: 9999999,
} as const

/**
 * Get navigation sections based on user role
 */
export function getNavigationSections(userRole?: number | null): NavigationSection[] {
	const isAdmin = userRole === UserRoles.Admin

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
					href: '/store',
					icon: ShoppingBag,
				},
			],
		},
	]

	// Customer sections
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

	// Admin sections
	if (isAdmin) {
		sections.push(
			{
				title: 'Management',
				items: [
					{
						title: 'Products',
						href: '/medsource-app/store',
						icon: Package,
					},
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
				roles: [UserRoles.Admin],
			},
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

	// Profile section (available to all authenticated users)
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


