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

// ============================================================================
// CLIENT SERVICES (All have 'use client' directive)
// ============================================================================

// HTTP Service
export { HttpService } from './services/httpService'

// API Client
export { default as API } from './services/api'

// API Types - DTOs for backend contract alignment
export type {
	CreateQuoteRequest,
	QuoteItemRequest,
	CreateQuoteResponse,
	ApiResponse,
	PagedResponse,
} from './services/api.types'

// Notification Service
export {
	notificationService,
	type NotificationType,
	type NotificationConfig,
	type NotificationOptions,
	type NotificationResult,
} from './services/notification.service'

// ============================================================================
// CLIENT HOOKS (All have 'use client' directive)
// ============================================================================

// Basic Hooks
export { useDebounce } from './hooks/useDebounce'
export { useMediaQuery } from './hooks/useMediaQuery'
export { useGridColumns } from './hooks/useGridColumns'
export { useModal } from './hooks/useModal'

// Interaction Hooks
export { useFocusTrap } from './hooks/useFocusTrap'
export { useAccordion } from './hooks/useAccordion'
export { useElementRefs } from './hooks/useElementRefs'
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation'
export type {
	UseKeyboardNavigationOptions,
	UseKeyboardNavigationReturn,
} from './hooks/useKeyboardNavigation'

// Scroll Hooks
export { useScrollSpy } from './hooks/useScrollSpy'
export type { UseScrollSpyOptions, UseScrollSpyReturn } from './hooks/useScrollSpy'
export { useScrollProgress } from './hooks/useScrollProgress'
export type { UseScrollProgressOptions, UseScrollProgressReturn } from './hooks/useScrollProgress'
export { useScrollReveal } from './hooks/useScrollReveal'
export type { UseScrollRevealOptions, UseScrollRevealReturn } from './hooks/useScrollReveal'
export { useSectionMetrics } from './hooks/useSectionMetrics'
export type {
	UseSectionMetricsOptions,
	UseSectionMetricsReturn,
	SectionMetric,
} from './hooks/useSectionMetrics'

// Observer Hooks
export { useSharedIntersectionObserver } from './hooks/useSharedIntersectionObserver'
export type {
	SharedObserverOptions,
	IntersectionCallback,
} from './hooks/useSharedIntersectionObserver'
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

// Table Hooks
export { useServerTable } from './hooks/useServerTable'

// Navigation Hooks
export { useRouteParam, useRouteParams, useRouteParamValidated } from './hooks/useRouteParam'
export { useBreadcrumbs } from './hooks/useBreadcrumbs'

// Utility Hooks
export { useCopyToClipboard } from './hooks/useCopyToClipboard'

