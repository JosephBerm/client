'use client'

import React from 'react'
import { useAuthStore } from '@_features/auth'
import UpdateAccountForm from '@_components/forms/UpdateAccountForm'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'

const Page = () => {
	const user = useAuthStore((state) => state.user)

	if (!user) {
		return (
			<ClientPageLayout title="Profile">
				<div className="alert alert-warning">
					<span>Please log in to view your profile.</span>
				</div>
			</ClientPageLayout>
		)
	}

	return (
		<ClientPageLayout title="Profile Settings" description="Manage your account information">
			<div className="card bg-base-100 shadow-xl max-w-4xl mx-auto">
				<div className="card-body">
					<UpdateAccountForm user={user} />
				</div>
			</div>
		</ClientPageLayout>
	)
}

export default Page

