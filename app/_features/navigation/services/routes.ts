/**
 * Centralized Route Definitions
 * 
 * Provides type-safe route paths and display names for the entire application.
 * All routes are defined as static properties for easy import and use throughout the app.
 * 
 * **Benefits:**
 * - Single source of truth for all routes
 * - Prevents hardcoded URL strings
 * - Easy to refactor routes (change in one place)
 * - Type-safe route references
 * - Includes both public and protected routes
 * 
 * **Route Structure:**
 * - Public routes: Accessible without authentication (/, /login, /store, etc.)
 * - Internal routes: Protected by middleware under /medsource-app/* path
 * 
 * @example
 * ```typescript
 * import { Routes } from '@_features/navigation';
 * 
 * // Navigate to dashboard
 * router.push(Routes.Dashboard.location); // "/medsource-app"
 * 
 * // Navigate to orders
 * router.push(Routes.Orders.location); // "/medsource-app/orders"
 * 
 * // Create dynamic product link
 * const productUrl = `${Routes.Product.location}/${productId}`;
 * ```
 * 
 * @module Routes
 */

/**
 * Route definitions class with static properties for all application routes.
 * Each route object contains a display name and URL path.
 */
class Routes {
	/**
	 * Base path for all protected/authenticated routes.
	 * All routes under this path require authentication (enforced by middleware).
	 */
	public static InternalAppRoute: string = '/medsource-app'

	/** Orders management route (protected) */
	public static Orders = {
		name: 'Orders',
		location: `${Routes.InternalAppRoute}/orders`,
	}

	/** User signup/registration route (public) */
	public static Signup = {
		name: 'Sign Up',
		location: '/signup',
	}

	/** User login route (public) */
	public static Login = {
		name: 'LogIn',
		location: '/login',
	}

	/** Public product store route (accessible to all) */
	public static Store = {
		name: 'Store',
		location: '/store',
	}

	/** Public product detail route (accessible to all) */
	public static Product = {
		name: 'Products',
		location: `${Routes.Store.location}/product`,
	}

	/** Dashboard/home route for authenticated users (protected) */
	public static Dashboard = {
		name: 'Dashboard',
		location: Routes.InternalAppRoute,
	}

	/** Internal product management for admins (protected) */
	public static InternalStore = {
		name: 'Store',
		location: `${Routes.InternalAppRoute}/store`,
	}

	/** Quote requests management (protected) */
	public static Quotes = {
		name: 'Quotes',
		location: `${Routes.InternalAppRoute}/quotes`,
	}

	/** Provider/supplier management (protected, admin only) */
	public static Providers = {
		name: 'Providers',
		location: `${Routes.InternalAppRoute}/providers`,
	}

	/** User accounts management (protected, admin only) */
	public static Accounts = {
		name: 'Accounts',
		location: `${Routes.InternalAppRoute}/accounts`,
	}

	/** Customer/company management (protected, admin only) */
	public static Customers = {
		name: 'Customers',
		location: `${Routes.InternalAppRoute}/customers`,
	}

	/** Analytics dashboard (protected, admin only) */
	public static Analytics = {
		name: 'Analytics',
		location: `${Routes.InternalAppRoute}/analytics`,
	}

	/** User profile settings (protected) */
	public static Profile = {
		name: 'Profile',
		location: `${Routes.InternalAppRoute}/profile`,
	}

	/** Home/landing page (public) */
	public static Home = {
		name: 'Home',
		location: '/',
	}

	/** About us page (public) */
	public static AboutUs = {
		name: 'About Us',
		location: '/about-us',
	}

	/** Contact form page (public) */
	public static Contact = {
		name: 'Contact',
		location: '/contact',
	}

	/** Shopping cart page (public) */
	public static Cart = {
		name: 'Cart',
		location: '/cart',
	}
}

export default Routes

