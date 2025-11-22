'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { notificationService } from '@_shared'

import Button from '@_components/ui/Button'
import { InternalPageHeader } from '../../_components'
import { DataGrid, type ColumnDef } from '@_components/tables'
import UpdateCustomerForm from '@_components/forms/UpdateCustomerForm'
import RoleBadge from '@_components/common/RoleBadge'
import Company from '@_classes/Company'
import User from '@_classes/User'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { logger } from '@_core'
import { API } from '@_shared'
import { Routes } from '@_features/navigation'

const Page = () => {
	const params = useParams<{ id?: string }>()
	const router = useRouter()
	const customerId = params?.id ?? ''

	const [customer, setCustomer] = useState<Company>(new Company())
	const [accounts, setAccounts] = useState<User[]>([])
	const [loadingCustomer, setLoadingCustomer] = useState(true)
	const [loadingAccounts, setLoadingAccounts] = useState(false)

	const isCreateMode = customerId === 'create'

	useEffect(() => {
		if (!customerId) {
			router.back()
			return
		}

		const initialize = async () => {
			if (isCreateMode) {
				setCustomer(new Company())
				setLoadingCustomer(false)
				return
			}

			try {
				setLoadingCustomer(true)
				const { data } = await API.Customers.get(Number(customerId))

			if (!data.payload) {
				notificationService.error(data.message || 'Unable to load customer', {
					metadata: { customerId: id },
					component: 'CustomerDetailPage',
					action: 'fetchCustomer',
				})
				router.back()
				return
				}

				setCustomer(new Company(data.payload))
		} catch (error) {
			notificationService.error('Unable to load customer', {
				metadata: { error, customerId },
				component: 'CustomerDetailPage',
				action: 'fetchCustomer',
			})
			router.back()
			} finally {
				setLoadingCustomer(false)
			}
		}

		void initialize()
	}, [customerId, isCreateMode, router])

	useEffect(() => {
		if (!customerId || isCreateMode) {
			return
		}

		const retrieveAccounts = async () => {
			try {
				setLoadingAccounts(true)
				const filter = new GenericSearchFilter()
				filter.add('CustomerId', String(customerId))
				filter.includes.push('Customer')

				const { data } = await API.Accounts.search(filter)

				if (data.payload?.data) {
					setAccounts(data.payload.data.map((account: any) => new User(account)))
				} else {
					setAccounts([])
				}
		} catch (error) {
			notificationService.error('Unable to load customer accounts', {
				metadata: { error, customerId },
				component: 'CustomerDetailPage',
				action: 'fetchAccounts',
			})
			setAccounts([])
			} finally {
				setLoadingAccounts(false)
			}
		}

		void retrieveAccounts()
	}, [customerId, isCreateMode])

	const columns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const name = row.original.name as any
					const formattedName = [name?.first, name?.middle, name?.last].filter(Boolean).join(' ')
					return <span className="font-medium text-base-content">{formattedName || row.original.username}</span>
				},
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: ({ row }) => (
					<a href={`mailto:${row.original.email}`} className="link link-primary">
						{row.original.email ?? 'Not provided'}
					</a>
				),
			},
			{
				accessorKey: 'role',
				header: 'Role',
				cell: ({ row }) => <RoleBadge role={row.original.role ?? 0} />,
			},
			{
				accessorKey: 'createdAt',
				header: 'Created',
				cell: ({ row }) => {
					const createdAt = row.original.createdAt ? new Date(row.original.createdAt as any) : null
					return (
						<span className="text-sm text-base-content/70">
							{createdAt && !isNaN(createdAt.getTime()) ? format(createdAt, 'PP') : 'Not available'}
						</span>
					)
				},
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<div className="flex justify-end">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => router.push(`${Routes.Accounts.location}/${row.original.id}`)}
						>
							View Account
						</Button>
					</div>
				),
			},
		],
		[router]
	)

	const title = isCreateMode ? 'Create Customer' : customer.name || 'Customer'
	const description = isCreateMode
		? 'Register a new customer organization and configure their purchasing details.'
		: 'Review and manage customer details, associated accounts, and linked activity.'

	return (
		<>
			<InternalPageHeader
				title={title}
				description={description}
				loading={loadingCustomer}
				actions={
					<Button variant="ghost" onClick={() => router.back()}>
						Back
					</Button>
				}
			/>

			<div className="space-y-10">
				<section className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
					<UpdateCustomerForm customer={customer} />
				</section>

				{!isCreateMode && (
					<section className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
						<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-xl font-semibold text-base-content">Customer Accounts</h2>
								<p className="text-sm text-base-content/70">
									Users linked to this organization with access to MedSource Pro.
								</p>
							</div>
							<Button
								variant="primary"
								onClick={() =>
									router.push(`${Routes.Accounts.location}/create?customerId=${customer.id ?? ''}`)
								}
							>
								Add Account
							</Button>
						</div>

						<DataGrid<User>
							columns={columns}
							data={accounts}
							ariaLabel="Customer accounts"
							isLoading={loadingAccounts}
							emptyMessage="No accounts are currently linked to this customer."
						/>
					</section>
				)}
			</div>
		</>
	)
}

export default Page
