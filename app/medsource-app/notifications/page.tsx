'use client'

import React, { useState, useEffect } from 'react'
// TODO: Migrate to DataTable component
// import Table from '@/common/table'
import Notification from '@_classes/Notification'
import { useAuthStore } from '@_stores/useAuthStore'
// import { TableColumn } from '@/interfaces/Table'
import { format } from 'date-fns'
import { useRouter, usePathname } from 'next/navigation'
// Styles migrated to Tailwind

function Page() {
	const router = useRouter()
	const pathName = usePathname()
	const user = useAuthStore((state) => state.user)

	const handleRowClick = (notification: any) => {
		router.push(`${pathName}/${notification.id}`)
	}

	return (
		<div className='Notifications p-8'>
			<div className="alert alert-info mb-4">
				<span>TODO: Migrate notifications table to use DataTable component</span>
			</div>
			<div className="mt-4">
				{user?.notifications && user.notifications.length > 0 ? (
					<div className="space-y-2">
						{user.notifications.map((notification: any) => (
							<div 
								key={notification.id} 
								className="card bg-base-100 shadow cursor-pointer hover:shadow-lg"
								onClick={() => handleRowClick(notification)}
							>
								<div className="card-body">
									<p>{notification.message}</p>
									<span className="text-sm text-base-content/60">
										{format(new Date(notification.createdAt), 'MM/dd/yyyy')}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<p>No notifications</p>
				)}
			</div>
		</div>
	)
}

export default Page
