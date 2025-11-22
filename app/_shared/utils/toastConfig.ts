/**
 * Toast Notification Configuration Constants
 * 
 * **INTERNAL MODULE** - Used by notification.service.ts only.
 * External consumers should import and use `notificationService` directly.
 * 
 * Centralized toast configuration following DRY principles.
 * Eliminates duplication of toast options across components.
 * 
 * **FAANG Best Practice:**
 * - Configuration files are implementation details, not public APIs
 * - Type-only import of react-toastify (zero runtime cost)
 * - Single source of truth for toast configurations
 * - Type-safe with TypeScript
 * - Consistent UX across application
 * 
 * @internal
 * @module toastConfig
 */

import { ToastOptions } from 'react-toastify'

/**
 * Base toast configuration shared across all toast types.
 * 
 * **Configuration:**
 * - position: top-right (industry standard)
 * - hideProgressBar: false (shows time remaining)
 * - closeOnClick: true (dismissible by clicking)
 * - pauseOnHover: true (pause timer when hovering)
 * - draggable: true (can drag to dismiss)
 */
const BASE_TOAST_CONFIG: ToastOptions = {
	position: 'top-right',
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
}

/**
 * Success toast configuration (green, 3 seconds).
 * Use for successful operations like adding to cart, saving data.
 */
export const TOAST_SUCCESS_CONFIG: ToastOptions = {
	...BASE_TOAST_CONFIG,
	autoClose: 3000, // 3 seconds
}

/**
 * Error toast configuration (red, 5 seconds).
 * Use for errors, failures, or validation issues.
 * Longer duration gives users time to read error messages.
 */
export const TOAST_ERROR_CONFIG: ToastOptions = {
	...BASE_TOAST_CONFIG,
	autoClose: 5000, // 5 seconds
}

/**
 * Info toast configuration (blue, 4 seconds).
 * Use for informational messages.
 */
export const TOAST_INFO_CONFIG: ToastOptions = {
	...BASE_TOAST_CONFIG,
	autoClose: 4000, // 4 seconds
}

/**
 * Warning toast configuration (yellow/orange, 5 seconds).
 * Use for warnings or important notices.
 */
export const TOAST_WARNING_CONFIG: ToastOptions = {
	...BASE_TOAST_CONFIG,
	autoClose: 5000, // 5 seconds
}

/**
 * Persistent toast configuration (does not auto-close).
 * Use for critical messages that require user acknowledgment.
 */
export const TOAST_PERSISTENT_CONFIG: ToastOptions = {
	...BASE_TOAST_CONFIG,
	autoClose: false, // Must be manually dismissed
}

