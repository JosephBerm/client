/**
 * Notifications Feature Module
 *
 * Provides components, hooks, utils, constants, and types for notification management.
 * Migrated to RichDataGrid pattern for enterprise-grade functionality.
 *
 * **Components:**
 * - NotificationStatsGrid: Aggregate stats with filter cards
 *
 * **Hooks:**
 * - useNotificationsPage: Page state, actions, and RichDataGrid fetcher
 *
 * **Utils:**
 * - createNotificationRichColumns: RichDataGrid column factory
 *
 * **Constants:**
 * - NOTIFICATION_STATUS_CONFIG: Status display configuration (all/read/unread)
 *
 * **NOTE:** For notification TYPE metadata (Info, Warning, Error),
 * use NotificationTypeHelper from @_classes/Helpers instead.
 *
 * @module notifications
 */

// Components
export { NotificationStatsGrid } from './components'

// Hooks
export { useNotificationsPage } from './hooks'

// Utils
export { createNotificationRichColumns } from './utils'

// Constants
export {
	NOTIFICATION_STATUS_CONFIG,
	getNotificationStatusConfig,
} from './constants'

// Types
export type {
	NotificationStats,
	NotificationStatusKey,
	NotificationStatusConfig,
} from './types'
