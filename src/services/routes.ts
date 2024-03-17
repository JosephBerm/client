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
			name: 'Notifications',
			location: '/dashboard/notifications',
			icon: 'fa-solid fa-bell',
		},
		{
			name: 'Profile',
			location: '/dashboard/profile',
			icon: 'fa-solid fa-user',
			component: ProfilePreview,
		},
	]

	public static publicRoutes: Route[] = [
		{
			name: 'Home',
			location: '/',
			icon: 'fa-solid fa-house',
		},
		{
			name: 'Products',
			location: '/products',
			icon: 'fa-solid fa-store',
		},
		{
			name: 'Login',
			location: '/login',
			icon: 'fa-solid fa-door-closed',
		},
		{
			name: 'Cart',
			location: '/cart',
			icon: 'fa-solid fa-cart-shopping',
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
