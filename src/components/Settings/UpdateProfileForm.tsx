'use client'
import React from 'react'
import User from '@/classes/User'
import { useAccountStore } from '@/src/stores/user'

import UpdateAccountForm from '@/components/UpdateAccountForm'

const UpdateProfileForm = () => {
	const { User: UserFromStore } = useAccountStore((state) => state)

	const onUserUpdate = (user: User) => {
		useAccountStore.setState({ User: user })
	}

	return (
		<div className='UpdateProfileForm'>
			<UpdateAccountForm user={UserFromStore} onUserUpdate={onUserUpdate} />
		</div>
	)
}

export default UpdateProfileForm
