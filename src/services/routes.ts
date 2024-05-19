import { NextRouter } from 'next/router'
import ProfilePreview from '@/components/ProfilePreview'
import Route from '@/interfaces/Route'

class Routes {
	private static router: NextRouter

	public static navRoutes: Route[] = [
		{
			name: 'Dashboard',
			location: '/dashboard',
			icon: 'fa-solid fa-house',
		},
		{
			name: 'Store',
			location: '/dashboard/store',
			icon: 'fa-solid fa-store',
		},
		{
			name: 'Quotes',
			location: '/dashboard/quotes',
			icon: 'fa-solid fa-list-check',
		},
		{
			name: 'Providers',
			location: '/dashboard/providers',
			icon: 'fa-solid fa-users',
		},
		{
			name: 'Orders',
			location: '/dashboard/orders',
			icon: 'fa-solid fa-dollar-sign',
		},
		{
			name: 'Notifications',
			location: '/dashboard/notifications',
			icon: 'fa-solid fa-bell',
		},
		{
			name: 'Accounts',
			location: '/dashboard/accounts',
			icon: 'fa-solid fa-users',
		},
		{
			name: 'Customers',
			location: '/dashboard/customers',
			icon: 'fa-solid fa-users',
		},
		{
			name: 'Profile',
			location: '/dashboard/profile',
			icon: 'fa-solid fa-user',
		},
	]

	public static publicRoutes: Route[] = [
		{
			name: 'Home',
			location: '/',
		},
		{
			name: 'About Us',
			location: '/about-us',
		},
		{
			name: 'Products',
			location: '/products',
		},
		{
			name: 'Contact',
			location: '/contact',
		},
	]

	static getCurrentPath(): string {
		if (!Routes.router) {
			throw new Error('Router not initialized')
		}
		return Routes.router.asPath
	}

	// Add more route-related methods as needed
}

export default Routes
