'use client'

import React from 'react'

import { useAuthStore } from '@_features/auth'

import UpdateAccountForm from '@_components/forms/UpdateAccountForm'

import { InternalPageHeader } from '../_components'

const Page = () => {
	const user = useAuthStore((state) => state.user)

	if (!user) {
		return (
			<>
				<InternalPageHeader title="Profile" />
				<div className="alert alert-warning">
					<span>Please log in to view your profile.</span>
				</div>
			</>
		)
	}

	return (
		<>
			<InternalPageHeader
				title="Profile Settings"
				description="Manage your account information"
			/>

			<div className="card bg-base-100 shadow-xl max-w-4xl">
				<div className="card-body">
					<UpdateAccountForm user={user} />
				</div>
			</div>
		</>
	)
}

export default Page

