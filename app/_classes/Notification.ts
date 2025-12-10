/**
 * Notification Entity Class
 * 
 * Represents user notifications in the MedSource Pro system.
 * Notifications inform users about system events, order updates, and important messages.
 * Supports different notification types (Info, Warning, Error, Success) with read status tracking.
 * 
 * **Features:**
 * - Notification message content
 * - Type classification (Info, Warning, Error, Success)
 * - Optional link URL for actions
 * - Read/unread status tracking
 * - Read timestamp
 * - User association
 * - Timestamp tracking (created, updated, read)
 * 
 * **Notification Types:**
 * - **Info**: General informational messages
 * - **Warning**: Important warnings requiring attention
 * - **Error**: Error notifications
 * - **Success**: Success confirmations
 * 
 * **Related Entities:**
 * - User: Notification recipient
 * 
 * @example
 * ```typescript
 * // Create an info notification
 * import { Routes } from '@_features/navigation';
 * const notification = new Notification({
 *   message: 'Your order #12345 has been shipped',
 *   type: NotificationType.Info,
 *   linkUrl: Routes.Orders.detail('12345'),
 *   userId: 123,
 *   read: false
 * });
 * 
 * // Success notification
 * const successNotif = new Notification({
 *   message: 'Payment processed successfully',
 *   type: NotificationType.Success,
 *   userId: 123
 * });
 * 
 * // Warning notification with link
 * const warningNotif = new Notification({
 *   message: 'Your quote #456 expires in 3 days',
 *   type: NotificationType.Warning,
 *   linkUrl: Routes.Quotes.detail('456'),
 *   userId: 123
 * });
 * 
 * // Mark notification as read
 * notification.read = true;
 * notification.readAt = new Date();
 * ```
 * 
 * @module Notification
 */

import { parseDateSafe, parseRequiredTimestamp } from '@_lib/dates'

import { NotificationType } from '@_classes/Enums'

/**
 * Notification Entity Class
 * 
 * Main notification entity representing user notifications in the system.
 * Handles notification content, type, read status, and user association.
 */
export default class Notification {
	/** Unique identifier (GUID, readonly, auto-generated) */
	public readonly id: string = ''
	
	/** Notification message content */
	public message: string = ''
	
	/** Notification type (Info, Warning, Error, Success) */
	public type: NotificationType = NotificationType.Info
	
	/** Optional URL to navigate when notification is clicked */
	public linkUrl?: string = ''
	
	/** Whether notification has been read by user */
	public read: boolean = false
	
	/** Timestamp when notification was read (null if unread) */
	public readAt?: Date | null = null
	
	/** Notification creation timestamp */
	public createdAt: Date = new Date()
	
	/** Last update timestamp */
	public updatedAt?: Date | null = null
	
	/** User ID of notification recipient */
	public userId: number = 0

	/**
	 * Creates a new Notification instance.
	 * Parses date strings to Date objects for timestamps.
	 * 
	 * @param {Partial<Notification>} param - Partial notification data to initialize
	 * 
	 * @example
	 * ```typescript
	 * // Basic info notification
	 * const notif = new Notification({
	 *   message: 'New product available in catalog',
	 *   type: NotificationType.Info,
	 *   userId: 123
	 * });
	 * 
	 * // Notification with link and read status
	 * import { Routes } from '@_features/navigation';
	 * const notif2 = new Notification({
	 *   message: 'Order #789 requires your approval',
	 *   type: NotificationType.Warning,
	 *   linkUrl: Routes.Orders.detail('789'),
	 *   userId: 123,
	 *   read: false
	 * });
	 * 
	 * // Error notification
	 * const errorNotif = new Notification({
	 *   message: 'Payment failed for order #999',
	 *   type: NotificationType.Error,
	 *   linkUrl: Routes.Orders.detail('999'),
	 *   userId: 123
	 * });
	 * 
	 * // Success notification
	 * const successNotif = new Notification({
	 *   message: 'Profile updated successfully',
	 *   type: NotificationType.Success,
	 *   userId: 123,
	 *   read: true,
	 *   readAt: new Date()
	 * });
	 * ```
	 */
	constructor(param?: Partial<Notification>) {
		if (param) {
			Object.assign(this, param)
			
			// Parse read timestamp from string if needed (optional - null until read)
			if (param.readAt) {
				this.readAt = parseDateSafe(param.readAt)
			}
			
			// Parse creation timestamp from string if needed (required timestamp - always validate)
			this.createdAt = parseRequiredTimestamp(param.createdAt, 'Notification', 'createdAt')
			
			// Parse update timestamp from string if needed (optional - null until updated)
			if (param.updatedAt !== undefined) {
				this.updatedAt = parseDateSafe(param.updatedAt)
			}
		}
	}
}
