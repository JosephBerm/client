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

