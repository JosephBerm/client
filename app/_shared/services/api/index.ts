/**
 * API Module - Domain-Specific Barrel Export
 *
 * Central export point for all domain-specific API modules.
 * Each domain module is ~200-400 lines for optimal maintainability.
 *
 * **Architecture Pattern:**
 * - Domain-driven organization (Accounts, Store, Orders, etc.)
 * - Single Responsibility Principle (one domain per file)
 * - Facade Pattern (API object delegates to domain modules)
 * - Consistent naming (get, getAll, create, update, delete, search)
 *
 * **Industry Best Practices Applied:**
 * - AWS SDK v3: Service-specific clients
 * - Stripe: Domain modules (stripe.customers, stripe.payments)
 * - Google Cloud: One client per service
 * - Next.js: Feature-based code organization
 *
 * @example
 * ```typescript
 * import { API } from '@_shared'
 *
 * // Use the unified facade
 * const products = await API.Store.Products.getAllProducts()
 * const user = await API.Accounts.get('123')
 *
 * // Or import domain-specific modules for tree-shaking
 * import { AccountsApi } from '@_shared/services/api'
 * const user = await AccountsApi.get('123')
 * ```
 *
 * @module api
 */

// =========================================================================
// DOMAIN API EXPORTS
// =========================================================================

export { AccountsApi, MfaApi } from './accounts.api'
export type {
	RoleDistribution,
	AdminCreateAccountRequest,
	AdminCreateAccountResponse,
	ChangeAccountStatusRequest,
	StatusChangeResult,
} from './accounts.api'

export { StoreApi, ProductsApi } from './store.api'

export { QuotesApi } from './quotes.api'

export { OrdersApi } from './orders.api'

export { CustomersApi } from './customers.api'

export { ProvidersApi } from './providers.api'

export { NotificationsApi } from './notifications.api'

export { DashboardApi } from './dashboard.api'

export { AnalyticsApi } from './analytics.api'

export { FinanceApi } from './finance.api'

export { PaymentsApi, PaymentMethodsApi, CustomerSettingsApi } from './payments.api'

export { ShippingApi } from './shipping.api'

export { InventoryApi } from './inventory.api'

export { ProductImportExportApi } from './product-import-export.api'

export { RBACApi, RolesApi, PermissionsApi } from './rbac.api'
// RBAC types are re-exported from canonical source @_types/rbac via rbac.api.ts
export type {
	Role,
	PermissionEntity,
	Permission, // @deprecated - alias for PermissionEntity (backward compat)
	RolePermission,
	RoleThresholds,
	CreateRoleRequest,
	UpdateRoleRequest,
	CreatePermissionRequest,
	UpdatePermissionRequest,
	UserPermissionsResponse,
	RoleDeleteResult,
} from './rbac.api'

export { PricingApi } from './pricing.api'
export type { CartProductResponse, PriceOverrideHistoryEntry } from './pricing.api'

export { IntegrationsApi } from './integrations.api'

export { SecurityPolicyApi } from './security-policy.api'

export { PublicApi } from './public.api'

export { ExternalAuthApi } from './external-auth.api'
export type { ExternalProvider, ProvidersResponse, LinkedAccount } from './external-auth.api'

export { PhoneAuthApi } from './phone-auth.api'
export type {
	PhoneAuthAvailability,
	SendCodeResponse,
	VerifyCodeResponse,
	PhoneAuthAccountInfo,
} from './phone-auth.api'

// =========================================================================
// UNIFIED API FACADE
// =========================================================================

import { AccountsApi } from './accounts.api'
import { StoreApi } from './store.api'
import { QuotesApi } from './quotes.api'
import { OrdersApi } from './orders.api'
import { CustomersApi } from './customers.api'
import { ProvidersApi } from './providers.api'
import { NotificationsApi } from './notifications.api'
import { DashboardApi } from './dashboard.api'
import { AnalyticsApi } from './analytics.api'
import { FinanceApi } from './finance.api'
import { PaymentsApi } from './payments.api'
import { ShippingApi } from './shipping.api'
import { InventoryApi } from './inventory.api'
import { ProductImportExportApi } from './product-import-export.api'
import { RBACApi } from './rbac.api'
import { PricingApi } from './pricing.api'
import { IntegrationsApi } from './integrations.api'
import { SecurityPolicyApi } from './security-policy.api'
import { PublicApi } from './public.api'
import { ExternalAuthApi } from './external-auth.api'
import { PhoneAuthApi } from './phone-auth.api'

/**
 * Main API object with domain-organized endpoints.
 * Use AuthService for login/signup/logout operations.
 *
 * **This is the unified facade that maintains backward compatibility.**
 * All existing code using `API.Accounts.get()` will continue to work.
 *
 * @example
 * ```typescript
 * import { API } from '@_shared'
 *
 * // Get all products
 * const response = await API.Store.Products.getAllProducts()
 * const products = response.data.payload
 *
 * // Search users with pagination
 * const users = await API.Accounts.search({
 *   page: 1,
 *   pageSize: 10,
 *   sortBy: 'name',
 *   sortOrder: 'asc'
 * })
 *
 * // Create a new quote
 * const newQuote = await API.Quotes.create(quoteData)
 * ```
 */
export const API = {
	/** Account Management API */
	Accounts: AccountsApi,

	/** Security Policy Management API */
	SecurityPolicy: SecurityPolicyApi,

	/** Store Management API (Products) */
	Store: StoreApi,

	/** Quote Management API */
	Quotes: QuotesApi,

	/** Order Management API */
	Orders: OrdersApi,

	/** Notification Management API */
	Notifications: NotificationsApi,

	/** Provider/Supplier Management API */
	Providers: ProvidersApi,

	/** Public API Endpoints (no auth) */
	Public: PublicApi,

	/** Customer/Company Management API */
	Customers: CustomersApi,

	/** Dashboard API */
	Dashboard: DashboardApi,

	/** Finance and Analytics API */
	Finance: FinanceApi,

	/** Business Intelligence Analytics API */
	Analytics: AnalyticsApi,

	/** Payment Processing API */
	Payments: PaymentsApi,

	/** Shipping Integration API */
	Shipping: ShippingApi,

	/** Inventory Management API */
	Inventory: InventoryApi,

	/** Product Import/Export API */
	ProductImportExport: ProductImportExportApi,

	/** RBAC Management API */
	RBAC: RBACApi,

	/** Advanced Pricing Engine API */
	Pricing: PricingApi,

	/** ERP Integration API */
	Integrations: IntegrationsApi,

	/** External Authentication API (Social Login) */
	ExternalAuth: ExternalAuthApi,

	/** Phone Authentication API (Twilio) */
	PhoneAuth: PhoneAuthApi,
}

export default API
