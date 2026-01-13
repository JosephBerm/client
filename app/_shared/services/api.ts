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
// AccountRole enum removed - now using numeric role levels from API
import type { DashboardStats, DashboardTask, RecentItem } from '@_types/dashboard.types'
import type {
	AnalyticsSummary,
	SalesRepPerformance as SalesRepPerformanceType,
	RevenueData as RevenueDataType,
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
import type Notification from '@_classes/Notification'
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

// Payment Processing Types
import type {
	CreatePaymentIntentResponse,
	CustomerPaymentSettingsDTO,
	PagedPaymentResult,
	PaymentDTO,
	PaymentSearchFilter,
	PaymentSummary,
	RecordManualPaymentRequest,
	RefundRequest,
	SavedPaymentMethodDTO,
	UpdateCustomerPaymentSettingsRequest,
} from '@_features/payments/types'

// Shipping Integration Types
import type {
	CreateLabelRequest,
	OrderShipmentsResponse,
	ShipmentLabel,
	ShippingRate,
	ShippingRateRequest,
	TrackingInfo,
} from '@_features/shipping/types'

// ERP Integration Types
import type {
	IntegrationConnectionDTO,
	IntegrationDashboardSummary,
	IntegrationEntityMappingDTO,
	IntegrationProvider,
	IntegrationSettingsDTO,
	IntegrationStats,
	IntegrationSyncCheckpointDTO,
	IntegrationSyncLogDTO,
	PagedIntegrationResult,
	SyncLogSearchFilter,
	SyncOperationResponse,
	SyncOperationStatus,
	TriggerSyncRequest,
	UpdateConnectionSettingsRequest,
} from '@_features/integrations/types'

// Inventory Management Types
import type {
	AdjustStockRequest,
	AvailabilityCheckItem,
	AvailabilityResult,
	BulkReceiveRequest,
	InitializeInventoryRequest,
	InventoryResult,
	InventorySearchFilter,
	InventorySettingsRequest,
	InventoryStats,
	InventoryTransaction,
	PagedInventoryResult,
	ProductInventory,
	ProductInventorySummary,
	ReceiveStockRequest,
} from '@_features/inventory/types'

// Product Import/Export Types
import type {
	ImportJobResponse,
	ImportJobListResponse,
	ImportStatus,
	ImportValidationResult,
	ImportTemplateInfo,
	ImportTemplateColumn,
	ProductExportFilter,
	StartImportRequest,
} from '@_features/product-import-export/types'

// Pricing Engine Types
import type {
	PriceList,
	PriceListItem,
	PricingResult,
	ProductVolumeTiers,
	PricingRequest,
	CreatePriceListRequest,
	UpdatePriceListRequest,
	AddPriceListItemRequest,
	SetVolumeTiersRequest,
	PriceOverrideHistory,
	PricingAuditLogResponse,
	PricingAuditLogFilter,
	PricingAnalyticsResponse,
	PricingAnalyticsRequest,
} from '@_classes/Pricing'

/**
 * Response type for cart product operations.
 * Contains the updated cart product data.
 */
export interface CartProductResponse {
	id: string
	productId: string
	quantity: number
	customerPrice: number | null
	vendorCost: number | null
	lockedFinalPrice: number | null
	lockedBasePrice: number | null
	pricingLockedAt: string | null
	marginProtected: boolean
}

/** Alias for API backward compatibility */
export type PriceOverrideHistoryEntry = PriceOverrideHistory

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
		 * Gets accounts by role level list (defaults to SalesRep + SalesManager).
		 * Uses backend AccountService.GetByRoleLevel for server-side filtering.
		 *
		 * @param roleLevels - Array of numeric role levels (e.g., [3000, 4000] for SalesRep + SalesManager)
		 */
		getByRole: async (roleLevels?: number[]) => {
			const roleParam = roleLevels?.length ? `?roles=${encodeURIComponent(roleLevels.join('|'))}` : ''
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
		 * - **White-label ready: Uses numeric role levels from API configuration**
		 *
		 * **Supported Filters (via GenericSearchFilter.filters dictionary):**
		 * - **Role**: Single role level or pipe-separated role levels
		 *   - Use numeric role levels from API thresholds (e.g., "3000|4000" for SalesRep + SalesManager)
		 *   - Example: `{ filters: { Role: "3000|4000" } }` returns SalesRep OR SalesManager
		 *   - Default levels: Customer (1000), FulfillmentCoordinator (2000), SalesRep (3000), SalesManager (4000), Admin (5000), SuperAdmin (9999)
		 *   - White-label: Actual values come from GET /rbac/roles/thresholds
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
		 * // Get all SalesReps and SalesManagers (for quote assignment)
		 * // White-label: Role levels come from API thresholds configuration
		 * const { thresholds } = await API.RBAC.getThresholds()
		 * const { data } = await API.Accounts.search({
		 *   filters: {
		 *     Role: `${thresholds.salesRepThreshold}|${thresholds.salesManagerThreshold}`
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
		search: async (search: GenericSearchFilter) => HttpService.post<PagedResult<User>>(`/account/search`, search),

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
		updateRole: async (id: string, role: number) => HttpService.put<User>(`/account/${id}/role`, { role }),

		/**
		 * Gets role distribution statistics (admin only).
		 * Used by RBAC dashboard for role analytics.
		 * @returns Role distribution with counts per role
		 */
		getRoleStats: async () => HttpService.get<RoleDistribution>('/account/role-stats'),

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
		changeStatus: async (id: string, status: number, reason?: string) => {
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
			archive: async (productId: string) => HttpService.post<boolean>(`/products/${productId}/archive`, null),

			/**
			 * Restores an archived product.
			 * Product becomes visible in public store again.
			 * @param productId - Product ID to restore
			 * @returns Success status
			 *
			 * @see prd_products.md - US-PRD-005
			 */
			restore: async (productId: string) => HttpService.put<boolean>(`/products/${productId}/restore`, {}),

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
			getStats: async () =>
				HttpService.get<{
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
			image: async (id: string, name: string) => HttpService.get(`/products/image?productId=${id}&image=${name}`),

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
			getCategoriesCacheable: async () => HttpService.getPublic<ProductsCategory[]>('/Products/categories/clean'),

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
			getPublicCacheable: async (productId: string) => HttpService.getPublic<Product>(`/products/${productId}`),
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
		) =>
			HttpService.put<Quote>(`/quotes/${quoteId}/pricing`, {
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
		submitQuote: async <Boolean>(req: SubmitOrderRequest) => HttpService.post<Boolean>(`/orders/submit/quote`, req),

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
	 *
	 * **Architecture:**
	 * - All endpoints are user-scoped (users can only access their own notifications)
	 * - Rich search supports server-side pagination for RichDataGrid
	 * - Bulk operations (mark all as read) for efficiency
	 */
	Notifications: {
		/**
		 * Gets a single notification by ID.
		 * @param id - Notification ID (GUID)
		 */
		get: async (id: string) => HttpService.get<Notification>(`/notifications/${id}`),

		/**
		 * Creates a new notification.
		 * Typically called by system processes, not end users.
		 * @param notification - Notification data
		 */
		create: async (notification: Partial<Notification>) =>
			HttpService.post<boolean>('/notifications', notification),

		/**
		 * Deletes a notification.
		 * User can only delete their own notifications.
		 * @param id - Notification ID (GUID) to delete
		 */
		delete: async (id: string) => HttpService.delete<boolean>(`/notifications/${id}`),

		/**
		 * Rich search for notifications with filtering, sorting, pagination.
		 * Supports RichDataGrid server-side operations.
		 * @param filter - RichSearchFilter object
		 */
		richSearch: async (filter: RichSearchFilter) =>
			HttpService.post<RichPagedResult<Notification>>('/notifications/search/rich', filter),

		/**
		 * Mark a single notification as read.
		 * @param id - Notification ID (GUID)
		 */
		markAsRead: async (id: string) => HttpService.put<boolean>(`/notifications/${id}/read`, {}),

		/**
		 * Mark all notifications as read for current user.
		 * Returns the count of notifications marked as read.
		 */
		markAllAsRead: async () => HttpService.put<number>('/notifications/read-all', {}),
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
		getAggregateStats: async () =>
			HttpService.get<{
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
		sendQuote: async (request: CreateQuoteRequest) => HttpService.post<CreateQuoteResponse>('/quotes', request),

		/**
		 * Submits a contact form request from public website.
		 * @param contactRequest - Contact form data
		 */
		sendContactRequest: async (contactRequest: ContactRequest) => HttpService.post<any>('/contact', contactRequest),
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
		getRecentItems: async (count: number = 5) => HttpService.get<RecentItem[]>(`/dashboard/recent?count=${count}`),
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
		getRepPerformance: async (salesRepId?: string, startDate?: string, endDate?: string) => {
			const params = new URLSearchParams()
			if (startDate) params.append('startDate', startDate)
			if (endDate) params.append('endDate', endDate)
			const query = params.toString()
			const path = salesRepId ? `/analytics/rep/${salesRepId}` : '/analytics/rep'
			return HttpService.get<SalesRepPerformanceType>(`${path}${query ? `?${query}` : ''}`)
		},
	},

	/**
	 * Payment Processing API
	 * Handles payment intents, manual payments, refunds, and saved payment methods.
	 *
	 * **Business Flow:**
	 * - Stripe PaymentIntent for card payments
	 * - Manual payment recording for check, wire, cash
	 * - Refund processing (full and partial)
	 * - Saved payment methods management
	 * - B2B payment terms (Net 15/30/45/60/90)
	 *
	 * @see 02_PAYMENT_PROCESSING_PLAN.md
	 */
	Payments: {
		/**
		 * Creates a PaymentIntent for an order.
		 * Returns client_secret for Stripe.js frontend.
		 * @param orderId - Order ID to create payment intent for
		 */
		createPaymentIntent: async (orderId: number) =>
			HttpService.post<CreatePaymentIntentResponse>(`/payment/orders/${orderId}/intent`, {}),

		/**
		 * Confirms a PaymentIntent after payment completion.
		 * @param paymentIntentId - Stripe PaymentIntent ID
		 */
		confirmPaymentIntent: async (paymentIntentId: string) =>
			HttpService.post<PaymentDTO>(`/payment/intent/${paymentIntentId}/confirm`, {}),

		/**
		 * Records a manual payment (check, wire, cash).
		 * @param orderId - Order ID
		 * @param request - Manual payment details
		 */
		recordManualPayment: async (orderId: number, request: RecordManualPaymentRequest) =>
			HttpService.post<PaymentDTO>(`/payment/orders/${orderId}/manual`, request),

		/**
		 * Gets a payment by ID.
		 * @param paymentId - Payment GUID
		 */
		get: async (paymentId: string) => HttpService.get<PaymentDTO>(`/payment/${paymentId}`),

		/**
		 * Gets all payments for an order.
		 * @param orderId - Order ID
		 */
		getByOrderId: async (orderId: number) => HttpService.get<PaymentDTO[]>(`/payment/orders/${orderId}`),

		/**
		 * Gets payment summary for an order.
		 * @param orderId - Order ID
		 */
		getOrderSummary: async (orderId: number) =>
			HttpService.get<PaymentSummary>(`/payment/orders/${orderId}/summary`),

		/**
		 * Gets all payments for a customer.
		 * @param customerId - Customer ID
		 */
		getByCustomerId: async (customerId: number) =>
			HttpService.get<PaymentDTO[]>(`/payment/customers/${customerId}`),

		/**
		 * Searches payments with filters.
		 * @param filter - Search filter with pagination
		 */
		search: async (filter: PaymentSearchFilter) =>
			HttpService.post<PagedPaymentResult<PaymentDTO>>(`/payment/search`, filter),

		/**
		 * Processes a refund for a payment.
		 * @param paymentId - Payment GUID
		 * @param request - Refund details
		 */
		refund: async (paymentId: string, request: RefundRequest) =>
			HttpService.post<PaymentDTO>(`/payment/${paymentId}/refund`, request),

		/**
		 * Saved Payment Methods Management
		 */
		PaymentMethods: {
			/**
			 * Gets saved payment methods for a customer.
			 * @param customerId - Customer ID
			 */
			getAll: async (customerId: number) =>
				HttpService.get<SavedPaymentMethodDTO[]>(`/payment/customers/${customerId}/payment-methods`),

			/**
			 * Sets a payment method as default.
			 * @param customerId - Customer ID
			 * @param paymentMethodId - Payment method GUID
			 */
			setDefault: async (customerId: number, paymentMethodId: string) =>
				HttpService.post(`/payment/customers/${customerId}/payment-methods/${paymentMethodId}/default`, {}),

			/**
			 * Deletes a saved payment method.
			 * @param paymentMethodId - Payment method GUID
			 */
			delete: async (paymentMethodId: string) =>
				HttpService.delete(`/payment/payment-methods/${paymentMethodId}`),
		},

		/**
		 * Customer Payment Settings
		 */
		CustomerSettings: {
			/**
			 * Gets customer payment settings.
			 * @param customerId - Customer ID
			 */
			get: async (customerId: number) =>
				HttpService.get<CustomerPaymentSettingsDTO>(`/payment/customers/${customerId}/settings`),

			/**
			 * Updates customer payment settings.
			 * @param customerId - Customer ID
			 * @param request - Updated settings
			 */
			update: async (customerId: number, request: UpdateCustomerPaymentSettingsRequest) =>
				HttpService.put<CustomerPaymentSettingsDTO>(`/payment/customers/${customerId}/settings`, request),
		},
	},

	/**
	 * Shipping Integration API (MVP Feature #03)
	 * Rate shopping, label generation, and tracking.
	 *
	 * **Business Flow:**
	 * - Get shipping rates from multiple carriers
	 * - Create shipping labels for orders
	 * - Track shipments
	 * - Webhook handling for status updates
	 *
	 * @see 03_SHIPPING_INTEGRATION_PLAN.md
	 */
	Shipping: {
		/**
		 * Gets shipping rates from multiple carriers.
		 * @param request - Shipping rate request with package details
		 */
		getRates: async (request: ShippingRateRequest) => HttpService.post<ShippingRate[]>('/shipping/rates', request),

		/**
		 * Creates a shipping label for an order.
		 * @param request - Label creation request
		 */
		createLabel: async (request: CreateLabelRequest) =>
			HttpService.post<ShipmentLabel>('/shipping/labels', request),

		/**
		 * Gets a shipping label by ID.
		 * @param labelId - Label GUID
		 */
		getLabel: async (labelId: string) => HttpService.get<ShipmentLabel>(`/shipping/labels/${labelId}`),

		/**
		 * Gets all shipping labels for an order.
		 * @param orderId - Order ID
		 */
		getOrderLabels: async (orderId: number) =>
			HttpService.get<OrderShipmentsResponse>(`/shipping/orders/${orderId}/labels`),

		/**
		 * Voids/cancels a shipping label.
		 * @param labelId - Label GUID
		 */
		voidLabel: async (labelId: string) =>
			HttpService.delete<{ success: boolean; message: string }>(`/shipping/labels/${labelId}`),

		/**
		 * Gets tracking information for a shipment.
		 * @param trackingNumber - Tracking number
		 * @param carrier - Optional carrier code
		 */
		getTracking: async (trackingNumber: string, carrier?: string) => {
			const params = new URLSearchParams()
			if (carrier) params.append('carrier', carrier)
			const query = params.toString()
			return HttpService.get<TrackingInfo>(
				`/shipping/tracking/${encodeURIComponent(trackingNumber)}${query ? `?${query}` : ''}`
			)
		},
	},

	/**
	 * Inventory Management API (MVP Feature #01)
	 * Stock tracking, low stock alerts, and inventory adjustments.
	 *
	 * **Business Flow:**
	 * - Track stock levels (on-hand, reserved, available)
	 * - Low stock alerts with configurable reorder points
	 * - Transaction history for full audit trail
	 * - Availability checking for orders
	 *
	 * @see 01_INVENTORY_MANAGEMENT_PLAN.md
	 */
	Inventory: {
		/**
		 * Gets inventory for a specific product.
		 * @param productId - Product GUID
		 */
		getByProductId: async (productId: string) => HttpService.get<ProductInventory>(`/inventory/${productId}`),

		/**
		 * Gets all inventory records.
		 * @param lowStockOnly - Filter to only low stock items
		 */
		getAll: async (lowStockOnly = false) => {
			const url = lowStockOnly ? '/inventory?lowStockOnly=true' : '/inventory'
			return HttpService.get<ProductInventory[]>(url)
		},

		/**
		 * Gets low stock items (below reorder point).
		 */
		getLowStock: async () => HttpService.get<ProductInventory[]>('/inventory/low-stock'),

		/**
		 * Gets out of stock items.
		 */
		getOutOfStock: async () => HttpService.get<ProductInventory[]>('/inventory/out-of-stock'),

		/**
		 * Searches inventory with filters and pagination.
		 * @param filter - Search filter with pagination
		 */
		search: async (filter: InventorySearchFilter) =>
			HttpService.post<PagedInventoryResult<ProductInventorySummary>>('/inventory/search', filter),

		/**
		 * Gets inventory statistics for dashboard.
		 */
		getStats: async () => HttpService.get<InventoryStats>('/inventory/stats'),

		/**
		 * Gets transaction history for a product.
		 * @param productId - Product GUID
		 * @param options - Date range and limit options
		 */
		getTransactions: async (productId: string, options?: { fromDate?: Date; toDate?: Date; limit?: number }) => {
			const params = new URLSearchParams()
			if (options?.fromDate) params.set('fromDate', options.fromDate.toISOString())
			if (options?.toDate) params.set('toDate', options.toDate.toISOString())
			if (options?.limit) params.set('limit', options.limit.toString())
			const query = params.toString()
			return HttpService.get<InventoryTransaction[]>(
				`/inventory/${productId}/transactions${query ? `?${query}` : ''}`
			)
		},

		/**
		 * Initializes inventory for a product.
		 * @param request - Initial inventory settings
		 */
		initialize: async (request: InitializeInventoryRequest) =>
			HttpService.post<InventoryResult>('/inventory/initialize', request),

		/**
		 * Receives stock (from purchase, return, etc.).
		 * @param productId - Product GUID
		 * @param request - Stock receipt details
		 */
		receiveStock: async (productId: string, request: ReceiveStockRequest) =>
			HttpService.post<InventoryResult>(`/inventory/${productId}/receive`, request),

		/**
		 * Adjusts stock (stocktake, damage, etc.).
		 * @param productId - Product GUID
		 * @param request - Adjustment details with reason
		 */
		adjustStock: async (productId: string, request: AdjustStockRequest) =>
			HttpService.post<InventoryResult>(`/inventory/${productId}/adjust`, request),

		/**
		 * Updates inventory settings (reorder point, etc.).
		 * @param productId - Product GUID
		 * @param settings - Updated settings
		 */
		updateSettings: async (productId: string, settings: InventorySettingsRequest) =>
			HttpService.put<ProductInventory>(`/inventory/${productId}/settings`, settings),

		/**
		 * Checks availability for a single product.
		 * @param productId - Product GUID
		 * @param quantity - Requested quantity
		 */
		checkAvailability: async (productId: string, quantity = 1) =>
			HttpService.get<AvailabilityResult>(`/inventory/${productId}/availability?quantity=${quantity}`),

		/**
		 * Checks availability for multiple products.
		 * @param items - Array of product ID and quantity pairs
		 */
		checkBulkAvailability: async (items: AvailabilityCheckItem[]) =>
			HttpService.post<AvailabilityResult[]>('/inventory/check-availability', items),

		/**
		 * Receives stock for multiple products (purchase order).
		 * @param request - Bulk receive request
		 */
		bulkReceive: async (request: BulkReceiveRequest) =>
			HttpService.post<InventoryResult[]>('/inventory/bulk-receive', request),
	},

	/**
	 * Product Import/Export API (MVP Feature #04)
	 * Bulk product management via CSV/JSON.
	 *
	 * **Business Flow:**
	 * - Import products from CSV/JSON files
	 * - Export products to CSV/JSON
	 * - Async processing with progress tracking
	 * - Validation before import
	 *
	 * @see 04_PRODUCT_IMPORT_EXPORT_PLAN.md
	 */
	ProductImportExport: {
		/**
		 * Starts a product import from uploaded file.
		 * @param file - File to upload (CSV or JSON)
		 * @param options - Import options
		 */
		startImport: async (file: File, options?: StartImportRequest) => {
			const formData = new FormData()
			formData.append('file', file)
			if (options?.updateExisting !== undefined) {
				formData.append('updateExisting', String(options.updateExisting))
			}
			if (options?.createCategories !== undefined) {
				formData.append('createCategories', String(options.createCategories))
			}
			return HttpService.post<ImportJobResponse>('/products/import', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
		},

		/**
		 * Gets import job status.
		 * @param jobId - Import job GUID
		 */
		getJobStatus: async (jobId: string) => HttpService.get<ImportJobResponse>(`/products/import/${jobId}`),

		/**
		 * Gets all import jobs with pagination.
		 * @param page - Page number
		 * @param pageSize - Items per page
		 */
		getJobs: async (page = 1, pageSize = 10) =>
			HttpService.get<ImportJobListResponse>(`/products/import?page=${page}&pageSize=${pageSize}`),

		/**
		 * Cancels a running import job.
		 * @param jobId - Import job GUID
		 */
		cancelJob: async (jobId: string) => HttpService.post<boolean>(`/products/import/${jobId}/cancel`, {}),

		/**
		 * Validates a file without importing.
		 * @param file - File to validate
		 */
		validateFile: async (file: File) => {
			const formData = new FormData()
			formData.append('file', file)
			return HttpService.post<ImportValidationResult>('/products/import/validate', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
		},

		/**
		 * Exports products to CSV or JSON.
		 * @param filter - Export filter options
		 */
		exportProducts: async (filter?: ProductExportFilter) => {
			const format = filter?.format || 'csv'
			return HttpService.download<Blob>('/products/export', filter || {}, {
				responseType: 'blob',
				headers: { Accept: format === 'csv' ? 'text/csv' : 'application/json' },
			})
		},

		/**
		 * Downloads an import template.
		 * @param format - Template format (csv or json)
		 */
		downloadTemplate: async (format: 'csv' | 'json' = 'csv') =>
			HttpService.download<Blob>(
				`/products/import/template?format=${format}`,
				{},
				{
					responseType: 'blob',
				}
			),

		/**
		 * Gets template column definitions.
		 */
		getTemplateInfo: async () => HttpService.get<ImportTemplateInfo>('/products/import/template/info'),
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
		 * Gets role level thresholds from configuration.
		 * Used for level-based authorization checks (isAdmin, isSuperAdmin).
		 *
		 * @returns Threshold configuration
		 * @see server/Controllers/RBACController.cs - GetThresholds
		 */
		getThresholds: async () => HttpService.get<RoleThresholdsResponse>('/rbac/roles/thresholds'),

		/**
		 * Gets the current user's permissions from database.
		 * Used by usePermissions hook to determine allowed actions.
		 *
		 * @returns User permissions with role information
		 * @see server/Controllers/RBACController.cs - GetMyPermissions
		 */
		getMyPermissions: async () => HttpService.get<UserPermissionsResponse>('/rbac/my-permissions'),

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
			 * Deletes a role if no users are assigned.
			 * If users are assigned, returns BlockedByUsers=true with user count.
			 * Caller must migrate users via bulkUpdateRoles before retrying.
			 *
			 * AWS IAM Pattern: Returns structured result instead of throwing.
			 *
			 * @see https://docs.aws.amazon.com/IAM/latest/APIReference/API_DeleteRole.html
			 */
			delete: async (id: number) => HttpService.delete<RoleDeleteResult>(`/rbac/roles/${id}`),

			/**
			 * Gets all permissions assigned to a role.
			 */
			getPermissions: async (roleId: number) =>
				HttpService.get<Permission[]>(`/rbac/roles/${roleId}/permissions`),

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

	/**
	 * Advanced Pricing Engine API
	 * Handles price calculation, price list management, volume tiers, and customer assignments.
	 *
	 * **Business Flow:**
	 * - Price Calculation: Deterministic waterfall (Base → Contract → Volume → Margin Protection)
	 * - Price Lists: Named collections of product pricing (fixed price, % discount, $ discount)
	 * - Volume Tiers: Quantity-based pricing breaks
	 * - Customer Assignments: Link customers to their contract price lists
	 *
	 * **Security:**
	 * - Customers can only see their own prices (CustomerId resolved from auth)
	 * - Margin data hidden from customers
	 * - Admin-only for price list management
	 *
	 * @see prd_pricing_engine.md
	 */
	Pricing: {
		// =====================================================================
		// PRICE CALCULATION
		// =====================================================================

		/**
		 * Calculates price for a single product.
		 *
		 * **Waterfall Algorithm:**
		 * 1. Base Price → 2. Contract Price List → 3. Volume Tier → 4. Margin Protection
		 *
		 * **Security (PRD 5.1):**
		 * - Customer role: CustomerId in request is ignored, resolved from auth context
		 * - Staff roles: Can specify any CustomerId
		 * - Customers don't see margin data in response
		 *
		 * @param request - Pricing request with productId, quantity, customerId
		 * @returns PricingResult with final price and applied rules
		 *
		 * @see prd_pricing_engine.md - US-PRICE-001
		 */
		calculate: async (request: PricingRequest) => HttpService.post<PricingResult>('/pricing/calculate', request),

		/**
		 * Calculates prices for multiple products (cart/product list).
		 * Optimized for batch queries - avoids N+1 database calls.
		 *
		 * **Performance:** Max 100 items per request.
		 *
		 * @param items - Array of pricing requests
		 * @returns Array of PricingResults
		 */
		calculateBulk: async (items: PricingRequest[]) =>
			HttpService.post<PricingResult[]>('/pricing/calculate/bulk', { items }),

		// =====================================================================
		// PRICE LIST MANAGEMENT
		// =====================================================================

		/**
		 * Gets all price lists with pagination.
		 *
		 * **Authorization:** PricingView policy (Admin, SalesManager, SalesRep)
		 *
		 * @param page - Page number (default: 1)
		 * @param pageSize - Items per page (default: 20)
		 */
		getPriceLists: async (page = 1, pageSize = 20) =>
			HttpService.get<PagedResult<PriceList>>(`/pricing/price-lists?page=${page}&pageSize=${pageSize}`),

		/**
		 * Gets a price list by ID with full details (items and customers).
		 *
		 * **Authorization:** PricingView policy
		 *
		 * @param id - Price list GUID
		 */
		getPriceList: async (id: string) => HttpService.get<PriceList>(`/pricing/price-lists/${id}`),

		/**
		 * Creates a new price list.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param data - Price list creation data
		 * @returns Created price list
		 *
		 * @see prd_pricing_engine.md - US-PRICE-004
		 */
		createPriceList: async (data: CreatePriceListRequest) =>
			HttpService.post<PriceList>('/pricing/price-lists', data),

		/**
		 * Updates an existing price list.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param id - Price list GUID
		 * @param data - Updated price list data
		 */
		updatePriceList: async (id: string, data: UpdatePriceListRequest) =>
			HttpService.put<PriceList>(`/pricing/price-lists/${id}`, data),

		/**
		 * Deletes a price list.
		 * Also removes all items and customer assignments.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param id - Price list GUID
		 */
		deletePriceList: async (id: string) => HttpService.delete<boolean>(`/pricing/price-lists/${id}`),

		// =====================================================================
		// PRICE LIST ITEMS
		// =====================================================================

		/**
		 * Adds a product to a price list with pricing configuration.
		 *
		 * **Pricing Methods (exactly one required):**
		 * - fixedPrice: Customer pays this exact price
		 * - percentDiscount: Customer gets X% off base price
		 * - fixedDiscount: Customer gets $X off base price
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param priceListId - Price list GUID
		 * @param data - Product pricing configuration
		 *
		 * @see prd_pricing_engine.md - US-PRICE-005
		 */
		addPriceListItem: async (priceListId: string, data: AddPriceListItemRequest) =>
			HttpService.post<PriceListItem>(`/pricing/price-lists/${priceListId}/items`, data),

		/**
		 * Updates a price list item's pricing configuration.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param itemId - Price list item GUID
		 * @param data - Updated pricing configuration
		 */
		updatePriceListItem: async (itemId: string, data: AddPriceListItemRequest) =>
			HttpService.put<PriceListItem>(`/pricing/price-lists/items/${itemId}`, data),

		/**
		 * Removes a product from a price list.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param itemId - Price list item GUID
		 */
		removePriceListItem: async (itemId: string) =>
			HttpService.delete<boolean>(`/pricing/price-lists/items/${itemId}`),

		// =====================================================================
		// CUSTOMER ASSIGNMENTS
		// =====================================================================

		/**
		 * Gets all price lists assigned to a customer.
		 *
		 * **Authorization:** CustomersRead policy
		 *
		 * @param customerId - Customer ID
		 */
		getCustomerPriceLists: async (customerId: number) =>
			HttpService.get<PriceList[]>(`/pricing/customers/${customerId}/price-lists`),

		/**
		 * Assigns a price list to a customer.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param customerId - Customer ID
		 * @param priceListId - Price list GUID to assign
		 *
		 * @see prd_pricing_engine.md - US-PRICE-006
		 */
		assignCustomerToPriceList: async (customerId: number, priceListId: string) =>
			HttpService.post<boolean>(`/pricing/customers/${customerId}/price-lists`, { priceListId }),

		/**
		 * Removes a price list assignment from a customer.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param customerId - Customer ID
		 * @param priceListId - Price list GUID to remove
		 */
		removeCustomerFromPriceList: async (customerId: number, priceListId: string) =>
			HttpService.delete<boolean>(`/pricing/customers/${customerId}/price-lists/${priceListId}`),

		// =====================================================================
		// VOLUME PRICING
		// =====================================================================

		/**
		 * Gets all volume pricing tiers for a product.
		 * Accessible to all authenticated users (customers can see their volume discounts).
		 *
		 * @param productId - Product GUID
		 *
		 * @see prd_pricing_engine.md - US-PRICE-008
		 */
		getVolumeTiers: async (productId: string) =>
			HttpService.get<ProductVolumeTiers>(`/pricing/products/${productId}/volume-tiers`),

		/**
		 * Sets volume pricing tiers for a product.
		 * Replaces all existing tiers.
		 *
		 * **Validation:**
		 * - No overlapping quantity ranges
		 * - No duplicate minQuantity values
		 * - Each tier has exactly one pricing method (unitPrice or percentDiscount)
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param productId - Product GUID
		 * @param request - New volume tiers
		 *
		 * @see prd_pricing_engine.md - US-PRICE-007
		 */
		setVolumeTiers: async (productId: string, request: SetVolumeTiersRequest) =>
			HttpService.post<ProductVolumeTiers>(`/pricing/products/${productId}/volume-tiers`, request),

		/**
		 * Clears all volume tiers for a product.
		 *
		 * **Authorization:** PricingManage policy (Admin only)
		 *
		 * @param productId - Product GUID
		 */
		clearVolumeTiers: async (productId: string) =>
			HttpService.delete<boolean>(`/pricing/products/${productId}/volume-tiers`),

		// =====================================================================
		// PRICE OVERRIDE (Sales Manager)
		// =====================================================================

		/**
		 * Overrides the price for a quote item.
		 * Sales Managers can manually override calculated prices with business justification.
		 * Creates an audit log entry for compliance.
		 *
		 * **Authorization:** PricingManage policy (Admin, SalesManager)
		 *
		 * @param quoteId - Quote GUID
		 * @param cartProductId - Cart product GUID to override
		 * @param data - Override price and reason
		 *
		 * @see prd_pricing_engine.md - US-PRICE-012
		 */
		overrideQuoteItemPrice: async (
			quoteId: string,
			cartProductId: string,
			data: { overridePrice: number; overrideReason: string }
		) => HttpService.put<CartProductResponse>(`/pricing/quotes/${quoteId}/items/${cartProductId}/override`, data),

		/**
		 * Gets the price override history for a cart product.
		 *
		 * **Authorization:** PricingView policy (Admin, SalesManager, SalesRep)
		 *
		 * @param cartProductId - Cart product GUID
		 * @returns Array of price override history entries
		 */
		getPriceOverrideHistory: async (cartProductId: string) =>
			HttpService.get<PriceOverrideHistoryEntry[]>(`/pricing/items/${cartProductId}/override-history`),

		// =====================================================================
		// AUDIT LOGS
		// =====================================================================

		/**
		 * Gets paginated pricing audit logs with filtering.
		 * Used for compliance, debugging, and pricing analysis.
		 *
		 * **Authorization:** PricingView policy (Admin, SalesManager, SalesRep)
		 *
		 * @param filter - Filter parameters (productId, customerId, eventType, dateRange, etc.)
		 * @returns Paginated audit log entries
		 *
		 * @see prd_pricing_engine.md - Section 6.3 Audit & Compliance
		 */
		getAuditLogs: async (filter: PricingAuditLogFilter) => {
			const params = new URLSearchParams()
			if (filter.productId) params.set('productId', filter.productId)
			if (filter.customerId) params.set('customerId', filter.customerId.toString())
			if (filter.eventType) params.set('eventType', filter.eventType)
			if (filter.dateFrom)
				params.set(
					'dateFrom',
					filter.dateFrom instanceof Date ? filter.dateFrom.toISOString() : filter.dateFrom
				)
			if (filter.dateTo)
				params.set('dateTo', filter.dateTo instanceof Date ? filter.dateTo.toISOString() : filter.dateTo)
			if (filter.quoteId) params.set('quoteId', filter.quoteId)
			if (filter.orderId) params.set('orderId', filter.orderId.toString())
			if (filter.marginProtectedOnly) params.set('marginProtectedOnly', 'true')
			if (filter.page) params.set('page', filter.page.toString())
			if (filter.pageSize) params.set('pageSize', filter.pageSize.toString())
			const queryString = params.toString()
			return HttpService.get<PagedResult<PricingAuditLogResponse>>(
				`/pricing/audit-logs${queryString ? `?${queryString}` : ''}`
			)
		},

		// =====================================================================
		// ANALYTICS
		// =====================================================================

		/**
		 * Gets pricing analytics for a specified period.
		 * Includes average margins, discounts, price list performance, and trends.
		 *
		 * **Authorization:** SalesManagerOrAbove policy (SalesManager, Admin)
		 * Contains sensitive margin data - not accessible to SalesRep or Customer.
		 *
		 * @param request - Analytics parameters (period, startDate, endDate)
		 * @returns PricingAnalyticsResponse with metrics, distributions, and trends
		 *
		 * @see prd_pricing_engine.md - Section 4.2 Sales Manager View
		 */
		getAnalytics: async (request: PricingAnalyticsRequest) => {
			const params = new URLSearchParams()
			if (request.period) params.set('period', request.period)
			if (request.startDate)
				params.set(
					'startDate',
					request.startDate instanceof Date ? request.startDate.toISOString() : request.startDate
				)
			if (request.endDate)
				params.set('endDate', request.endDate instanceof Date ? request.endDate.toISOString() : request.endDate)
			const queryString = params.toString()
			return HttpService.get<PricingAnalyticsResponse>(
				`/pricing/analytics${queryString ? `?${queryString}` : ''}`
			)
		},
	},

	// =========================================================================
	// ERP INTEGRATIONS
	// =========================================================================

	/**
	 * ERP Integration API (PRD: prd_erp_integration.md)
	 * Connect to QuickBooks Online, NetSuite, and other accounting systems.
	 *
	 * **Features:**
	 * - OAuth connections to ERP systems
	 * - Bi-directional data sync (Customers, Invoices, Payments, Products)
	 * - Transactional outbox for reliable event delivery
	 * - Entity mapping between Prometheus and ERP IDs
	 * - Sync logs and audit trail
	 *
	 * **Authorization:** IntegrationsView / IntegrationsManage policies
	 */
	Integrations: {
		// =====================================================================
		// CONNECTIONS
		// =====================================================================

		/**
		 * Gets all integration connections for the current tenant.
		 */
		getConnections: async () => HttpService.get<IntegrationConnectionDTO[]>('/integration/connections'),

		/**
		 * Gets a specific connection by ID.
		 */
		getConnection: async (connectionId: string) =>
			HttpService.get<IntegrationConnectionDTO>(`/integration/connections/${connectionId}`),

		/**
		 * Updates connection settings.
		 */
		updateConnectionSettings: async (connectionId: string, request: UpdateConnectionSettingsRequest) =>
			HttpService.put<IntegrationConnectionDTO>(`/integration/connections/${connectionId}/settings`, request),

		/**
		 * Disconnects an integration.
		 */
		disconnect: async (connectionId: string) =>
			HttpService.post<boolean>(`/integration/connections/${connectionId}/disconnect`, {}),

		/**
		 * Tests a connection.
		 */
		testConnection: async (connectionId: string) =>
			HttpService.post<{ success: boolean; message: string }>(
				`/integration/connections/${connectionId}/test`,
				{}
			),

		// =====================================================================
		// SYNC OPERATIONS
		// =====================================================================

		/**
		 * Triggers a manual sync operation.
		 */
		triggerSync: async (request: TriggerSyncRequest) =>
			HttpService.post<SyncOperationResponse>('/integration/sync', request),

		/**
		 * Gets the status of a sync operation.
		 */
		getSyncStatus: async (correlationId: string) =>
			HttpService.get<SyncOperationStatus>(`/integration/sync/${correlationId}/status`),

		/**
		 * Gets sync checkpoints for a provider.
		 */
		getSyncCheckpoints: async (provider: string) =>
			HttpService.get<IntegrationSyncCheckpointDTO[]>(`/integration/checkpoints/${provider}`),

		// =====================================================================
		// ENTITY MAPPINGS
		// =====================================================================

		/**
		 * Gets entity mappings with optional filters.
		 */
		getEntityMappings: async (
			provider?: string,
			entityType?: string,
			pageNumber = 1,
			pageSize = 20,
			prometheusEntityId?: string
		) => {
			const params = new URLSearchParams()
			if (provider) {
				params.append('provider', provider)
			}
			if (entityType) {
				params.append('entityType', entityType)
			}
			if (prometheusEntityId) {
				params.append('prometheusEntityId', prometheusEntityId)
			}
			params.append('pageNumber', pageNumber.toString())
			params.append('pageSize', pageSize.toString())
			return HttpService.get<PagedIntegrationResult<IntegrationEntityMappingDTO>>(
				`/integration/mappings?${params.toString()}`
			)
		},

		/**
		 * Gets the external ID for a Prometheus entity.
		 */
		getExternalId: async (provider: string, entityType: string, prometheusId: string) =>
			HttpService.get<{ externalId: string }>(
				`/integration/mappings/external-id?provider=${provider}&entityType=${entityType}&prometheusId=${prometheusId}`
			),

		// =====================================================================
		// SYNC LOGS
		// =====================================================================

		/**
		 * Gets sync logs with filters.
		 */
		getSyncLogs: async (filter: SyncLogSearchFilter) => {
			const params = new URLSearchParams()
			if (filter.provider) {
				params.append('provider', filter.provider)
			}
			if (filter.entityType) {
				params.append('entityType', filter.entityType)
			}
			if (filter.entityId) {
				params.append('entityId', filter.entityId)
			}
			if (filter.direction !== undefined) {
				params.append('direction', filter.direction.toString())
			}
			if (filter.status !== undefined) {
				params.append('status', filter.status.toString())
			}
			if (filter.fromDate) {
				params.append('fromDate', filter.fromDate)
			}
			if (filter.toDate) {
				params.append('toDate', filter.toDate)
			}
			if (filter.searchTerm) {
				params.append('searchTerm', filter.searchTerm)
			}
			params.append('pageNumber', (filter.pageNumber ?? 1).toString())
			params.append('pageSize', (filter.pageSize ?? 20).toString())
			if (filter.sortBy) {
				params.append('sortBy', filter.sortBy)
			}
			if (filter.sortDescending !== undefined) {
				params.append('sortDescending', filter.sortDescending.toString())
			}
			return HttpService.get<PagedIntegrationResult<IntegrationSyncLogDTO>>(
				`/integration/logs?${params.toString()}`
			)
		},

		/**
		 * Gets a specific sync log entry.
		 */
		getSyncLogDetail: async (logId: string) => HttpService.get<IntegrationSyncLogDTO>(`/integration/logs/${logId}`),

		// =====================================================================
		// DASHBOARD & STATS
		// =====================================================================

		/**
		 * Gets integration dashboard summary.
		 */
		getDashboardSummary: async () => HttpService.get<IntegrationDashboardSummary>('/integration/dashboard'),

		/**
		 * Gets integration statistics.
		 */
		getStats: async () => HttpService.get<IntegrationStats>('/integration/stats'),

		// =====================================================================
		// SETTINGS
		// =====================================================================

		/**
		 * Gets integration settings for a provider.
		 */
		getSettings: async (provider: IntegrationProvider) =>
			HttpService.get<IntegrationSettingsDTO>(`/integration/settings/${provider}`),

		/**
		 * Updates integration settings for a provider.
		 */
		updateSettings: async (provider: IntegrationProvider, settings: IntegrationSettingsDTO) =>
			HttpService.put<IntegrationSettingsDTO>(`/integration/settings/${provider}`, settings),

		// =====================================================================
		// OAUTH (QuickBooks / NetSuite)
		// =====================================================================

		/**
		 * Initiates QuickBooks OAuth connection.
		 */
		initiateQuickBooksConnection: async () =>
			HttpService.get<{ authorizationUrl: string; state: string }>('/quickbooks/connect'),

		/**
		 * Initiates NetSuite OAuth connection.
		 */
		initiateNetSuiteConnection: async () =>
			HttpService.get<{ authorizationUrl: string; state: string }>('/netsuite/connect'),

		/**
		 * Connects NetSuite using Token-Based Authentication.
		 */
		connectNetSuiteTBA: async (credentials: {
			accountId: string
			consumerKey: string
			consumerSecret: string
			tokenId: string
			tokenSecret: string
		}) => HttpService.post<boolean>('/netsuite/connect', credentials),

		// =====================================================================
		// OUTBOX & INBOX
		// =====================================================================

		/**
		 * Gets pending outbox items.
		 */
		getOutboxItems: async (pageNumber = 1, pageSize = 20) =>
			HttpService.get<unknown[]>(`/integration/outbox?pageNumber=${pageNumber}&pageSize=${pageSize}`),

		/**
		 * Retries a specific outbox item.
		 */
		retryOutboxItem: async (itemId: string) => HttpService.post<boolean>(`/integration/outbox/${itemId}/retry`, {}),

		/**
		 * Gets inbox items (received webhooks).
		 */
		getInboxItems: async (pageNumber = 1, pageSize = 20) =>
			HttpService.get<PagedIntegrationResult<unknown>>(
				`/integration/inbox?pageNumber=${pageNumber}&pageSize=${pageSize}`
			),
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

/**
 * Role thresholds response from GET /api/rbac/roles/thresholds
 *
 * WHITE-LABEL: All thresholds are configurable via appsettings.json.
 * No code changes needed to customize role levels for different deployments.
 */
export interface RoleThresholdsResponse {
	/** Default level for customers (default: 1000) */
	customerLevel: number
	/** Minimum level for Fulfillment Coordinator (default: 2000) */
	fulfillmentCoordinatorThreshold: number
	/** Minimum level for Sales Rep (default: 3000) */
	salesRepThreshold: number
	/** Minimum level for Sales Manager (default: 4000) */
	salesManagerThreshold: number
	/** Minimum level for Admin (default: 5000) */
	adminThreshold: number
	/** Minimum level for Super Admin (default: 9999) */
	superAdminThreshold: number
}

/**
 * User permissions response from GET /api/rbac/my-permissions
 */
export interface UserPermissionsResponse {
	userId: number
	roleLevel: number
	roleName: string
	permissions: string[]
}

/**
 * Result of attempting to delete a role.
 * Follows AWS IAM DeleteConflict pattern - if users are assigned,
 * deletion is blocked and caller must migrate users first.
 *
 * @see https://docs.aws.amazon.com/IAM/latest/APIReference/API_DeleteRole.html
 */
export interface RoleDeleteResult {
	/** True if role was successfully deleted */
	deleted: boolean
	/** True if deletion was blocked due to assigned users */
	blockedByUsers: boolean
	/** Number of users currently assigned to this role level */
	assignedUserCount: number
	/** Human-readable status message */
	message?: string
}
