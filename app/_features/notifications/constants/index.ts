/**
 * Notification Feature Constants
 * @module notifications/constants
 *
 * NOTE: For notification TYPE configuration (Info, Warning, Error),
 * use NotificationTypeHelper from @_classes/Helpers instead.
 * This module only contains STATUS configuration (all, read, unread).
 */

import type { NotificationStatusConfig, NotificationStatusKey } from '../types'

/**
 * Status display configuration for filtering
 */
export const NOTIFICATION_STATUS_CONFIG: Record<NotificationStatusKey, NotificationStatusConfig> = {
	all: { label: 'All', variant: 'neutral', icon: 'Bell' },
	read: { label: 'Read', variant: 'success', icon: 'CheckCircle' },
	unread: { label: 'Unread', variant: 'warning', icon: 'Clock' },
}

/**
 * Get status config with fallback
 */
export function getNotificationStatusConfig(status: NotificationStatusKey): NotificationStatusConfig {
	return NOTIFICATION_STATUS_CONFIG[status] ?? NOTIFICATION_STATUS_CONFIG.all
}
