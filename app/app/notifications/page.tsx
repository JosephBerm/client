'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'

import DataTable from '@_components/tables/DataTable'
import { InternalPageHeader } from '../_components'
import Badge from '@_components/ui/Badge'
import Notification from '@_classes/Notification'
import { NotificationType } from '@_classes/Enums'
import { useAuthStore } from '@_features/auth'
import { formatDate } from '@_shared'

const TYPE_VARIANT: Record<NotificationType, { label: string; variant: 'info' | 'warning' | 'error' }> = {
	[NotificationType.Info]: { label: 'Info', variant: 'info' },
	[NotificationType.Warning]: { label: 'Warning', variant: 'warning' },
	[NotificationType.Error]: { label: 'Alert', variant: 'error' },
}

export default function NotificationsPage() {
	const user = useAuthStore((state) => state.user)

	const notifications = useMemo(() => {
		if (!user?.notifications) return []
		return user.notifications.map((notification: any) => new Notification(notification))
	}, [user?.notifications])

	const columns = useMemo<ColumnDef<Notification>[]>(
		() => [
			{
				accessorKey: 'message',
				header: 'Message',
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-medium text-base-content">{row.original.message}</span>
						<span className="text-xs text-base-content/60">
							Created {formatDate(row.original.createdAt)}
							{row.original.readAt ? ` · Read ${formatDate(row.original.readAt)}` : ''}
						</span>
					</div>
				),
			},
			{
				accessorKey: 'type',
				header: 'Type',
				cell: ({ row }) => {
					const config = TYPE_VARIANT[row.original.type] ?? TYPE_VARIANT[NotificationType.Info]
					return <Badge variant={config.variant}>{config.label}</Badge>
				},
			},
			{
				accessorKey: 'read',
				header: 'Status',
				cell: ({ row }) =>
					row.original.read ? (
						<Badge variant="neutral" size="sm">
							Read
						</Badge>
					) : (
						<Badge variant="warning" size="sm">
							Unread
						</Badge>
					),
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) =>
					row.original.linkUrl ? (
						<Link href={row.original.linkUrl} className="btn btn-ghost btn-sm">
							View
						</Link>
					) : (
						<span className="text-xs text-base-content/50">No action</span>
					),
			},
		],
		[]
	)

	return (
		<>
			<InternalPageHeader
				title="Notifications"
				description="Review recent system notifications and follow up on important actions."
			/>

			<DataTable<Notification>
				columns={columns}
				data={notifications}
				emptyMessage="You have no notifications yet."
			/>
		</>
	)
}

