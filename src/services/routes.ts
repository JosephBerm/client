import { NextRouter } from 'next/router'
import ProfilePreview from '@/components/ProfilePreview'
import Route from '@/interfaces/Route'
import InputTextBox, { InputType } from '@/components/InputTextBox'
import { AccountRole } from '../classes/Enums'

class Routes {
	constructor() {}
	private static router: NextRouter

	public static InternalAppRoute: string = '/medsource-app'
	public static internalRoutes: Route[] = [
		{
			name: 'Dashboard',
			location: this.InternalAppRoute,
			icon: 'fa-solid fa-house',
			accessible: [AccountRole.Customer],
		},
		{
			name: 'Orders',
			location: `${this.InternalAppRoute}/orders`,
			icon: 'fa-solid fa-truck',
			accessible: [AccountRole.Customer, AccountRole.Admin],
		},
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
