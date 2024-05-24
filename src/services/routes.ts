import { NextRouter } from 'next/router'
import ProfilePreview from '@/components/ProfilePreview'
import Route from '@/interfaces/Route'
import InputTextBox, { InputType } from '@/components/InputTextBox'

class Routes {
	private static router: NextRouter
	public static internalRoutes: Route[] = [
		{
			name: 'Dashboard',
			location: '/employee-dashboard',
			icon: 'fa-solid fa-house',
		},
		{
			name: 'Store',
			location: '/employee-dashboard/store',
			icon: 'fa-solid fa-store',
		},
		{
			name: 'Quotes',
			location: '/employee-dashboard/quotes',
			icon: 'fa-solid fa-list-check',
		},
		{
			name: 'Providers',
			location: '/employee-dashboard/providers',
			icon: 'fa-solid fa-users',
		},
		{
			name: 'Orders',
			location: '/employee-dashboard/orders',
			icon: 'fa-solid fa-dollar-sign',
		},
		{
			name: 'Notifications',
			location: '/employee-dashboard/notifications',
			icon: 'fa-solid fa-bell',
		},
		{
			name: 'Accounts',
			location: '/employee-dashboard/accounts',
			icon: 'fa-solid fa-users',
		},
		{
			name: 'Customers',
			location: '/employee-dashboard/customers',
			icon: 'fa-solid fa-users',
		},
		{
			name: 'Profile',
			location: '/employee-dashboard/profile',
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
