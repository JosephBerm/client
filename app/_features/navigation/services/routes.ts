/**
 * Centralized Route Definitions - FAANG-Level Route Management
 * 
 * Provides type-safe route paths and dynamic route builders for the entire application.
 * Implements industry best practices from Google, Stripe, Airbnb, and Vercel.
 * 
 * **Benefits:**
 * - Single source of truth for all routes (DRY principle)
 * - Prevents hardcoded URL strings (zero magic strings)
 * - Easy to refactor routes (change in one place, updates everywhere)
 * - Type-safe route references (TypeScript strict mode)
 * - Dynamic route builders (e.g., `Routes.Orders.detail(id)`)
 * - Query parameter support (FAANG-level pattern)
 * - Zero runtime errors from typos in URLs
 * 
 * **Route Structure:**
 * - Public routes: Accessible without authentication (/, /store, etc.)
 * - Internal routes: Protected by middleware under /app/* path
 * - Static routes: Use `.location` property
 * - Dynamic routes: Use builder methods (`.detail()`, `.create()`, etc.)
 * - Query parameters: Pass object to builder methods (e.g., `Routes.Accounts.create({ customerId: '123' })`)
 * 
 * **FAANG-Level Patterns:**
 * - Route Builder Pattern (Stripe, Airbnb)
 * - Namespaced Route Objects (Google)
 * - Type-Safe Path Generation (Vercel)
 * - Query Parameter Builder (Next.js, Vercel)
 * 
 * @example
 * ```typescript
 * import { Routes } from '@_features/navigation';
 * 
 * // Static routes
 * router.push(Routes.Dashboard.location); // "/app"
 * router.push(Routes.Orders.location); // "/app/orders"
 * 
 * // Dynamic routes (RECOMMENDED - prevents hardcoding)
 * router.push(Routes.Orders.detail('123')); // "/app/orders/123"
 * router.push(Routes.Customers.detail('456')); // "/app/customers/456"
 * 
 * // With query parameters
 * router.push(Routes.Accounts.create({ customerId: '123' })); // "/app/accounts/create?customerId=123"
 * 
 * // In Link components
 * <Link href={Routes.Orders.detail(orderId)}>View Order</Link>
 * 
 * // In table cells
 * cell: ({ row }) => (
 *   <Link href={Routes.Orders.detail(row.original.id)}>
 *     {row.original.orderNumber}
 *   </Link>
 * )
 * ```
 * 
 * @module Routes
 */

/**
 * Helper function to append query parameters to a URL.
 * Follows FAANG-level patterns for URL construction (Next.js, Vercel).
 * 
 * @param baseUrl - Base URL without query parameters
 * @param params - Optional object with query parameters
 * @returns URL with query parameters appended
 * 
 * @example
 * ```typescript
 * appendQueryParams('/app/accounts/create', { customerId: '123' })
 * // Returns: "/app/accounts/create?customerId=123"
 * ```
 */
function appendQueryParams(baseUrl: string, params?: Record<string, string | number | undefined>): string {
	if (!params || Object.keys(params).length === 0) {
		return baseUrl
	}

	const searchParams = new URLSearchParams()
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			searchParams.append(key, String(value))
		}
	}

	const queryString = searchParams.toString()
	return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * Route definitions class with static properties for all application routes.
 * Each route object contains a display name, URL path, and builder methods for dynamic routes.
 * 
 * **FAANG-Level Architecture:**
 * - Static routes use `.location` property
 * - Dynamic routes use builder methods (`.detail()`, `.create()`, `.edit()`)
 * - All methods are type-safe and prevent hardcoded URLs
 * - Single source of truth for all route patterns
 */
class Routes {
	/**
	 * Base path for all protected/authenticated routes.
	 * All routes under this path require authentication (enforced by middleware).
	 */
	public static InternalAppRoute: string = '/app'

	/**
	 * Orders management routes (protected)
	 * 
	 * @example
	 * ```typescript
	 * // List page
	 * router.push(Routes.Orders.location); // "/app/orders"
	 * 
	 * // Detail page
	 * router.push(Routes.Orders.detail('123')); // "/app/orders/123"
	 * 
	 * // Create page
	 * router.push(Routes.Orders.create()); // "/app/orders/create"
	 * ```
	 */
	public static Orders = {
		name: 'Orders',
		location: `${Routes.InternalAppRoute}/orders`,
		/**
		 * Generates URL for order detail page.
		 * @param id - Order ID
		 * @returns Order detail URL (e.g., "/app/orders/123")
		 */
		detail: (id: string | number): string => `${Routes.InternalAppRoute}/orders/${id}`,
		/**
		 * Generates URL for order creation page.
		 * @param params - Optional query parameters
		 * @returns Order create URL (e.g., "/app/orders/create")
		 */
		create: (params?: Record<string, string | number>): string => 
			appendQueryParams(`${Routes.InternalAppRoute}/orders/create`, params),
	}

	/**
	 * Public product store routes (accessible to all)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Store.location); // "/store"
	 * router.push(Routes.Store.withCategory('123')); // "/store?category=123"
	 * router.push(Routes.Store.product('505')); // "/store/product/505"
	 * ```
	 */
	public static Store = {
		name: 'Store',
		location: '/store',
		/**
		 * Generates URL for store page with category filter.
		 * @param categoryId - Category ID to filter by
		 * @returns Store URL with category query parameter (e.g., "/store?category=123")
		 */
		withCategory: (categoryId: string | number): string => 
			appendQueryParams('/store', { category: categoryId }),
		/**
		 * Generates URL for public product detail page.
		 * @param id - Product ID
		 * @returns Product detail URL (e.g., "/store/product/505")
		 */
		product: (id: string | number): string => `/store/product/${id}`,
	}

	/** Dashboard/home route for authenticated users (protected) */
	public static Dashboard = {
		name: 'Dashboard',
		location: Routes.InternalAppRoute,
	}

	/**
	 * Internal product management routes for admins (protected)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.InternalStore.location); // "/app/store"
	 * router.push(Routes.InternalStore.detail('303')); // "/app/store/303"
	 * ```
	 */
	public static InternalStore = {
		name: 'Store',
		location: `${Routes.InternalAppRoute}/store`,
		/**
		 * Generates URL for product detail page.
		 * @param id - Product ID
		 * @returns Product detail URL (e.g., "/app/store/303")
		 */
		detail: (id: string | number): string => `${Routes.InternalAppRoute}/store/${id}`,
		/**
		 * Generates URL for product creation page.
		 * @param params - Optional query parameters
		 * @returns Product create URL (e.g., "/app/store/create")
		 */
		create: (params?: Record<string, string | number>): string => 
			appendQueryParams(`${Routes.InternalAppRoute}/store/create`, params),
	}

	/**
	 * Quote requests management routes (protected)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Quotes.location); // "/app/quotes"
	 * router.push(Routes.Quotes.detail('456')); // "/app/quotes/456"
	 * ```
	 */
	public static Quotes = {
		name: 'Quotes',
		location: `${Routes.InternalAppRoute}/quotes`,
		/**
		 * Generates URL for quote detail page.
		 * @param id - Quote ID
		 * @returns Quote detail URL (e.g., "/app/quotes/456")
		 */
		detail: (id: string | number): string => `${Routes.InternalAppRoute}/quotes/${id}`,
		/**
		 * Generates URL for quote creation page.
		 * @param params - Optional query parameters
		 * @returns Quote create URL (e.g., "/app/quotes/create")
		 */
		create: (params?: Record<string, string | number>): string => 
			appendQueryParams(`${Routes.InternalAppRoute}/quotes/create`, params),
	}

	/**
	 * Provider/supplier management routes (protected, admin only)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Providers.location); // "/app/providers"
	 * router.push(Routes.Providers.detail('789')); // "/app/providers/789"
	 * ```
	 */
	public static Providers = {
		name: 'Providers',
		location: `${Routes.InternalAppRoute}/providers`,
		/**
		 * Generates URL for provider detail page.
		 * @param id - Provider ID
		 * @returns Provider detail URL (e.g., "/app/providers/789")
		 */
		detail: (id: string | number): string => `${Routes.InternalAppRoute}/providers/${id}`,
		/**
		 * Generates URL for provider creation page.
		 * @param params - Optional query parameters
		 * @returns Provider create URL (e.g., "/app/providers/create")
		 */
		create: (params?: Record<string, string | number>): string => 
			appendQueryParams(`${Routes.InternalAppRoute}/providers/create`, params),
	}

	/**
	 * User accounts management routes (protected, admin only)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Accounts.location); // "/app/accounts"
	 * router.push(Routes.Accounts.detail('101')); // "/app/accounts/101"
	 * ```
	 */
	public static Accounts = {
		name: 'Accounts',
		location: `${Routes.InternalAppRoute}/accounts`,
		/**
		 * Generates URL for account detail page.
		 * @param id - Account ID
		 * @returns Account detail URL (e.g., "/app/accounts/101")
		 */
		detail: (id: string | number): string => `${Routes.InternalAppRoute}/accounts/${id}`,
		/**
		 * Generates URL for account creation page.
		 * @param params - Optional query parameters (e.g., { customerId: '123' })
		 * @returns Account create URL (e.g., "/app/accounts/create" or "/app/accounts/create?customerId=123")
		 */
		create: (params?: { customerId?: string | number }): string => 
			appendQueryParams(`${Routes.InternalAppRoute}/accounts/create`, params),
	}

	/**
	 * Customer/company management routes (protected, admin only)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Customers.location); // "/app/customers"
	 * router.push(Routes.Customers.detail('202')); // "/app/customers/202"
	 * ```
	 */
	public static Customers = {
		name: 'Customers',
		location: `${Routes.InternalAppRoute}/customers`,
		/**
		 * Generates URL for customer detail page.
		 * @param id - Customer ID
		 * @returns Customer detail URL (e.g., "/app/customers/202")
		 */
		detail: (id: string | number): string => `${Routes.InternalAppRoute}/customers/${id}`,
		/**
		 * Generates URL for customer creation page.
		 * @param params - Optional query parameters
		 * @returns Customer create URL (e.g., "/app/customers/create")
		 */
		create: (params?: Record<string, string | number>): string => 
			appendQueryParams(`${Routes.InternalAppRoute}/customers/create`, params),
	}

	/** Analytics dashboard (protected, admin only) */
	public static Analytics = {
		name: 'Analytics',
		location: `${Routes.InternalAppRoute}/analytics`,
	}

	/**
	 * User profile settings route (protected)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Profile.location); // "/app/profile"
	 * ```
	 */
	public static Profile = {
		name: 'Profile',
		location: `${Routes.InternalAppRoute}/profile`,
	}

	/**
	 * Notifications management routes (protected)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Notifications.location); // "/app/notifications"
	 * router.push(Routes.Notifications.detail('404')); // "/app/notifications/404"
	 * ```
	 */
	public static Notifications = {
		name: 'Notifications',
		location: `${Routes.InternalAppRoute}/notifications`,
		/**
		 * Generates URL for notification detail page.
		 * @param id - Notification ID
		 * @returns Notification detail URL (e.g., "/app/notifications/404")
		 */
		detail: (id: string | number): string => `${Routes.InternalAppRoute}/notifications/${id}`,
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

	/**
	 * Contact form page (public)
	 * 
	 * @example
	 * ```typescript
	 * router.push(Routes.Contact.location); // "/contact"
	 * router.push(Routes.Contact.withProduct('123')); // "/contact?product=123"
	 * ```
	 */
	public static Contact = {
		name: 'Contact',
		location: '/contact',
		/**
		 * Generates URL for contact page with product reference.
		 * @param productId - Product ID to reference in contact form
		 * @returns Contact URL with product query parameter (e.g., "/contact?product=123")
		 */
		withProduct: (productId: string | number): string => 
			appendQueryParams('/contact', { product: productId }),
	}

	/** Shopping cart page (public) */
	public static Cart = {
		name: 'Cart',
		location: '/cart',
	}

	/**
	 * Generates a URL to open the login modal.
	 * 
	 * The login modal is opened by navigating to the home page with the `?login=true` query parameter.
	 * The Navbar component automatically detects this parameter and opens the login modal.
	 * 
	 * **Usage:**
	 * - Use this method instead of hardcoding `/?login=true` throughout the application
	 * - Provides a single source of truth for login modal navigation
	 * - Maintains consistency if the login modal mechanism changes
	 * - Works in both client and server components
	 * 
	 * @param redirectTo - Optional path to redirect to after successful login
	 * @returns URL string with login modal query parameter
	 * 
	 * @example
	 * ```typescript
	 * import { Routes } from '@_features/navigation';
	 * 
	 * // Basic usage - open login modal
	 * router.push(Routes.openLoginModal());
	 * // Result: "/?login=true"
	 * 
	 * // With redirect after login
	 * router.push(Routes.openLoginModal('/cart'));
	 * // Result: "/?login=true&redirectTo=/cart"
	 * 
	 * // In a Link component
	 * <Link href={Routes.openLoginModal()}>Sign In</Link>
	 * 
	 * // In server component
	 * return redirect(Routes.openLoginModal());
	 * ```
	 */
	public static openLoginModal(redirectTo?: string): string {
		const params = new URLSearchParams()
		params.set('login', 'true')
		if (redirectTo) {
			params.set('redirectTo', redirectTo)
		}
		return `${Routes.Home.location}?${params.toString()}`
	}
}

export default Routes


