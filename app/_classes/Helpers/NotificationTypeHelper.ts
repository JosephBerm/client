/**
 * NotificationTypeHelper - FAANG-Level Enum Helper
 * 
 * Centralized metadata and helper functions for NotificationType enum.
 * Used for user notifications, alerts, and toast messages.
 * 
 * **Pattern:** Exhaustive metadata mapping (Google/Netflix/Stripe standard)
 * 
 * **Features:**
 * - Display names for UI
 * - Badge/alert variants for styling
 * - Icons for visual feedback
 * - Priority levels for sorting/filtering
 * - Descriptions for accessibility
 * 
 * @example
 * ```typescript
 * import NotificationTypeHelper from '@_classes/Helpers/NotificationTypeHelper'
 * import { NotificationType } from '@_classes/Enums'
 * 
 * // Get display name
 * const name = NotificationTypeHelper.getDisplay(NotificationType.Warning)
 * // → "Warning"
 * 
 * // Get badge variant
 * const variant = NotificationTypeHelper.getVariant(NotificationType.Error)
 * // → "error"
 * 
 * // Render notification
 * <Alert variant={NotificationTypeHelper.getVariant(notification.type)}>
 *   {NotificationTypeHelper.getIcon(notification.type)}
 *   {notification.message}
 * </Alert>
 * 
 * // Sort by priority
 * const sorted = NotificationTypeHelper.sortByPriority(notifications)
 * // → Errors first, then warnings, then info
 * ```
 * 
 * @module Helpers/NotificationTypeHelper
 */

import { NotificationType } from '../Enums'

/**
 * Badge/alert variant for UI styling
 */
export type NotificationVariant = 'success' | 'error' | 'warning' | 'info'

/**
 * Priority level for sorting and filtering
 * Higher number = higher priority
 */
export type NotificationPriority = 1 | 2 | 3

/**
 * Complete metadata for a NotificationType enum value
 */
export interface NotificationTypeMetadata {
	/** Enum value */
	value: NotificationType
	/** Human-readable display name */
	display: string
	/** Badge/alert variant for UI */
	variant: NotificationVariant
	/** Description for accessibility/tooltips */
	description: string
	/** Priority level (3 = highest, 1 = lowest) */
	priority: NotificationPriority
	/** Icon name (for future icon integration) */
	iconName: string
	/** ARIA role for accessibility */
	ariaRole: 'alert' | 'status'
}

/**
 * Exhaustive metadata map for NotificationType enum
 * 
 * TypeScript enforces: If you add a new NotificationType, you MUST add metadata here.
 */
const NOTIFICATION_TYPE_METADATA_MAP: Record<NotificationType, NotificationTypeMetadata> = {
	[NotificationType.Info]: {
		value: NotificationType.Info,
		display: 'Information',
		variant: 'info',
		description: 'General informational message',
		priority: 1, // Lowest priority
		iconName: 'InfoIcon',
		ariaRole: 'status',
	},
	[NotificationType.Warning]: {
		value: NotificationType.Warning,
		display: 'Warning',
		variant: 'warning',
		description: 'Warning message requiring attention',
		priority: 2, // Medium priority
		iconName: 'WarningIcon',
		ariaRole: 'alert',
	},
	[NotificationType.Error]: {
		value: NotificationType.Error,
		display: 'Error',
		variant: 'error',
		description: 'Error or failure notification',
		priority: 3, // Highest priority
		iconName: 'ErrorIcon',
		ariaRole: 'alert',
	},
}

/**
 * NotificationTypeHelper - Static helper class
 * 
 * Provides type-safe access to NotificationType metadata.
 */
export default class NotificationTypeHelper {
	/**
	 * Array of all NotificationType metadata
	 * 
	 * @example
	 * ```typescript
	 * // Iterate all types
	 * NotificationTypeHelper.toList.forEach(meta => {
	 *   console.log(`${meta.display}: ${meta.description}`)
	 * })
	 * ```
	 */
	static readonly toList: NotificationTypeMetadata[] = Object.values(NOTIFICATION_TYPE_METADATA_MAP)

	/**
	 * Get display name for a notification type
	 * 
	 * @param type - NotificationType enum value
	 * @returns Display name string
	 * 
	 * @example
	 * ```typescript
	 * NotificationTypeHelper.getDisplay(NotificationType.Warning)
	 * // → "Warning"
	 * ```
	 */
	static getDisplay(type: NotificationType): string {
		return NOTIFICATION_TYPE_METADATA_MAP[type]?.display || 'Unknown'
	}

	/**
	 * Get badge/alert variant for UI styling
	 * 
	 * @param type - NotificationType enum value
	 * @returns Variant string
	 * 
	 * @example
	 * ```typescript
	 * const variant = NotificationTypeHelper.getVariant(NotificationType.Error)
	 * // → "error"
	 * 
	 * <Badge variant={variant}>{message}</Badge>
	 * ```
	 */
	static getVariant(type: NotificationType): NotificationVariant {
		return NOTIFICATION_TYPE_METADATA_MAP[type]?.variant || 'info'
	}

	/**
	 * Get description for a notification type
	 * 
	 * @param type - NotificationType enum value
	 * @returns Description string
	 * 
	 * @example
	 * ```typescript
	 * const desc = NotificationTypeHelper.getDescription(NotificationType.Warning)
	 * // → "Warning message requiring attention"
	 * ```
	 */
	static getDescription(type: NotificationType): string {
		return NOTIFICATION_TYPE_METADATA_MAP[type]?.description || 'No description available'
	}

	/**
	 * Get full metadata for a notification type
	 * 
	 * @param type - NotificationType enum value
	 * @returns Complete metadata object
	 * 
	 * @example
	 * ```typescript
	 * const meta = NotificationTypeHelper.getMetadata(NotificationType.Error)
	 * console.log(meta.priority)   // 3
	 * console.log(meta.iconName)   // "ErrorIcon"
	 * console.log(meta.ariaRole)   // "alert"
	 * ```
	 */
	static getMetadata(type: NotificationType): NotificationTypeMetadata {
		return NOTIFICATION_TYPE_METADATA_MAP[type]
	}

	/**
	 * Get priority level for a notification type
	 * 
	 * @param type - NotificationType enum value
	 * @returns Priority level (1-3, higher = more important)
	 * 
	 * @example
	 * ```typescript
	 * NotificationTypeHelper.getPriority(NotificationType.Error)   // 3
	 * NotificationTypeHelper.getPriority(NotificationType.Info)    // 1
	 * ```
	 */
	static getPriority(type: NotificationType): NotificationPriority {
		return NOTIFICATION_TYPE_METADATA_MAP[type]?.priority || 1
	}

	/**
	 * Get icon name for a notification type
	 * 
	 * @param type - NotificationType enum value
	 * @returns Icon name string
	 * 
	 * @example
	 * ```typescript
	 * const iconName = NotificationTypeHelper.getIconName(NotificationType.Warning)
	 * // → "WarningIcon"
	 * ```
	 */
	static getIconName(type: NotificationType): string {
		return NOTIFICATION_TYPE_METADATA_MAP[type]?.iconName || 'InfoIcon'
	}

	/**
	 * Get ARIA role for accessibility
	 * 
	 * @param type - NotificationType enum value
	 * @returns ARIA role ('alert' or 'status')
	 * 
	 * @example
	 * ```typescript
	 * const role = NotificationTypeHelper.getAriaRole(NotificationType.Error)
	 * // → "alert"
	 * 
	 * <div role={role}>{message}</div>
	 * ```
	 */
	static getAriaRole(type: NotificationType): 'alert' | 'status' {
		return NOTIFICATION_TYPE_METADATA_MAP[type]?.ariaRole || 'status'
	}

	/**
	 * Sort notification types by priority (high to low)
	 * 
	 * @param types - Array of NotificationType values
	 * @returns Sorted array (errors first, then warnings, then info)
	 * 
	 * @example
	 * ```typescript
	 * const types = [NotificationType.Info, NotificationType.Error, NotificationType.Warning]
	 * const sorted = NotificationTypeHelper.sortByPriority(types)
	 * // → [NotificationType.Error, NotificationType.Warning, NotificationType.Info]
	 * ```
	 */
	static sortByPriority(types: NotificationType[]): NotificationType[] {
		return [...types].sort((a, b) => {
			const priorityA = this.getPriority(a)
			const priorityB = this.getPriority(b)
			return priorityB - priorityA // High to low
		})
	}

	/**
	 * Filter notification types by priority level
	 * 
	 * @param priority - Priority level to filter by
	 * @returns Array of NotificationType values with that priority
	 * 
	 * @example
	 * ```typescript
	 * const highPriority = NotificationTypeHelper.getByPriority(3)
	 * // → [NotificationType.Error]
	 * ```
	 */
	static getByPriority(priority: NotificationPriority): NotificationType[] {
		return this.toList.filter((meta) => meta.priority === priority).map((meta) => meta.value)
	}

	/**
	 * Get all high-priority notification types (priority >= 2)
	 * 
	 * @returns Array of high-priority NotificationType values
	 * 
	 * @example
	 * ```typescript
	 * const highPriority = NotificationTypeHelper.getHighPriority()
	 * // → [NotificationType.Error, NotificationType.Warning]
	 * ```
	 */
	static getHighPriority(): NotificationType[] {
		return this.toList.filter((meta) => meta.priority >= 2).map((meta) => meta.value)
	}

	/**
	 * Check if notification type is high priority
	 * 
	 * @param type - NotificationType enum value
	 * @returns True if priority >= 2 (Warning or Error)
	 * 
	 * @example
	 * ```typescript
	 * NotificationTypeHelper.isHighPriority(NotificationType.Error)   // true
	 * NotificationTypeHelper.isHighPriority(NotificationType.Info)    // false
	 * ```
	 */
	static isHighPriority(type: NotificationType): boolean {
		return this.getPriority(type) >= 2
	}

	/**
	 * Check if a value is a valid NotificationType enum value
	 * 
	 * @param value - Value to check
	 * @returns True if valid NotificationType
	 * 
	 * @example
	 * ```typescript
	 * const type = getNotificationTypeFromAPI()
	 * 
	 * if (NotificationTypeHelper.isValid(type)) {
	 *   // TypeScript now knows type is NotificationType
	 *   const display = NotificationTypeHelper.getDisplay(type)
	 * }
	 * ```
	 */
	static isValid(value: unknown): value is NotificationType {
		if (typeof value !== 'number') {return false}
		return Object.values(NotificationType).includes(value as NotificationType)
	}
}

