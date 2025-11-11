'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import Button from '@_components/ui/Button'
import User from '@_classes/User'
import API from '@_services/api'

const Page = () => {
	const params = useParams<{ id?: string }>()
	const router = useRouter()
	const userId = useMemo(() => params?.id, [params])

	const [user, setUser] = useState<User | null>(null)
	const [isNewUser, setIsNewUser] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const initialize = async () => {
			if (!userId) {
				router.back()
				return
			}

			if (userId === 'create') {
				setUser(new User({}))
				setIsNewUser(true)
				setIsLoading(false)
				return
			}

			try {
				setIsLoading(true)
				const { data } = await API.Accounts.get(userId)
				if (data.payload) {
					setUser(data.payload)
				} else {
					setUser(null)
				}
			} finally {
				setIsLoading(false)
			}
		}

		void initialize()
	}, [router, userId])

	const pageTitle = isNewUser ? 'Create Account' : 'User Settings'
	const pageDescription = isNewUser
		? 'Add a new MedSource Pro account. Complete the form below to create a user.'
		: 'Review and update account details, access, and settings.'

	return (
		<ClientPageLayout
			title={pageTitle}
			description={pageDescription}
			loading={isLoading}
			actions={
				<Button variant="ghost" onClick={() => router.back()}>
					Back
				</Button>
			}
		>
			{user ? (
				<div className="alert alert-info mt-4">
					<span>
						TODO: Migrate AccountCRUD component. User ID: {user.id ?? 'New user'}
					</span>
				</div>
			) : (
				<div className="card bg-base-100 shadow-md p-6">
					<h3 className="text-lg font-semibold mb-2 text-error">User not found</h3>
					<p className="text-sm text-base-content/70">
						The account you are looking for could not be located. Please return to the accounts list and try again.
					</p>
					<div className="mt-4">
						<Button variant="primary" onClick={() => router.push('/medsource-app/accounts')}>
							Go to Accounts
						</Button>
					</div>
				</div>
			)}
		</ClientPageLayout>
	)
}

export default Page
