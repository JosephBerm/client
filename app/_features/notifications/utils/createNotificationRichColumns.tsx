/**
 * Notification Table RichDataGrid Columns Factory
 *
 * Creates RichDataGrid column definitions for the notifications data grid.
 * Follows the exact pattern from createCustomerRichColumns.tsx for DRY compliance.
 *
 * **Features:**
 * - Text filter on message (searchable)
 * - Select filter on type and read status (faceted)
 * - Date filter on createdAt
 * - Actions: View (if linkUrl), Mark as Read, Delete (admin)
 *
 * **DRY Compliance:**
 * - Uses NotificationTypeHelper for type metadata (no duplicate config)
 * - Uses DaisyUI semantic colors via Badge component
 *
 * @see RICHDATAGRID_MIGRATION_PLAN.md - Phase 3.x
 * @module notifications/utils
 */

import Link from 'next/link'

import { CheckCircle, ExternalLink, Trash2 } from 'lucide-react'

import { formatDate } from '@_shared'

import type Notification from '@_classes/Notification'
import NotificationTypeHelper from '@_classes/Helpers/NotificationTypeHelper'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import {
	createRichColumnHelper,
	FilterType,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'

interface CreateNotificationColumnsOptions {
	/** Whether user can delete notifications (Admin only) */
	canDelete: boolean
	/** Handler for marking a notification as read */
	onMarkAsRead: (notification: Notification) => void
	/** Handler for opening delete modal */
	onDelete: (notification: Notification) => void
}

// Create the column helper
const columnHelper = createRichColumnHelper<Notification>()

/**
 * Creates RichDataGrid column definitions for the notifications table.
 *
 * @param options - Configuration options for columns
 * @returns Array of RichColumnDef column definitions
 */
export function createNotificationRichColumns(
	options: CreateNotificationColumnsOptions
): RichColumnDef<Notification, unknown>[] {
	const { canDelete, onMarkAsRead, onDelete } = options

	return [
		// Message - Text filter, searchable
		columnHelper.accessor('message', {
			header: 'Message',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => {
				const isUnread = !row.original.read

				return (
					<div className="flex items-start gap-3 min-w-0">
						{/* Unread indicator dot */}
						{isUnread && (
							<div
								className="w-2 h-2 rounded-full bg-warning mt-2 shrink-0"
								aria-label="Unread notification"
							/>
						)}
						<div className="flex flex-col min-w-0 gap-0.5">
							<span
								className={`text-sm text-base-content line-clamp-2 ${
									isUnread ? 'font-medium' : 'opacity-70'
								}`}
							>
								{row.original.message}
							</span>
							{/* Mobile: Show created date inline */}
							<span className="text-xs text-base-content/50 sm:hidden">
								{formatDate(row.original.createdAt, 'short')}
							</span>
						</div>
					</div>
				)
			},
		}),

		// Type - Select filter, faceted (reuses NotificationTypeHelper)
		columnHelper.accessor('type', {
			header: 'Type',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => {
				const metadata = NotificationTypeHelper.getMetadata(row.original.type)
				return (
					<Badge variant={metadata.variant} size="sm" tone="subtle">
						{metadata.display}
					</Badge>
				)
			},
		}),

		// Status (read) - Select filter, faceted
		columnHelper.accessor('read', {
			header: 'Status',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => (
				<Badge
					variant={row.original.read ? 'success' : 'warning'}
					size="sm"
					tone="subtle"
				>
					{row.original.read ? 'Read' : 'Unread'}
				</Badge>
			),
		}),

		// Created At - Date filter (hidden on mobile, shown in message cell)
		columnHelper.accessor('createdAt', {
			header: 'Created',
			filterType: FilterType.Date,
			cell: ({ row }) => (
				<span className="hidden sm:inline text-sm text-base-content/70">
					{formatDate(row.original.createdAt, 'short')}
				</span>
			),
		}),

		// Actions - Display only
		columnHelper.display({
			id: 'actions',
			header: '',
			cell: ({ row }) => (
				<div className="flex justify-end gap-1">
					{/* View link if available */}
					{row.original.linkUrl && (
						<Link href={row.original.linkUrl}>
							<Button
								variant="ghost"
								size="sm"
								aria-label="View related item"
							>
								<ExternalLink className="w-4 h-4" />
							</Button>
						</Link>
					)}

					{/* Mark as read - only for unread */}
					{!row.original.read && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onMarkAsRead(row.original)}
							aria-label="Mark as read"
						>
							<CheckCircle className="w-4 h-4 text-success" />
						</Button>
					)}

					{/* Delete - Admin only */}
					{canDelete && (
						<Button
							variant="ghost"
							size="sm"
							className="text-error hover:text-error hover:bg-error/10"
							onClick={() => onDelete(row.original)}
							aria-label="Delete notification"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					)}
				</div>
			),
		}),
	]
}

export default createNotificationRichColumns
