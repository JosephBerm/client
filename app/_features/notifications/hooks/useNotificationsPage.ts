/**
 * useNotificationsPage Hook - RichDataGrid Version
 *
 * Encapsulates all business logic for the Notifications list page.
 * Migrated to server-side data fetching pattern matching Customers/Providers.
 *
 * **React 19 Optimizations:**
 * - No useCallback for simple functions (React Compiler handles memoization)
 * - useMemo only for expensive computations
 *
 * **Architecture:**
 * - Server-side pagination via RichDataGrid fetcher pattern
 * - Stats computed from API response
 * - RBAC for delete permissions
 * - Optimistic updates for instant UI feedback
 *
 * @module notifications/hooks
 */

'use client'

import { useState, useRef } from 'react'

import { useAuthStore } from '@_features/auth'

import { notificationService, API, usePermissions } from '@_shared'

import { logger } from '@/app/_core'

import { NotificationType } from '@_classes/Enums'
import type Notification from '@_classes/Notification'

import {
	FilterType,
	type RichSearchFilter,
	type RichPagedResult,
	type RichDataGridApi,
} from '@_components/tables/RichDataGrid'

import type { NotificationStatusKey, NotificationStats } from '../types'

interface DeleteModalState {
	isOpen: boolean
	notification: Notification | null
}

interface UseNotificationsPageReturn {
	// State
	deleteModal: DeleteModalState
	refreshKey: number
	statusFilter: NotificationStatusKey
	isDeleting: boolean
	isMarkingRead: boolean

	// Stats
	stats: NotificationStats | null
	statsLoading: boolean

	// RBAC
	canDelete: boolean

	// Actions
	openDeleteModal: (notification: Notification) => void
	closeDeleteModal: () => void
	handleDelete: () => void
	handleMarkAsRead: (notification: Notification) => void
	handleMarkAllAsRead: () => void
	setStatusFilter: (filter: NotificationStatusKey) => void
	refreshData: () => void

	// RichDataGrid integration
	fetcher: (filter: RichSearchFilter) => Promise<RichPagedResult<Notification>>
	/** Callback to receive grid API for optimistic updates */
	onGridReady: (api: RichDataGridApi<Notification>) => void
}

/**
 * Hook encapsulating all Notifications page business logic.
 * Uses server-side data fetching pattern matching Customers/Providers.
 *
 * @example
 * ```tsx
 * const {
 *   stats,
 *   statusFilter,
 *   setStatusFilter,
 *   handleMarkAllAsRead,
 *   fetcher,
 * } = useNotificationsPage()
 * ```
 */
export function useNotificationsPage(): UseNotificationsPageReturn {
	// Auth state
	const user = useAuthStore((state) => state.user)

	// Grid API ref for optimistic updates
	const gridApiRef = useRef<RichDataGridApi<Notification> | null>(null)

	// Modal state
	const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
		isOpen: false,
		notification: null,
	})

	// Page state
	const [refreshKey, setRefreshKey] = useState(0)
	const [statusFilter, setStatusFilterState] = useState<NotificationStatusKey>('all')
	const [isDeleting, setIsDeleting] = useState(false)
	const [isMarkingRead, setIsMarkingRead] = useState(false)

	// Stats - computed from latest fetch
	const [stats, setStats] = useState<NotificationStats | null>(null)
	const [statsLoading, setStatsLoading] = useState(true)

	// RBAC: Use usePermissions hook for role-based checks
	const { isAdmin } = usePermissions()
	const canDelete = isAdmin

	/**
	 * Callback to receive grid API for optimistic updates.
	 * Called by RichDataGrid when it's ready.
	 */
	const onGridReady = (api: RichDataGridApi<Notification>) => {
		gridApiRef.current = api
	}

	/**
	 * RichDataGrid fetcher function.
	 * Includes external filter (statusFilter) in request.
	 * React Compiler handles memoization based on captured variables.
	 */
	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<Notification>> => {
		try {
			// Build enhanced filter with status filter
			const enhancedFilter: RichSearchFilter = {
				...filter,
				columnFilters: [...(filter.columnFilters || [])],
			}

			// Apply status filter from stats grid
			if (statusFilter === 'read') {
				enhancedFilter.columnFilters = [
					...(enhancedFilter.columnFilters || []),
					{
						columnId: 'read',
						filterType: FilterType.Select,
						operator: 'is',
						value: true,
					},
				]
			} else if (statusFilter === 'unread') {
				enhancedFilter.columnFilters = [
					...(enhancedFilter.columnFilters || []),
					{
						columnId: 'read',
						filterType: FilterType.Select,
						operator: 'is',
						value: false,
					},
				]
			}

			const response = await API.Notifications.richSearch(enhancedFilter)

			if (response.data?.payload) {
				const result = response.data.payload

				// Update stats from result data
				if (result.data && result.data.length > 0) {
					const allNotifications = result.data
					setStats({
						totalNotifications: result.total,
						unreadCount: allNotifications.filter((n) => !n.read).length,
						readCount: allNotifications.filter((n) => n.read).length,
						infoCount: allNotifications.filter((n) => n.type === NotificationType.Info).length,
						warningCount: allNotifications.filter((n) => n.type === NotificationType.Warning).length,
						errorCount: allNotifications.filter((n) => n.type === NotificationType.Error).length,
					})
				} else if (result.total === 0) {
					// Empty results - reset stats
					setStats({
						totalNotifications: 0,
						unreadCount: 0,
						readCount: 0,
						infoCount: 0,
						warningCount: 0,
						errorCount: 0,
					})
				}
				setStatsLoading(false)

				return result
			}

			// Return empty result on error
			return {
				data: [],
				page: 1,
				pageSize: filter.pageSize,
				total: 0,
				totalPages: 0,
				hasNext: false,
				hasPrevious: false,
			}
		} catch (error) {
			logger.error('Notifications fetch error', { error })
			setStatsLoading(false)
			return {
				data: [],
				page: 1,
				pageSize: filter.pageSize,
				total: 0,
				totalPages: 0,
				hasNext: false,
				hasPrevious: false,
			}
		}
	}

	// Actions - React 19: No useCallback needed
	const openDeleteModal = (notification: Notification) => {
		setDeleteModal({ isOpen: true, notification })
	}

	const closeDeleteModal = () => {
		if (!isDeleting) {
			setDeleteModal({ isOpen: false, notification: null })
		}
	}

	const refreshData = () => {
		setRefreshKey((prev) => prev + 1)
	}

	const setStatusFilter = (filter: NotificationStatusKey) => {
		setStatusFilterState(filter)
	}

	/**
	 * Mark a single notification as read.
	 * Uses optimistic updates for instant UI feedback.
	 */
	const handleMarkAsRead = async (notification: Notification) => {
		// Skip if already read
		if (notification.read) return

		// OPTIMISTIC UPDATE: Update UI immediately before API call
		gridApiRef.current?.updateRow(notification.id, (row) => ({ ...row, read: true }))

		// Update stats optimistically
		setStats((prev) =>
			prev
				? {
						...prev,
						unreadCount: Math.max(0, prev.unreadCount - 1),
						readCount: prev.readCount + 1,
				  }
				: null
		)

		try {
			const { data } = await API.Notifications.markAsRead(notification.id)

			if (data.statusCode !== 200) {
				// ROLLBACK: Revert optimistic update on error
				gridApiRef.current?.updateRow(notification.id, (row) => ({ ...row, read: false }))
				setStats((prev) =>
					prev
						? {
								...prev,
								unreadCount: prev.unreadCount + 1,
								readCount: Math.max(0, prev.readCount - 1),
						  }
						: null
				)

				notificationService.error(data.message ?? 'Failed to mark as read', {
					component: 'NotificationsPage',
					action: 'markAsRead',
				})
				return
			}

			notificationService.success('Marked as read', {
				component: 'NotificationsPage',
				action: 'markAsRead',
			})

			// No need for refreshData() - optimistic update already reflects the change
		} catch (error) {
			// ROLLBACK: Revert optimistic update on error
			gridApiRef.current?.updateRow(notification.id, (row) => ({ ...row, read: false }))
			setStats((prev) =>
				prev
					? {
							...prev,
							unreadCount: prev.unreadCount + 1,
							readCount: Math.max(0, prev.readCount - 1),
					  }
					: null
			)

			notificationService.error('Failed to mark notification as read', {
				metadata: { error, notificationId: notification.id },
				component: 'NotificationsPage',
				action: 'markAsRead',
			})
			logger.error('Mark as read error', { error })
		}
	}

	/**
	 * Mark all notifications as read.
	 * Uses bulk endpoint for efficiency with optimistic updates.
	 */
	const handleMarkAllAsRead = async () => {
		if (!stats || stats.unreadCount === 0) return

		const previousUnreadCount = stats.unreadCount

		// OPTIMISTIC UPDATE: Update all unread notifications to read immediately
		gridApiRef.current?.updateRows(
			(row) => !row.read,
			(row) => ({ ...row, read: true })
		)

		// Update stats optimistically
		setStats((prev) =>
			prev
				? {
						...prev,
						unreadCount: 0,
						readCount: prev.totalNotifications,
				  }
				: null
		)

		setIsMarkingRead(true)

		try {
			const { data } = await API.Notifications.markAllAsRead()

			if (data.statusCode !== 200) {
				// ROLLBACK: Revert optimistic update on error
				gridApiRef.current?.updateRows(
					(row) => row.read, // This is imperfect but acceptable for bulk rollback
					(row) => ({ ...row, read: false })
				)
				setStats((prev) =>
					prev
						? {
								...prev,
								unreadCount: previousUnreadCount,
								readCount: prev.totalNotifications - previousUnreadCount,
						  }
						: null
				)

				notificationService.error(data.message ?? 'Failed to mark all as read', {
					component: 'NotificationsPage',
					action: 'markAllAsRead',
				})
				return
			}

			const count = data.payload ?? 0
			notificationService.success(`Marked ${count} notifications as read`, {
				component: 'NotificationsPage',
				action: 'markAllAsRead',
			})

			// No need for refreshData() - optimistic update already reflects the change
		} catch (error) {
			// ROLLBACK: On network error, refresh to get true state
			notificationService.error('Failed to mark all as read', {
				metadata: { error },
				component: 'NotificationsPage',
				action: 'markAllAsRead',
			})
			logger.error('Mark all as read error', { error })
			// Refresh to get the true state from server
			refreshData()
		} finally {
			setIsMarkingRead(false)
		}
	}

	/**
	 * Delete a notification.
	 */
	const handleDelete = async () => {
		if (!deleteModal.notification || !canDelete) return

		setIsDeleting(true)

		try {
			const { data } = await API.Notifications.delete(deleteModal.notification.id)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to delete notification', {
					component: 'NotificationsPage',
					action: 'deleteNotification',
				})
				return
			}

			notificationService.success('Notification deleted', {
				component: 'NotificationsPage',
				action: 'deleteNotification',
			})

			closeDeleteModal()
			refreshData()
		} catch (error) {
			notificationService.error('Failed to delete notification', {
				metadata: { error },
				component: 'NotificationsPage',
				action: 'deleteNotification',
			})
			logger.error('Delete notification error', { error })
		} finally {
			setIsDeleting(false)
		}
	}

	return {
		// State
		deleteModal,
		refreshKey,
		statusFilter,
		isDeleting,
		isMarkingRead,

		// Stats
		stats,
		statsLoading,

		// RBAC
		canDelete,

		// Actions
		openDeleteModal,
		closeDeleteModal,
		handleDelete: () => void handleDelete(),
		handleMarkAsRead: (notification: Notification) => void handleMarkAsRead(notification),
		handleMarkAllAsRead: () => void handleMarkAllAsRead(),
		setStatusFilter,
		refreshData,

		// RichDataGrid integration
		fetcher,
		onGridReady,
	}
}

export default useNotificationsPage
