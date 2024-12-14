'use client'

import React, { useState } from 'react'
import Routes from '@/services/routes'

import { deleteCookie } from 'cookies-next'
import { InternalRouteType } from '@/classes/Enums'
import { useRouter } from 'next/navigation'
import FloatingMenu, { FloatingMenuProps } from '@/common/FloatingMenu'
import IRoute from '../interfaces/Route'

function ProfilePreview() {
	const router = useRouter()
	const [menuOpen, setMenuOpen] = useState(false)

	const handleLogout = () => {
		deleteCookie('at')
		window.location.reload()
	}

	const handleRoutePush = (route: IRoute) => {
		router.push(route.location)
		setMenuOpen(false)
	}

	const floatingMenuChildren: FloatingMenuProps = {
		children: {
			buttonSlot: <i className='fa-regular fa-user' />,
			bodySlot: (
				<>
					<div
						className='clickable option'
						onClick={() => handleRoutePush(Routes.getInternalRouteByValue(InternalRouteType.Profile))}>
						Settings
					</div>
					<div className='clickable option'>App Preferences</div>
					<div className='clickable option' onClick={handleLogout}>
						Logout
					</div>
				</>
			),
		},
	}
	return (
		<FloatingMenu
			{...floatingMenuChildren}
			isOpen={menuOpen}
			onClose={() => setMenuOpen(false)}
			onToggle={(newState) => setMenuOpen(newState)}
		/>
	)
}

export default ProfilePreview
