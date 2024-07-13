import { NextRouter } from 'next/router'
import Route from '@/interfaces/Route'
import { AccountRole } from '../classes/Enums'
import Products from '../components/Landing/Products'

class Routes {
	constructor() {}
	private static router: NextRouter
	public static InternalAppRoute: string = '/medsource-app'

	public static Orders: Route = {
		name: 'Orders',
		location: `${this.InternalAppRoute}/orders`,
		icon: 'fa-solid fa-truck',
		accessible: [AccountRole.Customer, AccountRole.Admin],
	}

	public static Signup: Route = {
		name: 'Sign Up',
		location: '/signup',
		icon: 'fa-solid fa-user-plus',
	}

	public static Login: Route = {
		name: 'LogIn',
		location: '/login',
		icon: 'fa-solid fa-user-plus',
	}

	public static Store: Route = {
		name: 'Store',
		location: '/store',
		icon: 'fa-solid fa-bag-shopping',
	}

	public static Product: Route = {
		name: 'Products',
		location: `${Routes.Store.location}/product`,
		icon: 'fa-solid fa-box',
	}

	public static internalRoutes: Route[] = [
		{
			name: 'Dashboard',
			location: this.InternalAppRoute,
			icon: 'fa-solid fa-house',
			accessible: [AccountRole.Customer],
		},
		Routes.Orders,
		{
			name: 'Store',
			location: `${this.InternalAppRoute}/store`,
			icon: 'fa-solid fa-store',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Quotes',
			location: `${this.InternalAppRoute}/quotes`,
			icon: 'fa-solid fa-list-check',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Providers',
			location: `${this.InternalAppRoute}/providers`,
			icon: 'fa-solid fa-users',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Accounts',
			location: `${this.InternalAppRoute}/accounts`,
			icon: 'fa-solid fa-users',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Customers',
			location: `${this.InternalAppRoute}/customers`,
			icon: 'fa-solid fa-users',
			accessible: [AccountRole.Admin],
		},
		Routes.Store,
		{
			name: 'Manage Orders',
			location: `${this.InternalAppRoute}/adminorders`,
			icon: 'fa-solid fa-user',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Profile',
			location: `${this.InternalAppRoute}/profile`,
			icon: 'fa-solid fa-user',
			accessible: [AccountRole.Customer, AccountRole.Admin],
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
		Routes.Store,
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
