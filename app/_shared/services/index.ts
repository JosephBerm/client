/**
 * Shared Services - Barrel Export
 * 
 * Core services used across multiple features.
 * 
 * @module shared/services
 */

export { HttpService } from './httpService'
export { default as API } from './api'

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

