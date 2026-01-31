/**
 * Shared Services - Barrel Export
 *
 * Core services used across multiple features.
 *
 * @module shared/services
 */

// HTTP Service and Types
export { HttpService, type ApiResponse, type AxiosResponse } from './httpService'

// HTTP Service Constants (public-facing)
// Internal constants (HTTP_STATUS, CONTENT_TYPE, etc.) are intentionally not exported
export { AUTH_COOKIE_NAME, AUTH_HEADER_PREFIX, DEFAULT_API_BASE_URL } from './httpService.constants'

// API Client - Domain-Specific Modules
// Note: './api' resolves to './api/index.ts' (the barrel export)
export {
	default as API,
	// Domain-specific APIs for direct imports (better tree-shaking)
	AccountsApi,
	MfaApi,
	StoreApi,
	ProductsApi,
	QuotesApi,
	OrdersApi,
	CustomersApi,
	ProvidersApi,
	NotificationsApi,
	DashboardApi,
	AnalyticsApi,
	FinanceApi,
	PaymentsApi,
	PaymentMethodsApi,
	CustomerSettingsApi,
	ShippingApi,
	InventoryApi,
	ProductImportExportApi,
	RBACApi,
	RolesApi,
	PermissionsApi,
	PricingApi,
	IntegrationsApi,
	SecurityPolicyApi,
	PublicApi,
	// Types - Accounts
	type RoleDistribution,
	type AdminCreateAccountRequest,
	type AdminCreateAccountResponse,
	type ChangeAccountStatusRequest,
	type StatusChangeResult,
	// Types - RBAC (canonical source: @_types/rbac, re-exported via api)
	type Role,
	type PermissionEntity,
	type Permission, // @deprecated alias for PermissionEntity
	type RolePermission,
	type RoleThresholds,
	type CreateRoleRequest,
	type UpdateRoleRequest,
	type CreatePermissionRequest,
	type UpdatePermissionRequest,
	type UserPermissionsResponse,
	type RoleDeleteResult,
	// Types - Pricing
	type CartProductResponse,
	type PriceOverrideHistoryEntry,
} from './api'

// Notification Service - Unified logging + toast system (FAANG-level)
export {
	notificationService,
	type NotificationType,
	type NotificationConfig,
	type NotificationOptions,
	type NotificationResult,
} from './notification.service'

// Realtime Socket Service
export { realtimeSocketService } from './realtime/realtimeSocketService'
export type {
	RealtimeEventBase,
	QuoteCreatedEvent,
	QuoteStatusChangedEvent,
	OrderCreatedEvent,
	OrderStatusChangedEvent,
	PaymentConfirmedEvent,
	ImportProgressEvent,
	ErpSyncProgressEvent,
	NotificationCreatedEvent,
	InventoryAlertEvent,
	ShippingStatusChangedEvent,
	AnalyticsKpiUpdatedEvent,
	AnalyticsRevenueUpdatedEvent,
} from './realtime/realtimeEventTypes'

// Account Status Handler - Forced logout for suspended/locked/archived accounts
export {
	subscribeToAccountStatusErrors,
	clearAuthState,
	getLoginUrl,
	type AccountStatusCode,
	type AccountStatusError,
} from './accountStatusHandler'

// API Types - DTOs for backend contract alignment
// Note: ApiResponse is exported from httpService above, not re-exported from api.types
export type { CreateQuoteRequest, QuoteItemRequest, CreateQuoteResponse, PagedResponse } from './api.types'
