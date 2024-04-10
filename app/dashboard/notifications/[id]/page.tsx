'use client'

import React, { useState, useEffect } from 'react'
import Notification from '@/classes/Notification'
import API from '@/services/api'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { NotificationType } from '@/classes/Enums'
import { format } from 'date-fns'

function Page() {
	const [notification, setNotification] = useState<Notification>(new Notification())
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const params = useParams()
	const route = useRouter()
	const getNotification = async (id: string) => {
		try {
			setIsLoading(true)
			const { data } = await API.Notifications.get<Notification>(id)

			if (data.statusCode == 200 && data.payload) {
				setNotification(data.payload)
			} else {
				toast.error(data.message)
			}
		} catch (err) {
			console.error(err)
			toast.error('Error Retrieving The Notification Info')
			// route.push('/not-found')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (params.id) {
			getNotification(params.id as string)
		}
	}, [])
	return (
		<div className='Notification'>
			<h2 className='page-title'>Notification</h2>
			
			<h3>{NotificationType[notification.type]}</h3>
			<p> {notification.message}</p>
			<p>{format(notification.createdAt, "dd-MM-yyyy")}</p>
		</div>
	)
}

export default Page
