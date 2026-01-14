/**
 * Notifications API Module
 *
 * User notifications and alerts management.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/notifications
 */

import type Notification from '@_classes/Notification'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

import { HttpService } from '../httpService'

// =========================================================================
// NOTIFICATIONS API
// =========================================================================

/**
 * Notification Management API
 * User notifications and alerts.
 */
export const NotificationsApi = {
	/**
	 * Gets a single notification by ID.
	 */
	get: async (id: string) => HttpService.get<Notification>(`/notifications/${id}`),

	/**
	 * Creates a new notification.
	 */
	create: async (notification: Partial<Notification>) => HttpService.post<boolean>('/notifications', notification),

	/**
	 * Deletes a notification.
	 */
	delete: async (id: string) => HttpService.delete<boolean>(`/notifications/${id}`),

	/**
	 * Rich search for notifications with filtering, sorting, pagination.
	 */
	richSearch: async (filter: RichSearchFilter) =>
		HttpService.post<RichPagedResult<Notification>>('/notifications/search/rich', filter),

	/**
	 * Mark a single notification as read.
	 */
	markAsRead: async (id: string) => HttpService.put<boolean>(`/notifications/${id}/read`, {}),

	/**
	 * Mark all notifications as read for current user.
	 */
	markAllAsRead: async () => HttpService.put<number>('/notifications/read-all', {}),
}
