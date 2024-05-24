import React from 'react'
import FloatingMenu, { FloatingMenuProps } from '@/common/FloatingMenu'

function ProfilePreview() {
	const floatingMenuChildren: FloatingMenuProps = {
		children: {
			buttonSlot: (
				<div className='pfp-preview'>
					<span>pfp</span>
				</div>
			),
			bodySlot: (
				<>
					<div>Settings</div>
					<div>App Preferences</div>
					<div>Logout</div>
				</>
			),
		},
	}
	return <FloatingMenu {...floatingMenuChildren} />
}

export default ProfilePreview
