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
export {
	AUTH_COOKIE_NAME,
	AUTH_HEADER_PREFIX,
	DEFAULT_API_BASE_URL,
} from './httpService.constants'

// API Client
export { 
	default as API, 
	type RoleDistribution,
	type AdminCreateAccountRequest,
	type AdminCreateAccountResponse,
} from './api'

// Notification Service - Unified logging + toast system (FAANG-level)
export {
	notificationService,
	type NotificationType,
	type NotificationConfig,
	type NotificationOptions,
	type NotificationResult,
} from './notification.service'

// API Types - DTOs for backend contract alignment
export type {
	CreateQuoteRequest,
	QuoteItemRequest,
	CreateQuoteResponse,
	ApiResponse,
	PagedResponse,
} from './api.types'

