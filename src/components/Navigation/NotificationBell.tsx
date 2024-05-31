import React, { useState, useMemo, useEffect } from 'react'
import classNames from 'classnames'
import Notification from '@/src/classes/Notification'
import FloatingMenu, { FloatingMenuProps } from '@/src/common/FloatingMenu'
import { useAccountStore } from '@/src/stores/user'

function NotificationBell() {
	const UserData = useAccountStore((state) => state.User)
	const [notifications, setNotifications] = useState<Notification[]>(UserData.notifications || [])

	const hasUnreadNotifications = useMemo(() => {
		return notifications.some((notification) => !notification.read)
	}, [notifications])

	const [iconClass, setIconClass] = useState<string>(`fa-regular fa-bell ${hasUnreadNotifications ? 'unread' : ''}`)

	useEffect(() => {
		const newIconClass = `fa-regular fa-bell ${hasUnreadNotifications ? 'unread' : ''}`
		setIconClass(newIconClass)
	}, [notifications, hasUnreadNotifications]) // Include dependencies

	const floatingMenuChildren: FloatingMenuProps = {
		children: {
			bodySlot: (
				<>
					{!notifications.length ? (
						<span className='not-found'>Notification Not Found</span>
					) : (
						notifications.map((notification) => (
							<div className='notification-message' key={notification.id}>
								<span>{notification.message}</span>
							</div>
						))
					)}
				</>
			),
		},
		iconClass,
	}

	return <FloatingMenu {...floatingMenuChildren} />
}

export default NotificationBell
