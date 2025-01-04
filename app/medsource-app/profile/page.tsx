'use client'

import React from 'react'

import '@/styles/pages/profile.css'
import { useAccountStore } from '@/src/stores/user'
import AddEditUser from '@/src/components/AddEditUser'

const Page = () => {
	const { User: UserFromStore } = useAccountStore((state) => state)

	return (
		<div className='Profile page-container'>
			<h2 className='page-title'>Profile Settings</h2>

			<AddEditUser user={UserFromStore} />
		</div>
	)
}

export default Page
