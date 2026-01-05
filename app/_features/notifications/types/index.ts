/**
 * Notification Feature Types
 * @module notifications/types
 *
 * NOTE: For notification TYPE metadata (Info, Warning, Error),
 * use NotificationTypeHelper from @_classes/Helpers instead.
 */

/**
 * Notification status for filtering
 */
export type NotificationStatusKey = 'all' | 'read' | 'unread'

/**
 * Aggregate notification statistics
 */
export interface NotificationStats {
	totalNotifications: number
	unreadCount: number
	readCount: number
	infoCount: number
	warningCount: number
	errorCount: number
}

/**
 * Notification status display configuration
 */
export interface NotificationStatusConfig {
	label: string
	variant: 'success' | 'warning' | 'neutral'
	icon: string
}
