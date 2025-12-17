/**
 * Main API Client Service
 * 
 * Centralized API client that provides type-safe methods for all backend endpoints.
 * Organized by domain (Accounts, Products, Orders, Quotes, etc.) for easy navigation.
 * All methods use HttpService underneath for consistent authentication and error handling.
 * 
 * **Architecture Pattern:**
 * - Domain-driven organization (Accounts, Store, Orders, Quotes, etc.)
 * - Generic return types for flexibility
 * - Consistent method naming (get, getAll, create, update, delete, search)
 * - Type-safe with TypeScript
 * - Automatic JWT token injection via HttpService
 * 
 * **Domains:**
 * - **Accounts**: User management, authentication, profile updates
 * - **Store.Products**: Product catalog, images, categories
 * - **Quotes**: Quote/RFQ management
 * - **Orders**: Order processing and management
 * - **Notifications**: User notifications
 * - **Providers**: Supplier/provider management
 * - **Customers**: Customer/company management
 * - **Finance**: Financial analytics and reports
 * - **Public**: Public-facing endpoints (no auth required)
 * 
 * @example
 * ```typescript
 * import { API } from '@_shared';
 * 
 * // Get all products
 * const response = await API.Store.Products.getAllProducts();
 * const products = response.data.payload;
 * 
 * // Search users with pagination
 * const users = await API.Accounts.search({
 *   page: 1,
 *   pageSize: 10,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * });
 * 
 * // Create a new quote
 * const newQuote = await API.Quotes.create(quoteData);
 * ```
 * 
 * @module api
 */

import type CustomerSummary from '@_classes/Base/CustomerSummary'
import type { AccountRole } from '@_classes/Enums'

/**
 * Role distribution statistics returned by RBAC dashboard API.
 */
export interface RoleDistribution {
	totalUsers: number
	customerCount: number
	salesRepCount: number
	salesManagerCount: number
	fulfillmentCoordinatorCount: number
	adminCount: number
}

/**
 * Request model for admin account creation.
 */
export interface AdminCreateAccountRequest {
	/** Email address (required, must be unique) */
	email: string
	/** Username (optional, defaults to email) */
	username?: string
	/** First name (optional) */
	firstName?: string
	/** Last name (optional) */
	lastName?: string
	/** Role level (numeric, defaults to Customer=0) */
	role: number
	/** Temporary password (optional, auto-generated if not provided) */
	temporaryPassword?: string
	/** Whether to send invitation email (default: true) */
	sendInvitationEmail: boolean
}

/**
 * Response model for admin account creation.
 */
export interface AdminCreateAccountResponse {
	/** The created account (password cleared) */
	account: User
	/** Temporary password (only if auto-generated) */
	temporaryPassword?: string
	/** Whether invitation email was sent */
	invitationEmailSent: boolean
}

import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type Company from '@_classes/Company'
import type ContactRequest from '@_classes/ContactRequest'
import type FinanceNumbers from '@_classes/FinanceNumbers'
import type FinanceSearchFilter from '@_classes/FinanceSearchFilter'
import type Order from '@_classes/Order'
import type { PagedData } from '@_classes/PagedData'
import type { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'
import type Quote from '@_classes/Quote'
import type { CreateQuoteRequest, CreateQuoteResponse } from './api.types'
import type { SubmitOrderRequest } from '@_classes/RequestClasses'
import type UploadedFile from '@_classes/UploadedFile'
import type User from '@_classes/User'

import { HttpService } from './httpService'

/**
 * Main API object with domain-organized endpoints.
 * Use AuthService for login/signup/logout operations.
 */
const API = {
	/**
	 * Account Management API
	 * Handles user accounts, profiles, passwords, and analytics.
	 * 
	 * For authentication operations (login/signup), use AuthService instead.
	 */
	Accounts: {
		/**
		 * Gets current user account or specific account by ID.
		 * @param id - User ID (omit for current user)
		 * @returns User data
		 * @example
		 * API.Accounts.get(); // Current user
		 * API.Accounts.get('123'); // User by ID
		 */
		get: async <_T>(id: string | null | undefined) => HttpService.get<User>(`/account${id ? '/' + id : ''}`),
		
		/**
		 * Updates user account information.
		 * Returns the updated user account for state synchronization.
		 * 
		 * **MAANG Best Practice**: Always returns the updated entity after mutations.
		 * 
		 * @param account - User object with updated data
		 * @returns Updated user account
		 */
		update: async (account: User) => HttpService.put<User>('/account', account),
		
		/**
		 * Changes password for current user.
		 * @param oldPassword - Current password
		 * @param newPassword - New password
		 */
		changePassword: async <T>(oldPassword: string, newPassword: string) =>
			HttpService.put<T>('/account/changepassword', { oldPassword, newPassword }),
		
		/**
		 * Changes password for specific user (admin only or self-service).
		 * @param userId - User ID
		 * @param oldPassword - Current password
		 * @param newPassword - New password
		 */
		changePasswordById: async <T>(userId: string, oldPassword: string, newPassword: string) =>
			HttpService.put<T>(`/account/changepasswordById`, { userId, oldPassword, newPassword }),
		
		/**
		 * Admin-only: Reset any user's password without requiring old password.
		 * @param userId - User ID to reset password for
		 * @param newPassword - New password to set
		 */
		adminResetPassword: async (userId: string, newPassword: string) =>
			HttpService.put<boolean>('/account/admin/reset-password', { userId: parseInt(userId, 10), newPassword }),
		
		/**
		 * Gets all sales representatives and sales managers (for quote assignment).
		 * 
		 * **DEPRECATED:** Use `search()` with Role filter instead for better scalability.
		 * This method is kept for backward compatibility but will be removed in future versions.
		 * 
		 * @deprecated Use `API.Accounts.search({ Filters: { Role: '100|200' } })` instead
		 * @see search - Centralized, scalable solution for all account filtering needs
		 */
		getSalesReps: async () => HttpService.get<User[]>('/account/sales-reps'),

		/**
		 * Gets accounts by role list (defaults to SalesRep + SalesManager).
		 * Uses backend AccountService.GetByRole for server-side filtering.
		 *
		 * @param roles - Array of AccountRole enum values or numeric role ids
		 */
		getByRole: async (roles?: Array<AccountRole | number>) => {
			const roleParam = roles?.length ? `?roles=${encodeURIComponent(roles.join('|'))}` : ''
			return HttpService.get<User[]>(`/account/by-role${roleParam}`)
		},
		
		/**
		 * Gets all user accounts (admin only).
		 * @returns Array of all users
		 */
		getAll: async () => HttpService.get<User[]>('/account/all'),
		
		/**
		 * Centralized account search with flexible filtering, pagination, and sorting.
		 * 
		 * **MAANG-Level Centralized Solution:**
		 * - Single endpoint for all account filtering needs
		 * - Server-side filtering for scalability (handles thousands of users efficiently)
		 * - Supports filtering by Role (single or array), Id (single or array), Email, Username, Name, CustomerId
		 * - Supports pagination for large result sets
		 * - Supports custom sorting
		 * - **Type-safe: Uses AccountRole enum values (no magic numbers)**
		 * 
		 * **Supported Filters (via GenericSearchFilter.filters dictionary):**
		 * - **Role**: Single role or pipe-separated roles using AccountRole enum values (type-safe)
		 *   - Type-safe: Use AccountRole enum values (e.g., `${AccountRole.SalesRep}|${AccountRole.SalesManager}`)
		 *   - Example: `{ filters: { Role: `${AccountRole.SalesRep}|${AccountRole.SalesManager}` } }` returns SalesRep OR SalesManager
		 *   - Validates enum values at runtime (invalid values are ignored)
		 *   - Supports all AccountRole values: Customer (0), SalesRep (100), SalesManager (200), FulfillmentCoordinator (300), Admin (9999999)
		 * - **Id**: Single ID or pipe-separated IDs (e.g., "1|2|3" for multiple users)
		 *   - Example: `{ filters: { Id: "1|2|3" } }` returns users with ID 1, 2, or 3
		 * - **Email**: Contains search (case-insensitive)
		 * - **Username**: Contains search (case-insensitive)
		 * - **Name.First**: Contains search on first name
		 * - **Name.Last**: Contains search on last name
		 * - **CustomerId**: Exact match for customer ID
		 * 
		 * **Pagination:**
		 * - Use `page` and `pageSize` in GenericSearchFilter
		 * - Default: Page 1, PageSize 10
		 * 
		 * **Sorting:**
		 * - Use `sortBy` (property name) and `sortOrder` ("asc" or "desc")
		 * - Default: Role (descending), then Name (ascending)
		 * 
		 * @param search - Search filter with filters, pagination, and sorting options
		 * @returns Paginated user results
		 * 
		 * @example
		 * ```typescript
		 * import { AccountRole } from '@_classes/Enums'
		 * 
		 * // Get all SalesReps and SalesManagers (for quote assignment)
		 * // MAANG-Level: Uses AccountRole enum values (type-safe, no magic numbers)
		 * const { data } = await API.Accounts.search({
		 *   filters: { 
		 *     Role: `${AccountRole.SalesRep}|${AccountRole.SalesManager}` 
		 *   },
		 *   sortBy: "Role",
		 *   sortOrder: "desc",
		 *   page: 1,
		 *   pageSize: 50
		 * });
		 * const salesReps = data.payload?.data ?? [];
		 * 
		 * // Get specific users by ID
		 * const { data } = await API.Accounts.search({
		 *   filters: { Id: "1|2|3" }
		 * });
		 * 
		 * // Search by email
		 * const { data } = await API.Accounts.search({
		 *   filters: { Email: "john" }
		 * });
		 * ```
		 */
		search: async (search: GenericSearchFilter) =>
			HttpService.post<PagedResult<User>>(`/account/search`, search),
		
		/**
		 * Gets dashboard analytics summary for current user.
		 * @returns Customer summary with orders, quotes, etc.
		 */
		getDashboardSummary: async () => HttpService.get<CustomerSummary>('/account/analytics'),
		
		/**
		 * Deletes a user account (admin only).
		 * @param id - User ID to delete
		 * @returns Success status
		 */
		delete: async (id: string) => HttpService.delete<boolean>(`/account/${id}`),
		
		/**
		 * Updates user role (admin only).
		 * @param id - User ID
		 * @param role - New role level (numeric)
		 * @returns Updated user account
		 */
		updateRole: async (id: string, role: number) => 
			HttpService.put<User>(`/account/${id}/role`, { role }),
		
		/**
		 * Gets role distribution statistics (admin only).
		 * Used by RBAC dashboard for role analytics.
		 * @returns Role distribution with counts per role
		 */
		getRoleStats: async () => 
			HttpService.get<RoleDistribution>('/account/role-stats'),
		
		/**
		 * Admin-only: Create a new user account with specified role.
		 * Bypasses normal registration flow. Used for staff account creation.
		 * 
		 * @param request - Account creation request
		 * @returns Created account with optional temp password
		 */
		adminCreate: async (request: AdminCreateAccountRequest) =>
			HttpService.post<AdminCreateAccountResponse>('/account/admin/create', request),

		// ========================================================================
		// PHASE 1: ACCOUNT STATUS MANAGEMENT (Admin Only)
		// Backend endpoints from server/Controllers/AccountController.cs
		// ========================================================================

		/**
		 * Admin-only: Suspend user account with reason (Phase 1).
		 * Suspended accounts cannot login until reactivated.
		 * 
		 * **Business Logic:**
		 * - Account status → Suspended
		 * - User cannot login until activated
		 * - Reason stored for audit
		 * - Triggers audit log entry
		 * 
		 * @param id - Account ID to suspend
		 * @param reason - Reason for suspension (max 500 chars)
		 * @returns Success boolean
		 * 
		 * @example
		 * ```typescript
		 * await API.Accounts.suspend('123', 'Policy violation: spam activity');
		 * ```
		 */
		suspend: async (id: string, reason: string) =>
			HttpService.put<boolean>(`/account/${id}/suspend`, { reason }),

		/**
		 * Admin-only: Activate suspended/locked account (Phase 1).
		 * Resets account to Active status.
		 * 
		 * **Business Logic:**
		 * - Account status → Active
		 * - Clears suspension reason
		 * - Clears lockout timestamp
		 * - Resets failed login attempts
		 * - Triggers audit log entry
		 * 
		 * @param id - Account ID to activate
		 * @returns Success boolean
		 * 
		 * @example
		 * ```typescript
		 * await API.Accounts.activate('123');
		 * ```
		 */
		activate: async (id: string) =>
			HttpService.put<boolean>(`/account/${id}/activate`, {}),

		/**
		 * Admin-only: Unlock locked account (Phase 1).
		 * Removes automatic lockout from failed login attempts.
		 * 
		 * **Business Logic:**
		 * - Account status → Active
		 * - Clears lockout timestamp
		 * - Resets failed login attempts to 0
		 * - Triggers audit log entry
		 * 
		 * @param id - Account ID to unlock
		 * @returns Success boolean
		 * 
		 * @example
		 * ```typescript
		 * await API.Accounts.unlock('123');
		 * ```
		 */
		unlock: async (id: string) =>
			HttpService.put<boolean>(`/account/${id}/unlock`, {}),

		/**
		 * Admin-only: Archive (soft delete) account (Phase 1).
		 * Archived accounts cannot login but data is preserved.
		 * 
		 * **Business Logic:**
		 * - Account status → Archived
		 * - Sets archivedAt timestamp
		 * - User cannot login
		 * - Data preserved for compliance
		 * - Can be restored later
		 * - Triggers audit log entry
		 * 
		 * @param id - Account ID to archive
		 * @returns Success boolean
		 * 
		 * @example
		 * ```typescript
		 * await API.Accounts.archive('123');
		 * ```
		 */
		archive: async (id: string) =>
			HttpService.put<boolean>(`/account/${id}/archive`, {}),

		/**
		 * Admin-only: Restore archived account (Phase 1).
		 * Returns archived account to Active status.
		 * 
		 * **Business Logic:**
		 * - Account status → Active
		 * - Clears archivedAt timestamp
		 * - User can login again
		 * - Triggers audit log entry
		 * 
		 * @param id - Account ID to restore
		 * @returns Success boolean
		 * 
		 * @example
		 * ```typescript
		 * await API.Accounts.restore('123');
		 * ```
		 */
		restore: async (id: string) =>
			HttpService.put<boolean>(`/account/${id}/restore`, {}),

		/**
		 * Admin-only: Force user to change password on next login (Phase 1).
		 * Sets forcePasswordChange flag and status.
		 * 
		 * **Business Logic:**
		 * - Sets forcePasswordChange flag
		 * - User can login but redirected to password change
		 * - Triggers audit log entry
		 * 
		 * @param id - Account ID to force password change
		 * @returns Success boolean
		 * 
		 * @example
		 * ```typescript
		 * await API.Accounts.forcePasswordChange('123');
		 * ```
		 */
		forcePasswordChange: async (id: string) =>
			HttpService.put<boolean>(`/account/${id}/force-password-change`, {}),
	},
	
	/**
	 * Store Management API
	 * Contains product catalog and inventory management.
	 */
	Store: {
		/**
		 * Product Management API
		 * CRUD operations for medical supply products.
		 */
		Products: {
			/**
			 * Gets all products (no pagination).
			 * Use search() for paginated results.
			 */
			getAllProducts: async () => HttpService.get<Product[]>('/products'),
			
			/**
			 * Gets paginated product list.
			 * @param pagedData - Pagination parameters
			 */
			getList: async (pagedData: PagedData) => HttpService.post<Product[]>('/products/paged', pagedData),
			
			/**
			 * Gets a single product by ID.
			 * @param productId - Product ID
			 */
			get: async (productId: string) => HttpService.get<Product>(`/products/${productId}`),
			
			/**
			 * Creates a new product with image upload.
			 * @param product - FormData containing product data and images
			 * @example
			 * const formData = new FormData();
			 * formData.append('name', 'Surgical Mask');
			 * formData.append('price', '9.99');
			 * formData.append('file', imageFile);
			 * await API.Store.Products.create(formData);
			 */
			create: async (product: FormData) =>
				HttpService.post<Product>(`/products`, product, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}),
			
			/**
			 * Updates an existing product.
			 * @param product - Product object with updated data
			 */
			update: async <T>(product: T) => HttpService.put<T>(`/products`, product),
			
			/**
			 * Deletes a product.
			 * @param productId - Product ID to delete
			 */
			delete: async <T>(productId: string) => HttpService.delete<T>(`/products/${productId}`),
			
			/**
			 * Gets latest products for home page display.
			 * @param quantity - Number of products to return (default: 6)
			 */
			getLatest: async (quantity: number = 6) =>
				HttpService.get<Product[]>(`/products/latest?quantity=${quantity}`),
			
			/**
			 * Gets a product image by ID and filename.
			 * @param id - Product ID
			 * @param name - Image filename
			 */
			image: async (id: string, name: string) =>
				HttpService.get(`/products/image?productId=${id}&image=${name}`),
			
			/**
			 * Uploads additional images to an existing product.
			 * @param productId - Product ID
			 * @param formData - FormData containing image files
			 */
			uploadImage: async (productId: string, formData: FormData) =>
				HttpService.post<UploadedFile[]>(`/products/${productId}/images`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}),
			
			/**
			 * Deletes a product image.
			 * @param id - Product ID
			 * @param name - Image filename to delete
			 */
			deleteImage: async (id: string, name: string) =>
				HttpService.delete<boolean>(`/products/${id}/image/${name}`),
			
			/**
			 * Gets all images for a product.
			 * @param id - Product ID
			 */
			images: async (id: string) => HttpService.get<File[]>(`/products/images?productId=${id}`),
			
			/**
			 * Searches products with pagination and filtering (admin).
			 * @param search - Search filter with page, pageSize, filters, etc.
			 */
			search: async (search: GenericSearchFilter) =>
				HttpService.post<PagedResult<Product>>(`/Products/search`, search),
			
			/**
			 * Searches products with pagination and filtering (public).
			 * No authentication required.
			 * 
			 * **Use this in Client Components** - supports dynamic filtering/pagination.
			 * For Server Components with caching, use `searchPublicCacheable` instead.
			 * 
			 * @param search - Search filter
			 */
			searchPublic: async (search: GenericSearchFilter) =>
				HttpService.post<PagedResult<Product>>(`/Products/search/public`, search),
			
			/**
			 * Searches products with pagination and filtering (public).
			 * NO AUTHENTICATION - Does not access cookies().
			 * 
			 * **SERVER COMPONENTS ONLY - Use with "use cache" for maximum performance.**
			 * For Client Components, use `searchPublic` instead.
			 * 
			 * @param search - Search filter
			 * @returns Paginated product results
			 * 
			 * @example
			 * ```typescript
			 * async function getCachedProducts(filter: GenericSearchFilter) {
			 *   'use cache'
			 *   cacheTag('products')
			 *   cacheLife('minutes')
			 *   return API.Store.Products.searchPublicCacheable(filter)
			 * }
			 * ```
			 */
			searchPublicCacheable: async (search: GenericSearchFilter) =>
				HttpService.postPublic<PagedResult<Product>>(`/Products/search/public`, search),
			
			/**
			 * Gets all product categories.
			 * 
			 * **Use this in Client Components** - supports dynamic behavior.
			 * For Server Components with caching, use `getCategoriesCacheable` instead.
			 * 
			 * @returns Array of product categories
			 */
			getAllCategories: async () => HttpService.get<ProductsCategory[]>('/Products/categories/clean'),
			
			/**
			 * Gets all product categories (public).
			 * NO AUTHENTICATION - Does not access cookies().
			 * 
			 * **SERVER COMPONENTS ONLY - Use with "use cache" for maximum performance.**
			 * For Client Components, use `getAllCategories` instead.
			 * 
			 * @returns Array of product categories
			 * 
			 * @example
			 * ```typescript
			 * async function getCachedCategories() {
			 *   'use cache'
			 *   cacheTag('categories')
			 *   cacheLife('hours')
			 *   return API.Store.Products.getCategoriesCacheable()
			 * }
			 * ```
			 */
			getCategoriesCacheable: async () => 
				HttpService.getPublic<ProductsCategory[]>('/Products/categories/clean'),
			
			/**
			 * Gets a single product by ID (public).
			 * NO AUTHENTICATION - Does not access cookies().
			 * 
			 * **USE THIS WITH "use cache" for maximum performance.**
			 * 
			 * @param productId - Product ID
			 * @returns Product details
			 * 
			 * @example
			 * ```typescript
			 * async function getCachedProduct(id: string) {
			 *   'use cache'
			 *   cacheTag(`product-${id}`, 'products')
			 *   cacheLife('hours')
			 *   return API.Store.Products.getPublicCacheable(id)
			 * }
			 * ```
			 */
			getPublicCacheable: async (productId: string) => 
				HttpService.getPublic<Product>(`/products/${productId}`),
		},
	},
	
	/**
	 * Quote Management API
	 * Handles quote requests (RFQs) from customers.
	 */
	Quotes: {
		/**
		 * Gets a single quote by ID.
		 * @param id - Quote ID
		 */
		get: async <T>(id: string) => {
			return HttpService.get<T>(`/quotes/${id}`)
		},
		
		/**
		 * Gets all quotes.
		 */
		getAll: async <T>() => {
			return HttpService.get<T>('/quotes')
		},
		
		/**
		 * Gets latest quotes for dashboard display.
		 * @param quantity - Number of quotes to return (default: 6)
		 */
		getLatest: async (quantity: number = 6) => {
			return HttpService.get<Quote[]>(`/quotes/latest?quantity=${quantity}`)
		},
		
		/**
		 * Searches quotes with pagination and filtering.
		 * @param search - Search filter
		 */
		search: async (search: GenericSearchFilter) => {
			return HttpService.post<PagedResult<Quote>>('/quotes/search', search)
		},
		
		/**
		 * Creates a new quote request.
		 * @param quote - Quote data
		 */
		create: async <T>(quote: T) => HttpService.post<T>('/quotes', quote),
		
		/**
		 * Updates an existing quote.
		 * @param quote - Quote with updated data
		 */
		update: async <T>(quote: T) => HttpService.put<T>('/quotes', quote),
		
		/**
		 * Permanently deletes a quote and its cart products.
		 * Consider using archive() for soft delete instead.
		 * @param quoteId - Quote ID to delete
		 */
		delete: async <T>(quoteId: string) => HttpService.delete<T>(`/quotes/${quoteId}`),

		/**
		 * Soft deletes (archives) a quote.
		 * Preferred over hard delete for data integrity and audit trails.
		 * @param quoteId - Quote ID to archive
		 */
		archive: async (quoteId: string) => HttpService.post<boolean>(`/quotes/${quoteId}/archive`, null),
	},
	
	/**
	 * Order Management API
	 * Handles order processing, approval, and fulfillment.
	 */
	Orders: {
		/**
		 * Gets a single order by ID or current user's orders.
		 * @param orderId - Order ID (omit for current user's orders)
		 */
		get: async <Order>(orderId?: number | null) => {
			return HttpService.get<Order>(`/orders${orderId ? `/${orderId}` : ''}`)
		},
		
		/**
		 * Gets all orders for a specific customer.
		 * @param customerId - Customer ID
		 */
		getFromCustomer: async (customerId: number) => {
			return HttpService.get<Order[]>(`/orders/fromcustomer/${customerId}`)
		},
		
		/**
		 * Searches orders with pagination and filtering.
		 * @param search - Search filter
		 */
		search: async (search: GenericSearchFilter) => {
			return HttpService.post<PagedResult<Order>>('/orders/search', search)
		},
		
		/**
		 * Creates a new order.
		 * @param quote - Order data
		 */
		create: async <Order>(quote: Order) => HttpService.post<Order>('/orders', quote),
		
		/**
		 * Creates an order from an existing quote.
		 * @param quoteId - Quote ID to convert to order
		 */
		createFromQuote: async <Order>(quoteId: string) =>
			HttpService.post<Order>(`/orders/fromquote/${quoteId}`, null),
		
		/**
		 * Updates an existing order.
		 * @param quote - Order with updated data
		 */
		update: async <Order>(quote: Order) => HttpService.put<Order>('/orders', quote),
		
		/**
		 * Deletes an order.
		 * @param quoteId - Order ID to delete
		 */
		delete: async <Boolean>(quoteId: number) => HttpService.delete<Boolean>(`/orders/${quoteId}`),
		
		/**
		 * Submits a quote to customer.
		 * @param req - Submit request data
		 */
		submitQuote: async <Boolean>(req: SubmitOrderRequest) =>
			HttpService.post<Boolean>(`/orders/submit/quote`, req),
		
		/**
		 * Submits an invoice to customer.
		 * @param req - Submit request data
		 */
		submitInvoice: async <Boolean>(req: SubmitOrderRequest) =>
			HttpService.post<Boolean>(`/orders/submit/invoice`, req),
		
		/**
		 * Approves an order (moves to processing).
		 * @param orderId - Order ID to approve
		 */
		approveOrder: async (orderId: string) => HttpService.post<boolean>(`/orders/approve/${orderId}`, null),
		
		/**
		 * Removes a product from an order.
		 * @param orderId - Order ID
		 * @param productId - Product ID to remove
		 */
		deleteProduct: async (orderId: string, productId: number) =>
			HttpService.delete<boolean>(`/orders/${orderId}/product/${productId}`),
	},
	
	/**
	 * Notification Management API
	 * User notifications and alerts.
	 */
	Notifications: {
		/**
		 * Gets notifications (all or by ID).
		 * @param id - Notification ID (omit for all notifications)
		 */
		get: async <T>(id: string) => {
			if (id !== null) {
				return HttpService.get<T>(`/notifications/${id}`)
			} else {
				return HttpService.get<T>('/notifications')
			}
		},
		
		/**
		 * Creates a new notification.
		 * @param quote - Notification data
		 */
		create: async <T>(quote: T) => HttpService.post<T>('/notifications', quote),
		
		/**
		 * Updates a notification.
		 * @param quote - Notification with updated data
		 */
		update: async <T>(quote: T) => HttpService.put<T>('/notifications', quote),
		
		/**
		 * Deletes a notification.
		 * @param quoteId - Notification ID to delete
		 */
		delete: async <T>(quoteId: string) => HttpService.delete<T>(`/notifications/${quoteId}`),
	},
	
	/**
	 * Provider/Supplier Management API
	 * Manages medical supply providers and suppliers.
	 * 
	 * **Business Flow:**
	 * - Providers are medical supply vendors (dropshipping model)
	 * - Sales reps contact providers to get pricing for quotes
	 * - Providers fulfill orders directly to customers
	 * - Admin-only access for all operations
	 */
	Providers: {
		/**
		 * Gets a single provider by ID.
		 * @param id - Provider ID
		 */
		get: async <Provider>(id: number) => HttpService.get<Provider>(`/provider/${id}`),
		
		/**
		 * Gets all providers.
		 */
		getAll: async <Provider>() => HttpService.get<Provider[]>('/providers'),
		
		/**
		 * Gets only active (non-archived) providers.
		 * Used for dropdowns and provider selection.
		 */
		getActive: async <Provider>() => HttpService.get<Provider[]>('/providers/active'),
		
		/**
		 * Gets aggregate provider statistics for dashboard.
		 * Returns counts: total, active, suspended, archived, new this month, etc.
		 * 
		 * STATUS WORKFLOW: Active -> Suspended -> Archived
		 */
		getAggregateStats: async () => HttpService.get<{
			totalProviders: number
			activeProviders: number
			suspendedProviders: number
			archivedProviders: number
			newThisMonth: number
			withProducts: number
			withoutProducts: number
		}>('/providers/stats'),
		
		/**
		 * Creates a new provider.
		 * @param provider - Provider data
		 */
		create: async <Provider>(provider: Provider) => HttpService.post<Provider>('/provider', provider),
		
		/**
		 * Updates an existing provider.
		 * @param provider - Provider with updated data
		 */
		update: async <Provider>(provider: Provider) => HttpService.put<Provider>('/provider', provider),
		
		/**
		 * Archives a provider (final status in workflow).
		 * STATUS WORKFLOW: Active -> Suspended -> Archived
		 * @param providerId - Provider ID to archive
		 */
		archive: async (providerId: number) => HttpService.put<boolean>(`/provider/${providerId}/archive`, {}),
		
		/**
		 * Suspends a provider (temporary hold).
		 * STATUS WORKFLOW: Active -> Suspended -> Archived
		 * @param providerId - Provider ID to suspend
		 * @param reason - Reason for suspension
		 */
		suspend: async (providerId: number, reason: string) => 
			HttpService.put<boolean>(`/provider/${providerId}/suspend`, { reason }),
		
		/**
		 * Activates a provider (restores from any status).
		 * @param providerId - Provider ID to activate
		 */
		activate: async (providerId: number) => HttpService.put<boolean>(`/provider/${providerId}/activate`, {}),
		
		/**
		 * Restores an archived provider (alias for activate).
		 * Maintained for backward compatibility.
		 * @param providerId - Provider ID to restore
		 */
		restore: async (providerId: number) => HttpService.put<boolean>(`/provider/${providerId}/restore`, {}),
		
		/**
		 * Deletes a provider (hard delete).
		 * Use archive for soft delete instead.
		 * @param providerId - Provider ID to delete
		 */
		delete: async (providerId: number) => HttpService.delete<boolean>(`/provider/${providerId}`),
	},
	
	/**
	 * Public API Endpoints
	 * No authentication required. Used for public-facing forms.
	 */
	Public: {
		/**
		 * Submits a quote request from public website.
		 * Uses CreateQuoteRequest DTO for clean API contract.
		 * Backend has [AllowAnonymous] on the create endpoint.
		 * 
		 * @param request - Quote request DTO (not the Quote entity)
		 * @returns CreateQuoteResponse with quote ID and reference number
		 */
		sendQuote: async (request: CreateQuoteRequest) => 
			HttpService.post<CreateQuoteResponse>('/quotes', request),
		
		/**
		 * Submits a contact form request from public website.
		 * @param contactRequest - Contact form data
		 */
		sendContactRequest: async (contactRequest: ContactRequest) =>
			HttpService.post<any>('/contact', contactRequest),
	},
	
	/**
	 * Customer/Company Management API
	 * Manages B2B customer organizations and their relationships.
	 * 
	 * **Business Flow:**
	 * - Customers are the core B2B entities (hospitals, clinics, etc.)
	 * - Each customer should have a primarySalesRepId for relationship continuity
	 * - TypeOfBusiness enables segmentation and compliance tracking
	 * - Status controls ordering capabilities
	 */
	Customers: {
		/**
		 * Gets a single customer by ID.
		 * @param id - Customer ID
		 */
		get: async <Customer>(id: number) => HttpService.get<Customer>(`/customer/${id}`),
		
		/**
		 * Gets all customers.
		 * For SalesReps: Returns only assigned customers (backend filters).
		 * For Admin/SalesManager: Returns all customers.
		 */
		getAll: async <Customer>() => HttpService.get<Customer[]>('/customers'),
		
		/**
		 * Creates a new customer.
		 * Requires: SalesRep or higher role.
		 * Auto-assigns creating SalesRep as primary rep if not specified.
		 * @param customer - Customer data
		 */
		create: async <Customer>(customer: Customer) => HttpService.post<Customer>('/customer', customer),
		
		/**
		 * Updates an existing customer.
		 * Requires: SalesRep or higher with access to the customer.
		 * Only Admin/SalesManager can change primary sales rep.
		 * @param customer - Customer with updated data
		 */
		update: async <Customer>(customer: Customer) => HttpService.put<Customer>('/customer', customer),
		
		/**
		 * Deletes a customer (Admin only).
		 * Fails if customer has orders, quotes, or linked accounts.
		 * Consider using archive() for soft delete.
		 * @param customerId - Customer ID to delete
		 */
		delete: async (customerId: number) => HttpService.delete<boolean>(`/customer/${customerId}`),
		
		/**
		 * Searches customers with pagination and filtering.
		 * 
		 * Supported filters:
		 * - searchTerm: Text search across name, email, phone
		 * - typeOfBusiness: Business type (enum value)
		 * - status: Customer status (enum value)
		 * - primarySalesRepId: Filter by assigned sales rep
		 * - showArchived: Include archived customers
		 * 
		 * Access Control:
		 * - Admin/SalesManager: Can search all customers
		 * - SalesRep: Auto-filters to assigned customers only
		 * 
		 * @param search - Search filter with pagination
		 */
		search: async (search: GenericSearchFilter) =>
			HttpService.post<PagedResult<Company>>(`/customers/search`, search),
		
		/**
		 * Gets customer statistics (order count, revenue, etc.).
		 * @param customerId - Customer ID
		 */
		getStats: async (customerId: number) => 
			HttpService.get<{
				customerId: number
				totalOrders: number
				totalQuotes: number
				totalAccounts: number
				totalRevenue: number
				lastOrderDate: string | null
				createdAt: string
			}>(`/customer/${customerId}/stats`),
		
		/**
		 * Gets aggregate statistics for customer dashboard.
		 * Returns counts by status and assignment metrics.
		 * 
		 * For SalesReps: Counts only assigned customers.
		 * For Admin/SalesManager: Counts all customers.
		 */
		getAggregateStats: async () => 
			HttpService.get<{
				totalCustomers: number
				activeCustomers: number
				pendingVerification: number
				suspendedCustomers: number
				inactiveCustomers: number
				churnedCustomers: number
				assignedToSalesRep: number
				unassigned: number
				byBusinessType: Record<string, number>
			}>('/customers/stats/aggregate'),
		
		/**
		 * Assigns a primary sales rep to a customer.
		 * Requires: SalesManager or higher.
		 * @param customerId - Customer ID
		 * @param salesRepId - Sales rep account ID
		 */
		assignSalesRep: async (customerId: number, salesRepId: number) =>
			HttpService.put<Company>(`/customer/${customerId}/assign-sales-rep`, { salesRepId }),
	},
	
	/**
	 * Finance and Analytics API
	 * Financial reports, analytics, and data exports.
	 */
	Finance: {
		/**
		 * Gets current finance analytics numbers.
		 * @returns Financial summary data
		 */
		getFinanceNumbers: async () => HttpService.get<FinanceNumbers>('/finance/analytics'),
		
		/**
		 * Searches finance numbers with date range filtering.
		 * @param search - Finance search filter with date range
		 */
		searchFinnanceNumbers: async (search: FinanceSearchFilter) =>
			HttpService.post<FinanceNumbers>('/finance/analytics/search', search),
		
		/**
		 * Downloads finance data as Excel/CSV file.
		 * @param search - Finance search filter for export
		 * @returns Blob for file download
		 * @example
		 * const response = await API.Finance.downloadFinanceNumbers(filter);
		 * const url = window.URL.createObjectURL(response.data);
		 * const link = document.createElement('a');
		 * link.href = url;
		 * link.download = 'finance-report.xlsx';
		 * link.click();
		 */
		downloadFinanceNumbers: async (search: FinanceSearchFilter) =>
			HttpService.download<Blob>('/finance/orders/download', search, { responseType: 'blob' }),
	},
	
	/**
	 * RBAC Management API
	 * Role-Based Access Control management endpoints.
	 * All operations require Admin role.
	 */
	RBAC: {
		/**
		 * Roles Management
		 */
		Roles: {
			/**
			 * Gets all roles.
			 */
			getAll: async () => HttpService.get<Role[]>('/rbac/roles'),
			
			/**
			 * Gets a single role by ID.
			 */
			get: async (id: number) => HttpService.get<Role>(`/rbac/roles/${id}`),
			
			/**
			 * Creates a new role.
			 */
			create: async (role: CreateRoleRequest) => HttpService.post<Role>('/rbac/roles', role),
			
			/**
			 * Updates an existing role.
			 */
			update: async (id: number, role: UpdateRoleRequest) => HttpService.put<Role>(`/rbac/roles/${id}`, role),
			
			/**
			 * Deletes a role.
			 */
			delete: async (id: number) => HttpService.delete<boolean>(`/rbac/roles/${id}`),
			
			/**
			 * Gets all permissions assigned to a role.
			 */
			getPermissions: async (roleId: number) => HttpService.get<Permission[]>(`/rbac/roles/${roleId}/permissions`),
			
			/**
			 * Assigns a permission to a role.
			 */
			assignPermission: async (roleId: number, permissionId: number) =>
				HttpService.post<boolean>(`/rbac/roles/${roleId}/permissions/${permissionId}`, null),
			
			/**
			 * Removes a permission from a role.
			 */
			removePermission: async (roleId: number, permissionId: number) =>
				HttpService.delete<boolean>(`/rbac/roles/${roleId}/permissions/${permissionId}`),
			
			/**
			 * Bulk assigns multiple permissions to a role (replaces existing).
			 */
			bulkAssignPermissions: async (roleId: number, permissionIds: number[]) =>
				HttpService.put<boolean>(`/rbac/roles/${roleId}/permissions`, { permissionIds }),
		},
		
		/**
		 * Permissions Management
		 */
		Permissions: {
			/**
			 * Gets all permissions.
			 */
			getAll: async () => HttpService.get<Permission[]>('/rbac/permissions'),
			
			/**
			 * Gets a single permission by ID.
			 */
			get: async (id: number) => HttpService.get<Permission>(`/rbac/permissions/${id}`),
			
			/**
			 * Creates a new permission.
			 */
			create: async (permission: CreatePermissionRequest) =>
				HttpService.post<Permission>('/rbac/permissions', permission),
			
			/**
			 * Updates an existing permission.
			 */
			update: async (id: number, permission: UpdatePermissionRequest) =>
				HttpService.put<Permission>(`/rbac/permissions/${id}`, permission),
			
			/**
			 * Deletes a permission.
			 */
			delete: async (id: number) => HttpService.delete<boolean>(`/rbac/permissions/${id}`),
		},
	},
}

export default API

// =========================================================================
// RBAC Type Definitions
// =========================================================================

export interface Role {
	id: number
	name: string
	displayName: string
	level: number
	description?: string
	isSystemRole: boolean
	createdAt: string
	updatedAt: string
	rolePermissions?: RolePermission[]
}

export interface Permission {
	id: number
	resource: string
	action: string
	context?: string
	description?: string
	permissionString?: string
	rolePermissions?: RolePermission[]
}

export interface RolePermission {
	roleId: number
	permissionId: number
	role?: Role
	permission?: Permission
}

export interface CreateRoleRequest {
	name: string
	displayName: string
	level: number
	description?: string
	isSystemRole?: boolean
}

export interface UpdateRoleRequest {
	name: string
	displayName: string
	level: number
	description?: string
	isSystemRole?: boolean
}

export interface CreatePermissionRequest {
	resource: string
	action: string
	context?: string
	description?: string
}

export interface UpdatePermissionRequest {
	resource: string
	action: string
	context?: string
	description?: string
}

