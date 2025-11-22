'use client'

import React, { useState, useEffect } from 'react'
import Notification from '@_classes/Notification'
import { logger } from '@_core'
import { API } from '@_shared'
import { useRouter } from 'next/navigation'
import { notificationService, useRouteParam } from '@_shared'
import { NotificationType } from '@_classes/Enums'
import { formatDateTime } from '@_lib/dates'

function Page() {
	const [notification, setNotification] = useState<Notification>(new Notification())
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const route = useRouter()
	const notificationId = useRouteParam('id')
	
	useEffect(() => {
		if (!notificationId) return

		const getNotification = async () => {
			try {
				setIsLoading(true)
				const { data } = await API.Notifications.get<Notification>(notificationId)

				if (data.statusCode == 200 && data.payload) {
					setNotification(data.payload)
				} else {
					notificationService.error(data.message || 'Unable to load notification', {
						metadata: { notificationId },
						component: 'NotificationDetailPage',
						action: 'fetchNotification',
					})
				}
			} catch (err) {
				notificationService.error('Error Retrieving The Notification Info', {
					metadata: { error: err, notificationId },
					component: 'NotificationDetailPage',
					action: 'fetchNotification',
				})
				// route.push('/not-found')
			} finally {
				setIsLoading(false)
			}
		}

		void getNotification()
	}, [notificationId])
	return (
		<div className='Notification'>
			<h2 className='page-title'>Notification</h2>
			
			<h3>{NotificationType[notification.type]}</h3>
			<p> {notification.message}</p>
			<p>{formatDateTime(notification.createdAt)}</p>
		</div>
	)
}

export default Page
