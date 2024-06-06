import React from 'react'
import ChangePasswordForm from '@/components/Settings/ChangePasswordForm'
import UpdateProfileForm from '@/components/Settings/UpdateProfileForm'

const Page = () => {
	return (
		<div className='Profile page-container'>
			<UpdateProfileForm />
			<ChangePasswordForm />
		</div>
	)
}

export default Page
