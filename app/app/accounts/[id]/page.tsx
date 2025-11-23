'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from '@_lib/dates'
import { notificationService, useRouteParam } from '@_shared'

import Button from '@_components/ui/Button'
import { InternalPageHeader } from '../../_components'
import UpdateAccountForm from '@_components/forms/UpdateAccountForm'
import RoleBadge from '@_components/common/RoleBadge'
import Card from '@_components/ui/Card'
import User from '@_classes/User'
import { logger } from '@_core'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'

const Page = () => {
	const router = useRouter()
	const accountId = useRouteParam('id')

	const [account, setAccount] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const isCreateMode = accountId === 'create'

	useEffect(() => {
		if (!accountId) {
			router.back()
			return
		}

		if (isCreateMode) {
			setIsLoading(false)
			return
		}

		const fetchAccount = async () => {
			try {
				setIsLoading(true)
				const { data } = await API.Accounts.get(accountId)

			if (!data.payload) {
				notificationService.error(data.message || 'Unable to load account', {
					metadata: { accountId },
					component: 'AccountDetailPage',
					action: 'fetchAccount',
				})
				router.back()
				return
				}

				setAccount(new User(data.payload))
		} catch (error) {
			notificationService.error('Unable to load account', {
				metadata: { error, accountId },
				component: 'AccountDetailPage',
				action: 'fetchAccount',
			})
			router.back()
			} finally {
				setIsLoading(false)
			}
		}

		void fetchAccount()
	}, [accountId, isCreateMode, router])

	const accountName =
		account && account.name && typeof account.name === 'object'
			? [account.name.first, account.name.middle, account.name.last].filter(Boolean).join(' ')
			: account?.username ?? 'User'

	const memberSince = formatDate(account?.createdAt, 'long')

	const title = isCreateMode ? 'Create Account' : `${accountName}`
	const description = isCreateMode
		? 'Admin-created accounts are managed via the signup workflow. Invite users or share the signup link below.'
		: 'Review and update account details, adjust permissions, and manage personal information.'

	const hasCustomerAssociation = typeof account?.customerId === 'number' && account.customerId > 0

	return (
		<>
			<InternalPageHeader
				title={title}
				description={description}
				loading={isLoading}
				actions={
					<Button variant="ghost" onClick={() => router.back()}>
						Back
					</Button>
				}
			/>

			{isCreateMode ? (
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="space-y-4">
						<p className="text-base text-base-content/70">
							New MedSource Pro accounts are provisioned through the public signup flow. Share the signup link with
							the user or register on their behalf, then assign the appropriate customer organization.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link href={Routes.openLoginModal()} className="btn btn-primary">
								Open Signup
							</Link>
							<Link href={Routes.Accounts.location} className="btn btn-ghost">
								View Accounts
							</Link>
						</div>
					</div>
				</Card>
			) : account ? (
				<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<div className="mb-6 flex flex-wrap items-center gap-3">
							<RoleBadge role={account.role ?? 0} />
							<span className="text-xs uppercase tracking-wide text-base-content/60">
								Account {account.id ? `#${account.id}` : 'pending'}
							</span>
						</div>
						<UpdateAccountForm user={account} onUserUpdate={(updated) => setAccount(new User(updated))} />
					</Card>

					<div className="space-y-4">
						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<h2 className="text-lg font-semibold text-base-content">Account Details</h2>
							<div className="mt-4 space-y-2 text-sm text-base-content/70">
								<p>
									<strong className="text-base-content">Email:</strong> {account.email || 'Not provided'}
								</p>
								<p>
									<strong className="text-base-content">Username:</strong> {account.username || 'Not provided'}
								</p>
								<p>
									<strong className="text-base-content">Phone:</strong>{' '}
									{account.phone || account.mobile || 'Not provided'}
								</p>
								{memberSince && (
									<p>
										<strong className="text-base-content">Member since:</strong> {memberSince}
									</p>
								)}
							</div>
						</Card>

						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<h2 className="text-lg font-semibold text-base-content">Quick Actions</h2>
							<div className="mt-4 flex flex-col gap-3">
								<Button
									variant="secondary"
									onClick={() =>
										hasCustomerAssociation &&
										router.push(Routes.Customers.detail(account?.customerId ?? ''))
									}
									disabled={!hasCustomerAssociation}
								>
									View Customer
								</Button>
								<Button
									variant="error"
									onClick={() => router.push(Routes.Accounts.location)}
								>
									Manage Accounts
								</Button>
							</div>
						</Card>
					</div>
				</div>
			) : (
				<Card className="border border-error/30 bg-error/5 p-6 shadow-sm">
					<h3 className="text-lg font-semibold text-error">User not found</h3>
					<p className="mt-2 text-sm text-base-content/70">
						The account you are looking for could not be located. Please return to the accounts list and try again.
					</p>
					<div className="mt-4">
						<Button variant="primary" onClick={() => router.push(Routes.Accounts.location)}>
							Go to Accounts
						</Button>
					</div>
				</Card>
			)}
		</>
	)
}

export default Page
