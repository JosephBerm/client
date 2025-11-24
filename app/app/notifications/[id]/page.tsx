'use client'

import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'


import { formatDateTime } from '@_lib/dates'

import { API , notificationService, useRouteParam } from '@_shared'

import { NotificationType } from '@_classes/Enums'
import Notification from '@_classes/Notification'

function Page() {
	const [notification, setNotification] = useState<Notification>(new Notification())
	const [_isLoading, setIsLoading] = useState<boolean>(false)
	const _route = useRouter()
	const notificationId = useRouteParam('id')
	
	useEffect(() => {
		if (!notificationId) {return}

		const getNotification = async () => {
			try {
				setIsLoading(true)
				const { data } = await API.Notifications.get<Notification>(notificationId)

				if (data.statusCode === 200 && data.payload) {
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
