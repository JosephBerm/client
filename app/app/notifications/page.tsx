/**
 * NotificationsPage
 *
 * Main notifications management page with RichDataGrid.
 * Follows exact pattern from CustomersPage and ProvidersPage.
 *
 * **Architecture:**
 * - Client Component (uses hooks for interactivity)
 * - RichDataGrid with server-side pagination and filtering
 * - Column factory pattern for DRY compliance
 *
 * **Migration:** Migrated from DataGrid to RichDataGrid
 * @see RICHDATAGRID_MIGRATION_PLAN.md
 *
 * @module app/notifications
 */

'use client'

import { Bell, CheckCheck, Download, RefreshCw, Trash2 } from 'lucide-react'

import {
	NotificationStatsGrid,
	useNotificationsPage,
	createNotificationRichColumns,
} from '@_features/notifications'

import { formatDate, notificationService, API } from '@_shared'

import type Notification from '@_classes/Notification'

import {
	RichDataGrid,
	createColumnId,
	SortDirection,
	BulkActionVariant,
	type BulkAction,
} from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import ConfirmationModal from '@_components/ui/ConfirmationModal'

import { InternalPageHeader } from '../_components'

/**
 * NotificationsPage - Main notification list page.
 *
 * Uses the useNotificationsPage hook for all business logic.
 * Components are imported from @_features/notifications for DRY.
 */
export default function NotificationsPage() {
	// All business logic encapsulated in hook
	const {
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
		handleDelete,
		handleMarkAsRead,
		handleMarkAllAsRead,
		setStatusFilter,
		refreshData,
		// RichDataGrid integration
		fetcher,
		onGridReady,
	} = useNotificationsPage()

	// Column definitions - React Compiler auto-memoizes
	const columns = createNotificationRichColumns({
		canDelete,
		onMarkAsRead: handleMarkAsRead,
		onDelete: openDeleteModal,
	})

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="Notifications"
				description="Review recent system notifications and follow up on important actions."
				actions={
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={refreshData}
							leftIcon={<RefreshCw className="w-4 h-4" />}
						>
							<span className="hidden sm:inline">Refresh</span>
						</Button>
						{stats && stats.unreadCount > 0 && (
							<Button
								variant="primary"
								size="sm"
								onClick={handleMarkAllAsRead}
								loading={isMarkingRead}
								leftIcon={<CheckCheck className="w-4 h-4" />}
							>
								<span className="hidden sm:inline">Mark All Read</span>
								<span className="sm:hidden">Read All</span>
							</Button>
						)}
					</div>
				}
			/>

			{/* Stats Summary Grid - Click cards to filter */}
			<NotificationStatsGrid
				stats={stats}
				isLoading={statsLoading}
				selectedFilter={statusFilter}
				onFilterClick={setStatusFilter}
			/>

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body p-3 sm:p-6">
					<RichDataGrid<Notification>
						columns={columns}
						fetcher={fetcher}
						filterKey={`${refreshKey}-${statusFilter}`}
						defaultPageSize={10}
						defaultSorting={[{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending }]}
						enableGlobalSearch
						enableColumnFilters
						enableRowSelection={canDelete}
						enableColumnResizing
						onGridReady={onGridReady}
						bulkActions={canDelete ? [
							{
								id: 'export-csv',
								label: 'Export CSV',
								icon: <Download className="w-4 h-4" />,
								variant: BulkActionVariant.Default,
								onAction: async (rows: Notification[]) => {
									const headers = 'ID,Message,Type,Status,Created\n'
									const csv = rows.map(r =>
										`${r.id},"${(r.message ?? '').replace(/"/g, '""')}",${r.type},${r.read ? 'Read' : 'Unread'},"${formatDate(r.createdAt)}"`
									).join('\n')
									const blob = new Blob([headers + csv], { type: 'text/csv' })
									const url = URL.createObjectURL(blob)
									const a = document.createElement('a')
									a.href = url
									a.download = `notifications-export-${new Date().toISOString().split('T')[0]}.csv`
									a.click()
									URL.revokeObjectURL(url)
									notificationService.success(`Exported ${rows.length} notifications`)
								},
							},
							{
								id: 'delete-selected',
								label: 'Delete Selected',
								icon: <Trash2 className="w-4 h-4" />,
								variant: BulkActionVariant.Danger,
								confirmMessage: (count) => `Are you sure you want to delete ${count} notification(s)?`,
								onAction: async (rows: Notification[]) => {
									const promises = rows.map(r => API.Notifications.delete(r.id))
									await Promise.all(promises)
									notificationService.success(`Deleted ${rows.length} notifications`)
									refreshData()
								},
							},
						] satisfies BulkAction<Notification>[] : undefined}
						searchPlaceholder="Search notifications by message..."
						persistStateKey="notifications-grid"
						emptyState={<NotificationsEmptyState statusFilter={statusFilter} onClear={() => setStatusFilter('all')} />}
						ariaLabel="Notifications table"
					/>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={closeDeleteModal}
				onConfirm={handleDelete}
				title="Delete Notification"
				message="Are you sure you want to delete this notification?"
				details="This action cannot be undone."
				variant="danger"
				confirmText="Delete"
				cancelText="Cancel"
				isLoading={isDeleting}
			/>
		</>
	)
}

/**
 * Empty state component for notifications.
 */
interface NotificationsEmptyStateProps {
	statusFilter: string
	onClear: () => void
}

function NotificationsEmptyState({ statusFilter, onClear }: NotificationsEmptyStateProps) {
	if (statusFilter === 'unread') {
		return (
			<div className="flex flex-col items-center gap-3 py-8">
				<CheckCheck size={48} className="text-success" />
				<p className="text-base-content/60 font-medium">All caught up!</p>
				<p className="text-sm text-base-content/40">You have no unread notifications.</p>
				<Button variant="ghost" size="sm" onClick={onClear}>
					View All Notifications
				</Button>
			</div>
		)
	}

	if (statusFilter === 'read') {
		return (
			<div className="flex flex-col items-center gap-3 py-8">
				<Bell size={48} className="text-base-content/30" />
				<p className="text-base-content/60 font-medium">No read notifications</p>
				<p className="text-sm text-base-content/40">Notifications you've read will appear here.</p>
				<Button variant="ghost" size="sm" onClick={onClear}>
					View All Notifications
				</Button>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center gap-3 py-8">
			<Bell size={48} className="text-base-content/30" />
			<p className="text-base-content/60 font-medium">No notifications</p>
			<p className="text-sm text-base-content/40">
				When there are updates to your quotes, orders, or account, they'll appear here.
			</p>
		</div>
	)
}
