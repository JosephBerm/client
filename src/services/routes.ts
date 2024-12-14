import { NextRouter } from 'next/router'
import IRoute from '@/interfaces/Route'
import { AccountRole, PublicRouteType } from '../classes/Enums'
import Products from '../components/Landing/Products'

class Routes {
	constructor() {}
	private static router: NextRouter
	public static InternalAppRoute: string = '/medsource-app'

	public static Orders: IRoute = {
		name: 'Orders',
		location: `${this.InternalAppRoute}/orders`,
		icon: 'fa-solid fa-truck',
		accessible: [AccountRole.Customer, AccountRole.Admin],
	}

	public static Signup: IRoute = {
		name: 'Sign Up',
		location: '/signup',
		icon: 'fa-solid fa-user-plus',
	}

	public static Login: IRoute = {
		name: 'LogIn',
		location: '/login',
		icon: 'fa-solid fa-user-plus',
	}

	public static Store: IRoute<PublicRouteType> = {
		name: 'Store',
		location: '/store',
		icon: 'fa-solid fa-bag-shopping',
		value: PublicRouteType.Store,
	}

	public static Product: IRoute = {
		name: 'Products',
		location: `${Routes.Store.location}/product`,
		icon: 'fa-solid fa-box',
	}

	public static internalRoutes: IRoute[] = [
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
			icon: 'fa-solid fa-hand-holding-dollar',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Accounts',
			location: `${this.InternalAppRoute}/accounts`,
			icon: 'fa-solid fa-id-badge',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Customers',
			location: `${this.InternalAppRoute}/customers`,
			icon: 'fa-solid fa-users',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Analytics',
			location: `${this.InternalAppRoute}/analytics`,
			icon: 'fa-solid fa-chart-line',
			accessible: [AccountRole.Admin],
		},
		{
			name: 'Profile',
			location: `${this.InternalAppRoute}/profile`,
			icon: 'fa-solid fa-user',
			accessible: [AccountRole.Customer, AccountRole.Admin],
		},
	]

	public static publicRoutes: IRoute<PublicRouteType>[] = [
		{
			name: 'Home',
			location: '/',
			value: PublicRouteType.Home,
		},
		{
			name: 'About Us',
			location: '/about-us',
			value: PublicRouteType.AboutUs,
		},
		Routes.Store,
		{
			name: 'Contact',
			location: '/contact',
			value: PublicRouteType.Contact,
		},
	]

	static getCurrentPath(): string {
		if (!Routes.router) {
			throw new Error('Router not initialized')
		}
		return Routes.router.asPath
	}

	// Add more route-related methods as needed
	static getPublicRouteByValue(value: PublicRouteType): IRoute<PublicRouteType> {
		return Routes.publicRoutes.find((route) => route.value === value) as IRoute<PublicRouteType>
	}
}

export default Routes
