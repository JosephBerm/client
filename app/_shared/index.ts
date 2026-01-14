/**
 * Shared Module - Main Exports (Optimized for Tree-Shaking)
 *
 * Cross-feature utilities, hooks, and services used by 3+ features.
 *
 * **Architecture:**
 * - Pure Utilities: Server + Client safe (no directives needed)
 * - Services: Client-only (all have 'use client' directive)
 * - Hooks: Client-only (all have 'use client' directive)
 *
 * **Usage Guidelines:**
 * - ✅ Client Components: All exports available
 * - ⚠️  Server Components: Only import utilities (formatters, businessHours, etc.)
 * - 🚫 Never import hooks/services in Server Components without 'use client'
 *
 * **Tree-Shaking:**
 * Named exports enable optimal tree-shaking with Turbopack.
 * Only imported exports are bundled.
 *
 * @example
 * ```typescript
 * // Client Component
 * 'use client'
 * import { useDebounce, API, notificationService } from '@_shared'
 *
 * // Server Component (utilities only)
 * import { formatDate, formatCurrency } from '@_shared'
 * ```
 *
 * @module shared
 */

// ============================================================================
// PURE UTILITIES (Server + Client Safe)
// ============================================================================

// Re-export commonly used lib utilities for convenience
export { formatDate, formatCurrency } from '@_lib'

// Table Helpers
export { createServerTableFetcher } from './utils/table-helpers'

// Scroll Utilities
export { scrollToElement, scrollToTop } from './utils/scrollUtils'

// Business Hours
export {
	isBusinessOpen,
	formatTime,
	getBusinessHoursForDay,
	getNextOpeningTime,
	getAllBusinessHours,
	getGroupedBusinessHours,
	DEFAULT_BUSINESS_HOURS,
	type DayOfWeek,
	type TimeSlot,
	type BusinessHoursConfig,
} from './utils/businessHours'

// Analytics
export {
	trackEvent,
	trackContactCTA,
	trackPhoneClick,
	trackEmailClick,
	trackFormSubmission,
	trackFormField,
	trackPageView,
	trackScrollDepth,
	EventCategory,
	type EventMetadata,
} from './utils/analytics'

// Toast Config (internal - used by notificationService)
export {
	TOAST_SUCCESS_CONFIG,
	TOAST_ERROR_CONFIG,
	TOAST_INFO_CONFIG,
	TOAST_WARNING_CONFIG,
	TOAST_PERSISTENT_CONFIG,
} from './utils/toastConfig'

// Error Message Translation (for user feedback)
export { ERROR_MESSAGES, translateError, tryTranslateError, hasTranslation } from './utils/errorMessages'

// User Helpers
export {
	filterUsersByRole,
	sortUsersByRoleAndName,
	transformUsersToSelectOptions,
	getUserDisplayName,
} from './utils/userHelpers'

// Category Utilities
export { flattenCategories, formatCategoryLabel, type FlattenedCategory } from './utils/categoryUtils'

// Password Strength Utilities
export {
	checkPasswordStrength,
	checkPasswordCriteria,
	isPasswordValid,
	getUnmetRequirements,
	PASSWORD_MIN_LENGTH,
	PASSWORD_STRONG_LENGTH,
	type PasswordStrengthResult,
	type PasswordCriteria,
} from './utils/passwordStrength'

// ============================================================================
// CLIENT SERVICES (All have 'use client' directive)
// ============================================================================

// HTTP Service and Types
export { HttpService, type ApiResponse, type AxiosResponse } from './services/httpService'

// HTTP Service Constants (public-facing only)
export { AUTH_COOKIE_NAME, AUTH_HEADER_PREFIX, DEFAULT_API_BASE_URL } from './services/httpService.constants'

// API Client - Domain-Specific Modules
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
	// Types - RBAC (canonical source: @_types/rbac, RoleThresholds exported from constants)
	type Role,
	type PermissionEntity,
	type Permission, // @deprecated alias for PermissionEntity
	type RolePermission,
	type CreateRoleRequest,
	type UpdateRoleRequest,
	type CreatePermissionRequest,
	type UpdatePermissionRequest,
	type UserPermissionsResponse,
	type RoleDeleteResult,
	// Types - Pricing
	type CartProductResponse,
	type PriceOverrideHistoryEntry,
} from './services/api'

// Notification Service
export {
	notificationService,
	type NotificationType,
	type NotificationConfig,
	type NotificationOptions,
	type NotificationResult,
} from './services/notification.service'

// Account Status Handler (forced logout for suspended/locked/archived accounts)
export {
	subscribeToAccountStatusErrors,
	clearAuthState,
	getLoginUrl,
	type AccountStatusCode,
	type AccountStatusError,
} from './services/accountStatusHandler'

// Step-Up Handler (MFA re-verification for sensitive actions)
export {
	subscribeToStepUpRequired,
	resolveStepUp,
	rejectStepUp,
	checkAndHandleStepUpRequired,
	hasPendingStepUp,
	waitForStepUpCompletion,
	initiateStepUp,
	type StepUpRequiredEvent,
} from './services/stepUpHandler'

// Step-Up Constants
export {
	STEP_UP_REQUIRED_HEADER,
	STEP_UP_ACTION_HEADER,
	STEP_UP_REASON_HEADER,
	STEP_UP_EVENT,
	SENSITIVE_ACTIONS,
	ACTION_MESSAGES,
	getActionMessage,
	STEP_UP_ERROR_MESSAGES,
	type SensitiveAction,
	type StepUpReason,
} from './services/stepUpHandler.constants'

// Token Service (MAANG-Level JWT Management)
export {
	storeTokens,
	clearTokens,
	getAccessToken,
	isTokenExpired,
	refreshAccessToken,
	ensureValidToken,
	startAutoRefresh,
	stopAutoRefresh,
	setupVisibilityRefresh,
	REFRESH_TOKEN_COOKIE,
	TOKEN_EXPIRY_COOKIE,
	type TokenPair,
} from './services/tokenService'

// API Types - DTOs for backend contract alignment
export type {
	CreateQuoteRequest,
	QuoteItemRequest,
	CreateQuoteResponse,
	PagedResponse,
	// Security Policy Types
	MfaRequirementLevel,
	SecurityPolicyResponse,
	UpdateSecurityPolicyRequest,
	PolicyTemplate,
	PolicyTemplatesResponse,
} from './services/api.types'

// ============================================================================
// CLIENT HOOKS (All have 'use client' directive)
// ============================================================================

// Basic Hooks
export { useDebounce } from './hooks/useDebounce'
export { useClickOutside, useEscapeKey } from './hooks/useClickOutside'
export { useMediaQuery } from './hooks/useMediaQuery'
export { useGridColumns } from './hooks/useGridColumns'
export { useModal } from './hooks/useModal'
export { usePopoverPosition } from './hooks/usePopoverPosition'
export type { PopoverPosition, UsePopoverPositionOptions } from './hooks/usePopoverPosition'

// Interaction Hooks
export { useFocusTrap } from './hooks/useFocusTrap'
export { useAccordion } from './hooks/useAccordion'
export { useElementRefs } from './hooks/useElementRefs'
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
export { useSidebarDrawer } from './hooks/useSidebarDrawer'
export type { UseSidebarDrawerOptions } from './hooks/useSidebarDrawer'
export type { UseKeyboardNavigationOptions, UseKeyboardNavigationReturn } from './hooks/useKeyboardNavigation'

// Scroll Hooks
export { useScrollSpy } from './hooks/useScrollSpy'
export type { UseScrollSpyOptions, UseScrollSpyReturn } from './hooks/useScrollSpy'
export { useScrollProgress } from './hooks/useScrollProgress'
export type { UseScrollProgressOptions, UseScrollProgressReturn } from './hooks/useScrollProgress'
export { useScrollReveal } from './hooks/useScrollReveal'
export type { UseScrollRevealOptions, UseScrollRevealReturn } from './hooks/useScrollReveal'
export { useSectionMetrics } from './hooks/useSectionMetrics'
export type { UseSectionMetricsOptions, UseSectionMetricsReturn, SectionMetric } from './hooks/useSectionMetrics'

// Observer Hooks
export { useSharedIntersectionObserver } from './hooks/useSharedIntersectionObserver'
export type { SharedObserverOptions, IntersectionCallback } from './hooks/useSharedIntersectionObserver'
export {
	useAdvancedLazyLoad,
	type ConnectionType,
	type EffectiveConnectionType,
	type LoadingStrategy,
	type UseAdvancedLazyLoadOptions,
	type UseAdvancedLazyLoadReturn,
} from './hooks/useAdvancedLazyLoad'

// Form Hooks
export { useZodForm } from './hooks/useZodForm'
export { useFormSubmit } from './hooks/useFormSubmit'

// Data Fetching Hooks (MAANG-Level Caching)
export {
	useFetchWithCache,
	prefetch,
	invalidateCache,
	getCacheStats,
	type FetchWithCacheOptions,
	type FetchWithCacheReturn,
} from './hooks/useFetchWithCache'

// Table Hooks
export { useServerTable } from './hooks/useServerTable'

// Navigation Hooks
export { useRouteParam, useRouteParams, useRouteParamValidated } from './hooks/useRouteParam'
export { useBreadcrumbs } from './hooks/useBreadcrumbs'

// Utility Hooks
export { useCopyToClipboard } from './hooks/useCopyToClipboard'

// RBAC Hooks
export { usePermissions, Resources, Actions, Contexts, type UsePermissionsReturn } from './hooks/usePermissions'

// ============================================================================
// CONSTANTS (Single Source of Truth)
// ============================================================================

// RBAC Constants - Export everything from the barrel
export {
	// Role level constants (use for role comparisons)
	RoleLevels,
	// Core constants
	DEFAULT_ROLE_THRESHOLDS,
	DEFAULT_ROLE_METADATA,
	// Cache configuration (centralized keys and TTL values)
	RBAC_QUERY_KEYS,
	RBAC_CACHE_CONFIG,
	// Display helpers
	getRoleDisplayName,
	getRoleBadgeVariant,
	getRoleSelectOptions,
	// Types
	type RoleLevelKey,
	type RoleLevelValue,
	type RoleThresholds,
	type RoleMetadataEntry,
	type RoleBadgeVariant,
	type RoleSelectOption,
} from './constants'
