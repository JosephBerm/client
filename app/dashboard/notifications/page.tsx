'use client'

import React, { useState, useEffect } from 'react'
import Table from '@/common/table'
import Notification from '@/classes/Notification'
import { useAccountStore } from '@/src/stores/user'
import { TableColumn } from '@/interfaces/TableColumn'
import { format } from 'date-fns'
import { useRouter, usePathname } from 'next/navigation'
import '@/styles/notifications.css'

function Page() {
	const columns: TableColumn<Notification>[] = [
		{
			path: 'read',
			label: 'Read/Unread',
		},
		{
			path: 'createdAt',
			label: 'Created',
			content: (notification) => <>{format(new Date(notification.createdAt), 'mm/dd/yyyy')}</>,
		},
		{
			path: 'message',
			label: 'Message',
		},
	]
	const router = useRouter()
	const pathName = usePathname()
	const user = useAccountStore((state) => state.User)
	console.log(user)

	const showUnread = (item: Notification): string => {
		return !item.read ? 'unread' : ''
	}
	const handleRowClick = (item: Notification) => {
		router.push(`${pathName}/${item.id}`)
	}
	return (
		<div className='Notifications'>
			<Table<Notification>
				columns={columns}
				data={user.notifications}
				isSortable={false}
				isSearchable={true}
				cssRowClass={showUnread}
				onRowClick={handleRowClick}
			/>
		</div>
	)
}

export default Page
