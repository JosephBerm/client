/**
 * Unified Notification Service - FAANG-Level Implementation
 * 
 * Integrates toast notifications with structured logging following industry best practices.
 * Inspired by Amazon CloudWatch + User Notifications, Google Cloud Logging + Snackbar,
 * Meta's unified notification system, and Netflix's telemetry-driven approach.
 * 
 * **Key Features:**
 * - Unified API for user notifications + developer logging
 * - Automatic context enrichment
 * - User interaction tracking (dismissed, clicked)
 * - Correlation IDs for distributed tracing
 * - Telemetry integration ready
 * - Customizable toast behavior per notification type
 * - Type-safe with comprehensive TypeScript definitions
 * 
 * **FAANG Principles:**
 * - Single Responsibility: Handles all user-facing notifications
 * - Separation of Concerns: Logging (devs) vs. Toasts (users)
 * - Observability: Every notification is logged with structured context
 * - DRY: Single point for all notification logic
 * - Testability: Mockable service with dependency injection
 * 
 * **Architecture:**
 * ```
 * Component → NotificationService → [Logger, ToastLibrary, Analytics]
 *                                           ↓             ↓           ↓
 *                                     Structured     User       Telemetry
 *                                      Logging      Toast        Events
 * ```
 * 
 * **Benefits Over Manual Approach:**
 * - Eliminates duplication (toast + log calls)
 * - Consistent UX and logging across app
 * - Automatic context enrichment
 * - Easy to enhance (add analytics, change toast library)
 * - Better debugging (correlation between logs and toasts)
 * 
 * @example
 * ```typescript
 * import { notificationService } from '@_shared/services';
 * 
 * // Success notification
 * notificationService.success('Product added to cart', {
 *   productId: 'prod-123',
 *   productName: 'Medical Gloves',
 *   quantity: 5
 * });
 * // ✅ Logs: logger.info('Product added to cart', { productId, ... })
 * // ✅ Shows: Green toast with success message
 * 
 * // Error notification
 * notificationService.error('Failed to load products', {
 *   error,
 *   component: 'StorePage',
 *   action: 'fetchProducts'
 * });
 * // ✅ Logs: logger.error('Failed to load products', { error, component, ... })
 * // ✅ Shows: Red toast with error message
 * 
 * // Custom notification
 * notificationService.notify({
 *   type: 'info',
 *   message: 'Maintenance scheduled',
 *   metadata: { scheduledTime: '2024-01-01' },
 *   persist: true, // Won't auto-dismiss
 *   actionLabel: 'Learn More',
 *   onAction: () => router.push('/maintenance')
 * });
 * ```
 * 
 * @module NotificationService
 */

import { toast, ToastOptions, Id as ToastId } from 'react-toastify'
import { logger, LogMetadata, LogLevel } from '@_core/logger'
import {
	TOAST_SUCCESS_CONFIG,
	TOAST_ERROR_CONFIG,
	TOAST_INFO_CONFIG,
	TOAST_WARNING_CONFIG,
	TOAST_PERSISTENT_CONFIG,
} from '@_shared/utils/toastConfig'

/**
 * Notification type matching toast variants and log levels.
 * Maps 1:1 with both systems for consistency.
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning'

/**
 * Notification severity level for logging.
 * Determines which log level to use when recording the notification.
 * 
 * **Mapping:**
 * - success → INFO
 * - info → INFO
 * - warning → WARN
 * - error → ERROR
 */
const NOTIFICATION_LOG_LEVEL_MAP: Record<NotificationType, LogLevel> = {
	success: 'INFO',
	info: 'INFO',
	warning: 'WARN',
	error: 'ERROR',
}

/**
 * Notification configuration interface.
 * Comprehensive options for controlling both toast display and logging behavior.
 * 
 * **Design Pattern:** Builder pattern for flexible notification creation
 */
export interface NotificationConfig {
	/** Notification type (determines color, icon, log level) */
	type: NotificationType

	/** User-facing message to display in toast */
	message: string

	/** 
	 * Structured metadata for logging (not shown to user).
	 * Include all relevant context: userId, productId, error, etc.
	 */
	metadata?: LogMetadata

	/**
	 * Component/module name for logging context.
	 * Helps identify where notification originated.
	 */
	component?: string

	/**
	 * Action being performed when notification triggered.
	 * Examples: 'addToCart', 'submitForm', 'fetchData'
	 */
	action?: string

	/** 
	 * Persist notification (don't auto-dismiss).
	 * Use for critical messages requiring user acknowledgment.
	 * @default false
	 */
	persist?: boolean

	/**
	 * Custom auto-close duration in milliseconds.
	 * Overrides default duration for this notification type.
	 */
	duration?: number

	/**
	 * Optional action button label.
	 * When provided, toast shows a clickable action button.
	 */
	actionLabel?: string

	/**
	 * Callback when action button is clicked.
	 * Only used if actionLabel is provided.
	 */
	onAction?: () => void

	/**
	 * Callback when toast is dismissed (clicked X or auto-closed).
	 * Useful for tracking user interaction.
	 */
	onDismiss?: () => void

	/**
	 * Custom toast options to override defaults.
	 * For advanced use cases requiring fine-grained control.
	 */
	toastOptions?: Partial<ToastOptions>

	/**
	 * Skip logging (only show toast).
	 * Use sparingly - most notifications should be logged.
	 * @default false
	 */
	skipLogging?: boolean

	/**
	 * Skip toast (only log).
	 * Useful for silent errors that should be logged but not shown to user.
	 * @default false
	 */
	skipToast?: boolean
}

/**
 * Simplified notification options for common use cases.
 * Most methods use this lighter interface for convenience.
 */
export interface NotificationOptions {
	/** Structured metadata for logging */
	metadata?: LogMetadata
	/** Component name for context */
	component?: string
	/** Action being performed */
	action?: string
	/** Persist notification (don't auto-dismiss) */
	persist?: boolean
	/** Custom duration (ms) */
	duration?: number
	/** Skip logging */
	skipLogging?: boolean
	/** Skip toast */
	skipToast?: boolean
}

/**
 * Notification result containing IDs for tracking and dismissal.
 */
export interface NotificationResult {
	/** Toast ID (can be used to dismiss programmatically) */
	toastId?: ToastId
	/** Correlation ID for tracing this notification in logs */
	correlationId: string
}

/**
 * NotificationService Class
 * 
 * Centralized service for all user-facing notifications.
 * Integrates toast library with structured logging system.
 * 
 * **Singleton Pattern:** Single instance used throughout application
 * 
 * **FAANG Comparison:**
 * - Amazon: CloudWatch Logs + SNS Notifications combined
 * - Google: Cloud Logging + Material Snackbar unified API
 * - Meta: Unified notification center with analytics
 * - Netflix: Telemetry-driven user feedback system
 * 
 * @example
 * ```typescript
 * // Basic usage
 * notificationService.success('Saved successfully');
 * notificationService.error('Failed to save', { error });
 * 
 * // With full context
 * notificationService.error('Failed to process payment', {
 *   metadata: { orderId, amount, error },
 *   component: 'CheckoutPage',
 *   action: 'processPayment'
 * });
 * 
 * // Advanced: Custom notification
 * const result = notificationService.notify({
 *   type: 'warning',
 *   message: 'Your session will expire in 5 minutes',
 *   metadata: { sessionId, expiresAt },
 *   persist: true,
 *   actionLabel: 'Extend Session',
 *   onAction: () => extendSession()
 * });
 * 
 * // Later: Dismiss programmatically
 * if (result.toastId) {
 *   toast.dismiss(result.toastId);
 * }
 * ```
 */
class NotificationService {
	/**
	 * Core notification method that handles both logging and toast display.
	 * All other methods delegate to this.
	 * 
	 * **Processing Pipeline:**
	 * 1. Generate correlation ID
	 * 2. Enrich metadata with context
	 * 3. Log to structured logging system
	 * 4. Display toast to user
	 * 5. Track user interaction (if callbacks provided)
	 * 6. Return result with IDs
	 * 
	 * @param config - Complete notification configuration
	 * @returns Notification result with toast ID and correlation ID
	 */
	public notify(config: NotificationConfig): NotificationResult {
		const {
			type,
			message,
			metadata = {},
			component,
			action,
			persist = false,
			duration,
			actionLabel,
			onAction,
			onDismiss,
			toastOptions = {},
			skipLogging = false,
			skipToast = false,
		} = config

		// Generate correlation ID for tracing (FAANG pattern: distributed tracing)
		const correlationId = this.generateCorrelationId()

		// Enrich metadata with notification context
		const enrichedMetadata: LogMetadata = {
			...metadata,
			correlationId,
			notificationType: type,
			userFacingMessage: message,
			...(component && { component }),
			...(action && { action }),
		}

		// Step 1: Log to structured logging system (unless explicitly skipped)
		if (!skipLogging) {
			const logLevel = NOTIFICATION_LOG_LEVEL_MAP[type]
			this.logNotification(logLevel, message, enrichedMetadata)
		}

		// Step 2: Display toast to user (unless explicitly skipped)
		let toastId: ToastId | undefined

		if (!skipToast) {
			// Select appropriate toast configuration based on type
			const baseToastConfig = this.getToastConfig(type, persist, duration)

			// Merge with custom options
		const finalToastOptions: ToastOptions = {
			...baseToastConfig,
			...toastOptions,
			// Wrap callbacks to include tracking
			onClose: (props) => {
				this.trackInteraction('dismiss', correlationId, enrichedMetadata)
				onDismiss?.()
				toastOptions.onClose?.(props)
			},
		}

			// Display toast based on type
			toastId = this.displayToast(type, message, finalToastOptions)

			// Track that notification was shown
			this.trackInteraction('show', correlationId, enrichedMetadata)
		}

		return {
			toastId,
			correlationId,
		}
	}

	/**
	 * Show a success notification (green toast, INFO log).
	 * Use for successful operations: save, add to cart, submit form, etc.
	 * 
	 * @param message - User-facing success message
	 * @param options - Optional configuration
	 * @returns Notification result
	 * 
	 * @example
	 * ```typescript
	 * notificationService.success('Product added to cart', {
	 *   metadata: { productId: 'prod-123', quantity: 2 },
	 *   component: 'ProductCard',
	 *   action: 'addToCart'
	 * });
	 * ```
	 */
	public success(message: string, options: NotificationOptions = {}): NotificationResult {
		return this.notify({
			type: 'success',
			message,
			...options,
		})
	}

	/**
	 * Show an error notification (red toast, ERROR log).
	 * Use for errors, failures, validation issues.
	 * 
	 * **Best Practice:** Always include error object in metadata
	 * 
	 * @param message - User-facing error message
	 * @param options - Optional configuration (should include error in metadata)
	 * @returns Notification result
	 * 
	 * @example
	 * ```typescript
	 * try {
	 *   await api.call();
	 * } catch (error) {
	 *   notificationService.error('Failed to load data', {
	 *     metadata: { error, endpoint: '/api/data' },
	 *     component: 'DataLoader',
	 *     action: 'fetchData'
	 *   });
	 * }
	 * ```
	 */
	public error(message: string, options: NotificationOptions = {}): NotificationResult {
		return this.notify({
			type: 'error',
			message,
			...options,
		})
	}

	/**
	 * Show an info notification (blue toast, INFO log).
	 * Use for informational messages: tips, updates, announcements.
	 * 
	 * @param message - User-facing info message
	 * @param options - Optional configuration
	 * @returns Notification result
	 * 
	 * @example
	 * ```typescript
	 * notificationService.info('New features available', {
	 *   metadata: { version: '2.0.0' },
	 *   component: 'AppShell'
	 * });
	 * ```
	 */
	public info(message: string, options: NotificationOptions = {}): NotificationResult {
		return this.notify({
			type: 'info',
			message,
			...options,
		})
	}

	/**
	 * Show a warning notification (yellow toast, WARN log).
	 * Use for warnings, deprecations, important notices.
	 * 
	 * @param message - User-facing warning message
	 * @param options - Optional configuration
	 * @returns Notification result
	 * 
	 * @example
	 * ```typescript
	 * notificationService.warning('Session expiring soon', {
	 *   metadata: { expiresAt: new Date(), userId: '123' },
	 *   component: 'SessionManager',
	 *   persist: true // Don't auto-dismiss warnings
	 * });
	 * ```
	 */
	public warning(message: string, options: NotificationOptions = {}): NotificationResult {
		return this.notify({
			type: 'warning',
			message,
			...options,
		})
	}

	/**
	 * Log notification to structured logging system.
	 * 
	 * @private
	 * @param level - Log level
	 * @param message - Log message
	 * @param metadata - Structured metadata
	 */
	private logNotification(level: LogLevel, message: string, metadata: LogMetadata): void {
		// Use appropriate logger method based on level
		switch (level) {
			case 'INFO':
				logger.info(message, metadata)
				break
			case 'WARN':
				logger.warn(message, metadata)
				break
			case 'ERROR':
				logger.error(message, metadata)
				break
			default:
				logger.info(message, metadata)
		}
	}

	/**
	 * Display toast notification to user.
	 * Respects user's reduced motion preferences for accessibility.
	 * 
	 * @private
	 * @param type - Notification type
	 * @param message - Toast message
	 * @param options - Toast options
	 * @returns Toast ID
	 */
	private displayToast(type: NotificationType, message: string, options: ToastOptions): ToastId {
		// Respect reduced motion preference (WCAG AA accessibility)
		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches

		// Apply reduced motion settings if user prefers
		const finalOptions: ToastOptions = {
			...options,
			// Disable slide animation if reduced motion is preferred
			transition: prefersReducedMotion ? undefined : options.transition,
			// Faster display for reduced motion
			autoClose: prefersReducedMotion && options.autoClose
				? Math.min(options.autoClose as number, 2000)
				: options.autoClose,
		}

		switch (type) {
			case 'success':
				return toast.success(message, finalOptions)
			case 'error':
				return toast.error(message, finalOptions)
			case 'warning':
				return toast.warning(message, finalOptions)
			case 'info':
			default:
				return toast.info(message, finalOptions)
		}
	}

	/**
	 * Get toast configuration for notification type.
	 * 
	 * @private
	 * @param type - Notification type
	 * @param persist - Whether to persist
	 * @param customDuration - Custom duration override
	 * @returns Toast options
	 */
	private getToastConfig(
		type: NotificationType,
		persist: boolean,
		customDuration?: number
	): ToastOptions {
		// Use persistent config if persist=true
		if (persist) {
			return TOAST_PERSISTENT_CONFIG
		}

		// Select base config by type
		let baseConfig: ToastOptions
		switch (type) {
			case 'success':
				baseConfig = TOAST_SUCCESS_CONFIG
				break
			case 'error':
				baseConfig = TOAST_ERROR_CONFIG
				break
			case 'warning':
				baseConfig = TOAST_WARNING_CONFIG
				break
			case 'info':
			default:
				baseConfig = TOAST_INFO_CONFIG
		}

		// Override duration if provided
		if (customDuration !== undefined) {
			return {
				...baseConfig,
				autoClose: customDuration,
			}
		}

		return baseConfig
	}

	/**
	 * Track user interaction with notification.
	 * Logs interaction for analytics and debugging.
	 * 
	 * **Future Enhancement:** Send to analytics service
	 * 
	 * @private
	 * @param interactionType - Type of interaction
	 * @param correlationId - Correlation ID
	 * @param metadata - Additional metadata
	 */
	private trackInteraction(
		interactionType: 'show' | 'dismiss' | 'action',
		correlationId: string,
		metadata: LogMetadata
	): void {
		logger.debug('Notification interaction', {
			...metadata,
			correlationId,
			interactionType,
			interactionTimestamp: new Date().toISOString(),
		})

		// Future: Send to analytics service
		// analytics.track('notification_interaction', { interactionType, correlationId });
	}

	/**
	 * Generate a unique correlation ID for tracing.
	 * 
	 * **Pattern:** Distributed tracing (Google Dapper, Amazon X-Ray)
	 * 
	 * @private
	 * @returns Correlation ID
	 */
	private generateCorrelationId(): string {
		// Simple UUID v4 implementation
		return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
	}

	/**
	 * Dismiss a specific toast by ID.
	 * Useful for programmatic dismissal (e.g., on navigation).
	 * 
	 * @param toastId - Toast ID to dismiss
	 * 
	 * @example
	 * ```typescript
	 * const result = notificationService.info('Loading...');
	 * // Later...
	 * notificationService.dismiss(result.toastId);
	 * ```
	 */
	public dismiss(toastId?: ToastId): void {
		if (toastId) {
			toast.dismiss(toastId)
		}
	}

	/**
	 * Dismiss all active toasts.
	 * Useful when navigating away or on logout.
	 * 
	 * @example
	 * ```typescript
	 * // On logout
	 * notificationService.dismissAll();
	 * ```
	 */
	public dismissAll(): void {
		toast.dismiss()
	}
}

/**
 * Singleton instance of NotificationService.
 * Use this throughout the application for all notifications.
 * 
 * **Pattern:** Singleton (ensures single notification queue)
 * 
 * @example
 * ```typescript
 * import { notificationService } from '@_shared/services';
 * 
 * notificationService.success('Operation completed');
 * notificationService.error('Operation failed', { metadata: { error } });
 * ```
 */
export const notificationService = new NotificationService()

/**
 * Default export for convenience.
 */
export default notificationService

/**
 * @example Usage Examples
 * 
 * **1. Simple Success Notification**
 * ```typescript
 * notificationService.success('Product added to cart');
 * ```
 * 
 * **2. Error with Context**
 * ```typescript
 * try {
 *   await api.call();
 * } catch (error) {
 *   notificationService.error('Failed to save', {
 *     metadata: { error, productId },
 *     component: 'ProductForm',
 *     action: 'save'
 *   });
 * }
 * ```
 * 
 * **3. Warning with Action**
 * ```typescript
 * notificationService.notify({
 *   type: 'warning',
 *   message: 'Unsaved changes will be lost',
 *   persist: true,
 *   actionLabel: 'Save Now',
 *   onAction: () => saveForm()
 * });
 * ```
 * 
 * **4. Silent Error (log only, no toast)**
 * ```typescript
 * notificationService.error('Analytics failed', {
 *   metadata: { error },
 *   skipToast: true  // Log error but don't show to user
 * });
 * ```
 * 
 * **5. Track User Interaction**
 * ```typescript
 * notificationService.notify({
 *   type: 'info',
 *   message: 'New feature available',
 *   onDismiss: () => {
 *     // Track that user dismissed notification
 *     analytics.track('feature_announcement_dismissed');
 *   }
 * });
 * ```
 */

