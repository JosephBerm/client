import { NextRouter } from 'next/router'
import Route from '@/interfaces/Route'
import { AccountRole } from '../classes/Enums'

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

	public static SignUp: Route = {
		name: 'Sign Up',
		location: '/signup',
		icon: 'fa-solid fa-user-plus',
		accessible: [AccountRole.Customer, AccountRole.Admin],
	}

	public static Login: Route = {
		name: 'LogIn',
		location: '/login',
		icon: 'fa-solid fa-user-plus',
		accessible: [AccountRole.Customer, AccountRole.Admin],
	}

	public static Products: Route = {
		name: 'Products',
		location: '/products',
		icon: 'fa-solid fa-bag-shopping',
		accessible: [AccountRole.Customer],
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
		Routes.Products,
		{
			name: 'Profile',
			location: `${this.InternalAppRoute}/profile`,
			icon: 'fa-solid fa-user',
			accessible: [AccountRole.Customer],
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
		Routes.Products,
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
