import React from 'react'
import { deleteCookie } from 'cookies-next'
import FloatingMenu, { FloatingMenuProps } from '@/common/FloatingMenu'

function ProfilePreview() {
	const handleLogout = () => {
		deleteCookie('at')
		window.location.reload()
	}
	const floatingMenuChildren: FloatingMenuProps = {
		children: {
			buttonSlot: (
				<div className='pfp-preview'>
					<i className='fa-regular fa-user' />
				</div>
			),
			bodySlot: (
				<>
					<div className='clickable'>Settings</div>
					<div className='clickable'>App Preferences</div>
					<div className='clickable' onClick={handleLogout}>
						Logout
					</div>
				</>
			),
		},
	}
	return <FloatingMenu {...floatingMenuChildren} />
}

export default ProfilePreview
