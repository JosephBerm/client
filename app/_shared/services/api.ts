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
import type { DashboardStats, DashboardTask, RecentItem } from '@_types/dashboard.types'
import type { 
	AnalyticsSummary, 
	SalesRepPerformance as SalesRepPerformanceType,
	RevenueData as RevenueDataType 
} from '@_types/analytics.types'
import type {
	RBACOverview,
	PermissionMatrixEntry,
	PermissionAuditEntryDto,
	BulkRoleUpdateRequest,
	BulkRoleUpdateResult,
	UserWithRole,
	AuditLogFilters,
	UsersWithRolesFilters,
} from '@_types/rbac-management'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

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
import type { QuotePricingSummary } from '@_core/validation/validation-schemas'
import type { SubmitOrderRequest } from '@_classes/RequestClasses'
import type UploadedFile from '@_classes/UploadedFile'
import type User from '@_classes/User'

import { HttpService } from './httpService'
import type { AxiosResponse, ApiResponse } from './httpService'

/**
 * Request DTO for changing account status (unified endpoint).
 * Matches backend ChangeAccountStatusRequest DTO.
 */
export interface ChangeAccountStatusRequest {
	/** Target account status (AccountStatus enum value) */
	status: number
	/** Optional reason (required for Suspended status, max 500 chars) */
	reason?: string
}

/**
 * Response DTO for account status changes.
 * Includes old/new status and audit information.
 * Matches backend StatusChangeResult DTO.
 */
export interface StatusChangeResult {
	/** Whether the status change was successful */
	success: boolean
	/** Previous account status (AccountStatus enum value) */
	oldStatus: number
	/** New account status (AccountStatus enum value) */
	newStatus: number
	/** Error message if status change failed */
	errorMessage?: string
	/** Timestamp when status was changed (ISO string) */
	changedAt: string
}

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
		 * Rich search for accounts with advanced filtering, sorting, and facets.
		 * Used by RichDataGrid for MAANG-level data grid functionality.
		 * 
		 * @param filter - RichSearchFilter with pagination, sorting, column filters, and global search
		 * @returns RichPagedResult with data, facets, and metadata
		 */
		richSearch: async (filter: RichSearchFilter) =>
			HttpService.post<RichPagedResult<User>>(`/account/search/rich`, filter),
		
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
		// UNIFIED ACCOUNT STATUS MANAGEMENT (Unified DTO Pattern)
		// ========================================================================

		/**
		 * Admin-only: Change account status (unified endpoint).
		 * Consolidates all status change operations into a single method.
		 * 
		 * **Status Options:**
		 * - `AccountStatus.Active` - Activates account (routes to activate/unlock/restore based on current status)
		 * - `AccountStatus.Suspended` - Suspends account (reason required)
		 * - `AccountStatus.Archived` - Archives account (soft delete)
		 * - `AccountStatus.ForcePasswordChange` - Forces password change on next login
		 * 
		 * **Invalid Statuses:**
		 * - `AccountStatus.Locked` - Cannot be set manually (auto-only after 5 failed logins)
		 * - `AccountStatus.PendingVerification` - Set during registration only
		 * 
		 * **Business Logic:**
		 * - Admin-only operation
		 * - Cannot suspend/archive own account
		 * - Reason required for Suspended status
		 * - Returns StatusChangeResult with old/new status and audit info
		 * 
		 * @param id - Account ID to change status for
		 * @param status - Target account status (AccountStatus enum value)
		 * @param reason - Optional reason (required for Suspended status, max 500 chars)
		 * @returns Status change result with old/new status and success indicator
		 * 
		 * @example
		 * ```typescript
		 * import { AccountStatus } from '@_classes/Enums';
		 * 
		 * // Suspend account with reason
		 * await API.Accounts.changeStatus('123', AccountStatus.Suspended, 'Policy violation');
		 * 
		 * // Activate account (auto-routes to activate/unlock/restore)
		 * await API.Accounts.changeStatus('123', AccountStatus.Active);
		 * 
		 * // Archive account
		 * await API.Accounts.changeStatus('123', AccountStatus.Archived);
		 * 
		 * // Force password change
		 * await API.Accounts.changeStatus('123', AccountStatus.ForcePasswordChange);
		 * ```
		 */
		changeStatus: async (
			id: string,
			status: number,
			reason?: string
		) => {
			const request: ChangeAccountStatusRequest = {
				status,
				...(reason && { reason }), // Only include reason if provided
			}
			return HttpService.put<StatusChangeResult>(`/account/${id}/status`, request)
		},
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
			 * Deletes a product (hard delete).
			 * Use archive() for soft delete instead.
			 * @param productId - Product ID to delete
			 */
			delete: async <T>(productId: string) => HttpService.delete<T>(`/products/${productId}`),
			
			/**
			 * Archives a product (soft delete).
			 * Product is hidden from public store but can be restored.
			 * Preferred over hard delete for data integrity.
			 * @param productId - Product ID to archive
			 * @returns Success status
			 * 
			 * @see prd_products.md - US-PRD-005
			 */
			archive: async (productId: string) => 
				HttpService.post<boolean>(`/products/${productId}/archive`, null),
			
			/**
			 * Restores an archived product.
			 * Product becomes visible in public store again.
			 * @param productId - Product ID to restore
			 * @returns Success status
			 * 
			 * @see prd_products.md - US-PRD-005
			 */
			restore: async (productId: string) => 
				HttpService.put<boolean>(`/products/${productId}/restore`, {}),
			
			/**
			 * Gets product statistics for admin dashboard.
			 * Returns counts for total, active, archived, low stock, etc.
			 * @returns Product statistics
			 * 
			 * @example
			 * ```typescript
			 * const { data } = await API.Store.Products.getStats()
			 * console.log(data.payload?.totalProducts)
			 * ```
			 */
			getStats: async () => HttpService.get<{
				totalProducts: number
				activeProducts: number
				archivedProducts: number
				lowStockProducts: number
				outOfStockProducts: number
				totalInventoryValue: number
				categoryCount: number
			}>('/products/stats'),
			
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
			 * Rich search for products with advanced filtering, sorting, and facets.
			 * Used by RichDataGrid for MAANG-level data grid functionality.
			 * 
			 * @param filter - RichSearchFilter with pagination, sorting, column filters, and global search
			 * @returns RichPagedResult with data, facets, and metadata
			 * 
			 * @example
			 * ```typescript
			 * const { data } = await API.Store.Products.richSearch({
			 *   page: 1,
			 *   pageSize: 20,
			 *   sortDescriptors: [{ columnId: 'name', direction: 'Asc' }],
			 *   columnFilters: [{ columnId: 'price', filterType: 'Number', operator: 'Gt', value: 10 }],
			 *   globalSearchTerm: 'surgical',
			 * });
			 * ```
			 */
			richSearch: async (filter: RichSearchFilter) =>
				HttpService.post<RichPagedResult<Product>>(`/Products/search/rich`, filter),
			
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
		 * Rich search for quotes with advanced filtering, sorting, and facets.
		 * Used by RichDataGrid for MAANG-level data grid functionality.
		 * 
		 * @param filter - RichSearchFilter with pagination, sorting, column filters, and global search
		 * @returns RichPagedResult with data, facets, and metadata
		 */
		richSearch: async (filter: RichSearchFilter) => {
			return HttpService.post<RichPagedResult<Quote>>('/quotes/search/rich', filter)
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

		// =========================================================================
		// PRICING METHODS - Quote Pricing Workflow
		// @see prd_quotes_pricing.md
		// =========================================================================

		/**
		 * Updates pricing for a single product in a quote.
		 * Sets vendor cost and/or customer price.
		 * 
		 * **Authorization:**
		 * - SalesRep: Can only update pricing for assigned quotes
		 * - SalesManager+: Can update pricing for any quote
		 * - Customer: CANNOT update pricing
		 * 
		 * **Business Rules:**
		 * - customerPrice must be >= vendorCost (when both set)
		 * - Can only update pricing on quotes with status 'Read'
		 * 
		 * @param quoteId - Quote ID
		 * @param productId - CartProduct ID
		 * @param vendorCost - Vendor cost (nullable)
		 * @param customerPrice - Customer price (nullable)
		 * @returns Updated quote
		 * 
		 * @see prd_quotes_pricing.md - US-QP-001, US-QP-002
		 */
		updateProductPricing: async (
			quoteId: string,
			productId: string,
			vendorCost: number | null,
			customerPrice: number | null
		) => HttpService.put<Quote>(`/quotes/${quoteId}/pricing`, {
			productId,
			vendorCost,
			customerPrice,
		}),

		/**
		 * Gets pricing summary for a quote.
		 * Contains totals, margins, and can-send status.
		 * 
		 * **Authorization:**
		 * - SalesRep: Can only view pricing for assigned quotes
		 * - SalesManager+: Can view pricing for any quote
		 * - Customer: CANNOT view pricing summary (contains margin data)
		 * 
		 * @param quoteId - Quote ID
		 * @returns Pricing summary with totals and can-send status
		 * 
		 * @see prd_quotes_pricing.md - US-QP-003
		 */
		getPricingSummary: async (quoteId: string) =>
			HttpService.get<QuotePricingSummary>(`/quotes/${quoteId}/pricing/summary`),
	},
	
	/**
	 * Order Management API
	 * Handles order processing, approval, fulfillment, and full order lifecycle.
	 * 
	 * @see prd_orders.md - Order Management PRD
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
		 * Rich search for orders with advanced filtering, sorting, and facets.
		 * Used by RichDataGrid for MAANG-level data grid functionality.
		 * 
		 * @param filter - RichSearchFilter with pagination, sorting, column filters, and global search
		 * @returns RichPagedResult with data, facets, and metadata
		 */
		richSearch: async (filter: RichSearchFilter) => {
			return HttpService.post<RichPagedResult<Order>>('/orders/search/rich', filter)
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

		// =========================================================================
		// ORDER WORKFLOW METHODS
		// @see prd_orders.md
		// =========================================================================

		/**
		 * Confirms payment for an order (Placed → Paid).
		 * 
		 * **Authorization:**
		 * - SalesRep: Can confirm for assigned orders only
		 * - SalesManager+: Can confirm for any order
		 * 
		 * @param orderId - Order ID
		 * @param paymentReference - Optional payment reference (check #, transaction ID)
		 * @param notes - Optional internal notes
		 * 
		 * @see prd_orders.md - US-ORD-003
		 */
		confirmPayment: async (orderId: number, paymentReference?: string, notes?: string) =>
			HttpService.post<Order>(`/orders/${orderId}/confirm-payment`, {
				paymentReference,
				notes,
			}),

		/**
		 * Updates order status.
		 * Used by fulfillment to progress orders through workflow.
		 * 
		 * **Valid transitions:**
		 * - Paid → Processing
		 * - Processing → Shipped (requires trackingNumber)
		 * - Shipped → Delivered
		 * - Any → Cancelled (requires cancellationReason)
		 * 
		 * **Authorization:**
		 * - FulfillmentCoordinator+: Processing, Shipped, Delivered
		 * - SalesManager+: Cancelled
		 * 
		 * @param orderId - Order ID
		 * @param newStatus - Target status
		 * @param trackingNumber - Required for Shipped status
		 * @param carrier - Optional carrier name
		 * @param cancellationReason - Required for Cancelled status
		 * @param internalNotes - Optional notes
		 * 
		 * @see prd_orders.md - US-ORD-004, US-ORD-005
		 */
		updateStatus: async (
			orderId: number,
			newStatus: number,
			trackingNumber?: string,
			carrier?: string,
			cancellationReason?: string,
			internalNotes?: string
		) =>
			HttpService.post<Order>(`/orders/${orderId}/status`, {
				newStatus,
				trackingNumber,
				carrier,
				cancellationReason,
				internalNotes,
			}),

		/**
		 * Adds tracking number to a specific order item.
		 * Allows tracking different products from different vendors.
		 * 
		 * **Authorization:**
		 * - FulfillmentCoordinator+
		 * 
		 * @param orderId - Order ID
		 * @param orderItemId - Order item ID
		 * @param trackingNumber - Tracking number
		 * @param carrier - Optional carrier name
		 * 
		 * @see prd_orders.md - US-ORD-004
		 */
		addTracking: async (orderId: number, orderItemId: number, trackingNumber: string, carrier?: string) =>
			HttpService.post<Order>(`/orders/${orderId}/tracking`, {
				orderItemId,
				trackingNumber,
				carrier,
			}),

		/**
		 * Requests order cancellation (customer-facing).
		 * Creates a support request for sales manager review.
		 * 
		 * **Authorization:**
		 * - Customer: Own orders with status Placed or Paid only
		 * 
		 * @param orderId - Order ID
		 * @param reason - Cancellation reason
		 * 
		 * @see prd_orders.md - US-ORD-006
		 */
		requestCancellation: async (orderId: number, reason: string) =>
			HttpService.post<boolean>(`/orders/${orderId}/request-cancellation`, {
				reason,
			}),

		/**
		 * Gets order summary statistics for dashboard.
		 * Filtered based on user role.
		 * 
		 * @returns Order summary with counts and revenue
		 */
		getSummary: async () =>
			HttpService.get<{
				totalOrders: number
				placedCount: number
				paidCount: number
				processingCount: number
				shippedCount: number
				deliveredCount: number
				cancelledCount: number
				totalRevenue: number
				requiresActionCount: number
			}>('/orders/summary'),

		/**
		 * Gets orders assigned to current sales rep.
		 * 
		 * **Authorization:**
		 * - SalesRep: Returns assigned orders
		 * - SalesManager+: Returns all orders
		 */
		getAssigned: async () => HttpService.get<Order[]>('/orders/assigned'),
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
		
		/**
		 * Rich search for providers with advanced filtering, sorting, and facets.
		 * Used by RichDataGrid for MAANG-level data grid functionality.
		 * 
		 * @param filter - RichSearchFilter with pagination, sorting, column filters, and global search
		 * @returns RichPagedResult with data, facets, and metadata
		 */
		richSearch: async <Provider>(filter: RichSearchFilter) =>
			HttpService.post<RichPagedResult<Provider>>(`/providers/search/rich`, filter),
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
		 * Rich search for customers with advanced filtering, sorting, and facets.
		 * Used by RichDataGrid for MAANG-level data grid functionality.
		 * 
		 * @param filter - RichSearchFilter with pagination, sorting, column filters, and global search
		 * @returns RichPagedResult with data, facets, and metadata
		 */
		richSearch: async (filter: RichSearchFilter) =>
			HttpService.post<RichPagedResult<Company>>(`/customers/search/rich`, filter),
		
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
	 * Dashboard API
	 * Role-based dashboard statistics, tasks, and recent items.
	 * 
	 * **Role-Specific Data:**
	 * - Customer: Own quotes/orders, spending
	 * - SalesRep: Assigned quotes/orders, performance metrics
	 * - Fulfillment: Shipping tasks and metrics
	 * - SalesManager: Team workload and performance
	 * - Admin: System-wide metrics and health
	 * 
	 * @see prd_dashboard.md
	 */
	Dashboard: {
		/**
		 * Gets dashboard statistics for the current user based on their role.
		 * @returns Role-specific dashboard statistics
		 */
		getStats: async () => HttpService.get<DashboardStats>('/dashboard/stats'),
		
		/**
		 * Gets dashboard tasks requiring attention for the current user.
		 * Tasks are sorted by urgency (urgent first) then by creation date.
		 * @returns List of dashboard tasks
		 */
		getTasks: async () => HttpService.get<DashboardTask[]>('/dashboard/tasks'),
		
		/**
		 * Gets recent items (quotes and orders) for dashboard display.
		 * @param count - Number of items to return (default: 5, max: 20)
		 * @returns List of recent items
		 */
		getRecentItems: async (count: number = 5) =>
			HttpService.get<RecentItem[]>(`/dashboard/recent?count=${count}`),
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
	 * Business Intelligence Analytics API
	 * Role-based analytics for sales performance, revenue tracking, and quote pipeline.
	 * 
	 * **Role-Based Access:**
	 * - Customer: Own spending history, order trends
	 * - SalesRep: Personal performance, team comparison (anonymized)
	 * - SalesManager: Team performance, individual rep metrics, revenue by rep
	 * - Admin: Full system analytics, all metrics
	 * 
	 * @see prd_analytics.md
	 */
	Analytics: {
		/**
		 * Gets analytics summary for the current user based on their role.
		 * 
		 * @param startDate - Optional start date filter (ISO string)
		 * @param endDate - Optional end date filter (ISO string)
		 * @returns Role-specific analytics summary
		 * 
		 * @example
		 * ```typescript
		 * // Get last 12 months analytics
		 * const { data } = await API.Analytics.getSummary()
		 * 
		 * // Get specific date range
		 * const { data } = await API.Analytics.getSummary('2024-01-01', '2024-12-31')
		 * ```
		 */
		getSummary: async (startDate?: string, endDate?: string) => {
			const params = new URLSearchParams()
			if (startDate) params.append('startDate', startDate)
			if (endDate) params.append('endDate', endDate)
			const query = params.toString()
			return HttpService.get<AnalyticsSummary>(`/analytics/summary${query ? `?${query}` : ''}`)
		},

		/**
		 * Gets team performance metrics.
		 * 
		 * **Authorization:** SalesManager or Admin only.
		 * 
		 * @param startDate - Optional start date filter
		 * @param endDate - Optional end date filter
		 * @returns List of sales rep performance metrics
		 * 
		 * @example
		 * ```typescript
		 * const { data } = await API.Analytics.getTeamPerformance()
		 * const topPerformer = data.payload?.[0]
		 * ```
		 */
		getTeamPerformance: async (startDate?: string, endDate?: string) => {
			const params = new URLSearchParams()
			if (startDate) params.append('startDate', startDate)
			if (endDate) params.append('endDate', endDate)
			const query = params.toString()
			return HttpService.get<SalesRepPerformanceType[]>(`/analytics/team${query ? `?${query}` : ''}`)
		},

		/**
		 * Gets revenue timeline data for charting.
		 * 
		 * **Authorization:** SalesManager or Admin only.
		 * 
		 * @param startDate - Start date for the timeline
		 * @param endDate - End date for the timeline
		 * @param granularity - Grouping: "day", "week", or "month" (default: month)
		 * @returns List of revenue data points
		 * 
		 * @example
		 * ```typescript
		 * const { data } = await API.Analytics.getRevenueTimeline(
		 *   '2024-01-01',
		 *   '2024-12-31',
		 *   'month'
		 * )
		 * ```
		 */
		getRevenueTimeline: async (
			startDate: string,
			endDate: string,
			granularity: 'day' | 'week' | 'month' = 'month'
		) =>
			HttpService.get<RevenueDataType[]>(
				`/analytics/revenue?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`
			),

		/**
		 * Gets individual sales rep performance.
		 * 
		 * **Authorization:**
		 * - SalesRep: Can only view own performance
		 * - SalesManager/Admin: Can view any sales rep
		 * 
		 * @param salesRepId - Sales rep ID (optional, defaults to current user)
		 * @param startDate - Optional start date filter
		 * @param endDate - Optional end date filter
		 * @returns Sales rep performance metrics
		 */
		getRepPerformance: async (
			salesRepId?: string,
			startDate?: string,
			endDate?: string
		) => {
			const params = new URLSearchParams()
			if (startDate) params.append('startDate', startDate)
			if (endDate) params.append('endDate', endDate)
			const query = params.toString()
			const path = salesRepId ? `/analytics/rep/${salesRepId}` : '/analytics/rep'
			return HttpService.get<SalesRepPerformanceType>(`${path}${query ? `?${query}` : ''}`)
		},
	},

	/**
	 * RBAC Management API
	 * Role-Based Access Control management endpoints.
	 * All operations require Admin role (except Overview/Matrix which allow SalesManager).
	 * 
	 * @see prd_rbac_management.md
	 */
	RBAC: {
		/**
		 * Gets RBAC overview including roles, permissions, and matrix.
		 * SalesManager can view (read-only), Admin can modify.
		 * 
		 * @see prd_rbac_management.md - US-RBAC-001, US-RBAC-002
		 */
		getOverview: async () => HttpService.get<RBACOverview>('/rbac/overview'),

		/**
		 * Gets permission matrix (feature x role).
		 * SalesManager can view (read-only), Admin can modify.
		 * 
		 * @see prd_rbac_management.md - US-RBAC-002
		 */
		getMatrix: async () => HttpService.get<PermissionMatrixEntry[]>('/rbac/matrix'),

		/**
		 * Gets permission audit log with pagination and filtering.
		 * ADMIN ONLY: Audit logs contain sensitive information.
		 * 
		 * @see prd_rbac_management.md - US-RBAC-005
		 */
		getAuditLog: async (filters: AuditLogFilters = {}) => {
			const params = new URLSearchParams()
			if (filters.page) params.append('page', String(filters.page))
			if (filters.pageSize) params.append('pageSize', String(filters.pageSize))
			if (filters.startDate) params.append('startDate', filters.startDate)
			if (filters.endDate) params.append('endDate', filters.endDate)
			if (filters.userId) params.append('userId', String(filters.userId))
			if (filters.resource) params.append('resource', filters.resource)
			const query = params.toString()
			return HttpService.get<PagedResult<PermissionAuditEntryDto>>(`/rbac/audit${query ? `?${query}` : ''}`)
		},

		/**
		 * Bulk updates user roles.
		 * ADMIN ONLY: Role changes require administrative privileges.
		 * 
		 * @see prd_rbac_management.md - US-RBAC-004
		 */
		bulkUpdateRoles: async (request: BulkRoleUpdateRequest) =>
			HttpService.post<BulkRoleUpdateResult>('/rbac/bulk-role', request),

		/**
		 * Gets users with their roles for RBAC management.
		 * ADMIN ONLY: User role information requires administrative privileges.
		 */
		getUsersWithRoles: async (filters: UsersWithRolesFilters = {}) => {
			const params = new URLSearchParams()
			if (filters.page) params.append('page', String(filters.page))
			if (filters.pageSize) params.append('pageSize', String(filters.pageSize))
			if (filters.roleFilter !== undefined) params.append('roleFilter', String(filters.roleFilter))
			if (filters.search) params.append('search', filters.search)
			const query = params.toString()
			return HttpService.get<PagedResult<UserWithRole>>(`/rbac/users${query ? `?${query}` : ''}`)
		},

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

