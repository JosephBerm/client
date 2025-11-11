// Simplified Routes service for modernized frontend
// This maintains compatibility with legacy code while using modern patterns

class Routes {
	public static InternalAppRoute: string = '/medsource-app'

	public static Orders = {
		name: 'Orders',
		location: `${Routes.InternalAppRoute}/orders`,
	}

	public static Signup = {
		name: 'Sign Up',
		location: '/signup',
	}

	public static Login = {
		name: 'LogIn',
		location: '/login',
	}

	public static Store = {
		name: 'Store',
		location: '/store',
	}

	public static Product = {
		name: 'Products',
		location: `${Routes.Store.location}/product`,
	}

	public static Dashboard = {
		name: 'Dashboard',
		location: Routes.InternalAppRoute,
	}

	public static InternalStore = {
		name: 'Store',
		location: `${Routes.InternalAppRoute}/store`,
	}

	public static Quotes = {
		name: 'Quotes',
		location: `${Routes.InternalAppRoute}/quotes`,
	}

	public static Providers = {
		name: 'Providers',
		location: `${Routes.InternalAppRoute}/providers`,
	}

	public static Accounts = {
		name: 'Accounts',
		location: `${Routes.InternalAppRoute}/accounts`,
	}

	public static Customers = {
		name: 'Customers',
		location: `${Routes.InternalAppRoute}/customers`,
	}

	public static Analytics = {
		name: 'Analytics',
		location: `${Routes.InternalAppRoute}/analytics`,
	}

	public static Profile = {
		name: 'Profile',
		location: `${Routes.InternalAppRoute}/profile`,
	}

	public static Home = {
		name: 'Home',
		location: '/',
	}

	public static AboutUs = {
		name: 'About Us',
		location: '/about-us',
	}

	public static Contact = {
		name: 'Contact',
		location: '/contact',
	}

	public static Cart = {
		name: 'Cart',
		location: '/cart',
	}
}

export default Routes

