import { NextRouter } from 'next/router'
import ProfilePreview from '@/components/ProfilePreview'
import Route from '@/interfaces/Route'
import InputTextBox, { InputType } from '@/components/InputTextBox'
import { AccountRole } from '../classes/Enums'

class Routes {
	public static InternalAppRoute: string = '/medsource-app'
	public static CustomerAppRoute: string = '/customer'
	private static router: NextRouter
	public static internalRoutes: Route[] = [
		{
			name: 'Dashboard',
			location: this.InternalAppRoute,
			icon: 'fa-solid fa-house',
			accessable: AccountRole.Customer,
		},
		{
			name: 'Store',
			location: `${this.InternalAppRoute}/store`,
			icon: 'fa-solid fa-store',
			accessable: AccountRole.Admin,
		},
		{
			name: 'Quotes',
			location: `${this.InternalAppRoute}/quotes`,
			icon: 'fa-solid fa-list-check',
			accessable: AccountRole.Admin,
		},
		{
			name: 'Providers',
			location: `${this.InternalAppRoute}/providers`,
			icon: 'fa-solid fa-users',
			accessable: AccountRole.Admin,
		},
		{
			name: 'Orders',
			location: `${this.InternalAppRoute}/orders`,
			icon: 'fa-solid fa-dollar-sign',
			accessable: AccountRole.Admin,
		},
		{
			name: 'Notifications',
			location: `${this.InternalAppRoute}/notifications`,
			icon: 'fa-solid fa-bell',
			accessable: AccountRole.Customer,
		},
		{
			name: 'Accounts',
			location: `${this.InternalAppRoute}/accounts`,
			icon: 'fa-solid fa-users',
			accessable: AccountRole.Admin,
		},
		{
			name: 'Customers',
			location: `${this.InternalAppRoute}/customers`,
			icon: 'fa-solid fa-users',
			accessable: AccountRole.Admin,
		},
		{
			name: 'Profile',
			location: `${this.InternalAppRoute}/profile`,
			icon: 'fa-solid fa-user',
			accessable: AccountRole.Customer,
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

	public static customerRoutes: Route[] = [
		{
			name: 'Dashboard',
			location: this.CustomerAppRoute,
		},
		{
			name: 'Cart',
			location: `${this.CustomerAppRoute}/cart`,
		},
		{
			name: 'Orders',
			location: `${this.CustomerAppRoute}/orders`,
		},
		{
			name: 'Profile',
			location: `${this.CustomerAppRoute}/profile`,
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
