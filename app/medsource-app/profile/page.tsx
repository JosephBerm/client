import React from 'react'
import ChangePasswordForm from '@/components/Settings/ChangePasswordForm'
import UpdateProfileForm from '@/components/Settings/UpdateProfileForm'
import '@/styles/pages/profile.css'

const Page = () => {
	return (
		<div className='Profile page-container'>
			<h2 className='page-title'>Profile Settings</h2>
			<UpdateProfileForm />
			<ChangePasswordForm />
		</div>
	)
}

export default Page
