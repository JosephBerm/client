/**
 * Shared Utils - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Utility functions used across multiple features.
 * Pure functions - no React dependencies, server + client safe.
 * 
 * **Note:** toastConfig is exported for internal use by notification.service.ts only.
 * External consumers should use notificationService directly.
 * 
 * @module shared/utils
 */

// Table Helpers
export {
	convertSortingToApi,
	createServerTableFetcher,
	formatDate,
	formatCurrency,
	truncate,
} from './table-helpers'

// Scroll Utilities
export {
	scrollToElement,
	getCSSVariable,
	prefersReducedMotion,
	calculateScrollOffset,
	getElementPosition,
} from './scrollUtils'

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
} from './businessHours'

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
} from './analytics'

// Toast Config (internal implementation detail)
export {
	TOAST_SUCCESS_CONFIG,
	TOAST_ERROR_CONFIG,
	TOAST_INFO_CONFIG,
	TOAST_WARNING_CONFIG,
	TOAST_PERSISTENT_CONFIG,
} from './toastConfig'

// Error Message Translation
export {
	ERROR_MESSAGES,
	translateError,
	tryTranslateError,
	hasTranslation,
	getAvailableErrorKeys,
} from './errorMessages'

// User Helpers
export {
	filterUsersByRole,
	sortUsersByRoleAndName,
	transformUsersToSelectOptions,
	getUserDisplayName,
} from './userHelpers'

