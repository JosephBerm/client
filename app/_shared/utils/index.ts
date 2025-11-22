/**
 * Shared Utils - Barrel Export
 * 
 * Utility functions used across multiple features.
 * 
 * **Note:** toastConfig is exported for internal use by notification.service.ts only.
 * External consumers should use notificationService directly.
 * 
 * @module shared/utils
 */

export * from './table-helpers'
export * from './scrollUtils'
export * from './businessHours'
export * from './analytics'

// Internal implementation detail - used by notification.service.ts
// Do not import directly; use notificationService instead
export * from './toastConfig'

