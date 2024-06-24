'use client'
import React from 'react'
import User from '@/classes/User'
import { useAccountStore } from '@/src/stores/user'

import UpdateAccountForm from '@/components/UpdateAccountForm'
import ProfilePicture from '@/components/ProfilePicture'

const UserInfoBasic = () => {
	const { User: UserFromStore } = useAccountStore((state) => state)

	const onUserUpdate = (user: User) => {
		useAccountStore.setState({ User: user })
	}

	return (
		<section className='BasicUserInformation'>
			<ProfilePicture />

			<h3 className='header'>Basic Information</h3>
			<UpdateAccountForm user={UserFromStore} onUserUpdate={onUserUpdate} />
		</section>
	)
}

export default UserInfoBasic
