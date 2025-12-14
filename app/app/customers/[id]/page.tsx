'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ArrowLeft, Building2, FileText, Mail, Package, Phone, Plus, UserCheck } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { 
	BusinessTypeBadge, 
	CustomerStatusBadge, 
	CustomerStatsCard,
	type CustomerStats,
} from '@_features/customers'

import { formatDate } from '@_lib/dates'

import { notificationService, useRouteParam, API } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { CustomerStatus, TypeOfBusiness } from '@_classes/Enums'
import Company from '@_classes/Company'
import User from '@_classes/User'

import RoleBadge from '@_components/common/RoleBadge'
import UpdateCustomerForm from '@_components/forms/UpdateCustomerForm'
import { DataGrid, type ColumnDef } from '@_components/tables'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../../_components'

/**
 * CustomerDetailPage Component
 * 
 * Displays and manages individual customer details including:
 * - Customer profile information
 * - Business type and status
 * - Primary sales rep assignment
 * - Customer statistics (orders, quotes, revenue)
 * - Linked user accounts
 * 
 * **Business Flow Integration:**
 * - Shows customer lifecycle status
 * - Displays sales rep relationship for continuity
 * - Provides quick access to related orders and quotes
 * 
 * **Modes:**
 * - Create: params.id === 'create'
 * - Edit: params.id is customer ID
 */
const CustomerDetailPage = () => {
	const router = useRouter()
	const customerId = useRouteParam('id')

	// State
	const [customer, setCustomer] = useState<Company>(new Company())
	const [accounts, setAccounts] = useState<User[]>([])
	const [stats, setStats] = useState<CustomerStats | null>(null)
	const [loadingCustomer, setLoadingCustomer] = useState(true)
	const [loadingAccounts, setLoadingAccounts] = useState(false)
	const [loadingStats, setLoadingStats] = useState(false)

	const isCreateMode = customerId === 'create'
	const customerIdNum = isCreateMode ? null : Number(customerId)

	// Fetch customer data
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
				
				// Validate parsed number
				if (!customerIdNum || !Number.isFinite(customerIdNum) || customerIdNum <= 0) {
					notificationService.error('Invalid customer ID', {
						metadata: { customerId },
						component: 'CustomerDetailPage',
						action: 'fetchCustomer',
					})
					router.back()
					return
				}
				
				const { data } = await API.Customers.get(customerIdNum)

				if (!data.payload) {
					notificationService.error(data.message || 'Unable to load customer', {
						metadata: { customerId },
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
	}, [customerId, customerIdNum, isCreateMode, router])

	// Fetch linked accounts
	useEffect(() => {
		if (!customerIdNum || isCreateMode) return

		const retrieveAccounts = async () => {
			try {
				setLoadingAccounts(true)
				const filter = new GenericSearchFilter()
				filter.add('CustomerId', String(customerIdNum))
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
	}, [customerIdNum, isCreateMode, customerId])

	// Fetch customer stats
	useEffect(() => {
		if (!customerIdNum || isCreateMode) return

		const fetchStats = async () => {
			try {
				setLoadingStats(true)
				const { data } = await API.Customers.getStats(customerIdNum)
				
				if (data.payload) {
					setStats({
						...data.payload,
						lastOrderDate: data.payload.lastOrderDate 
							? new Date(data.payload.lastOrderDate) 
							: null,
						createdAt: new Date(data.payload.createdAt),
					})
				}
			} catch (error) {
				// Stats are optional, don't show error notification
				console.error('Failed to load customer stats:', error)
			} finally {
				setLoadingStats(false)
			}
		}

		void fetchStats()
	}, [customerIdNum, isCreateMode])

	// Handle customer update from form
	const handleCustomerUpdate = useCallback((updatedCustomer: Company) => {
		setCustomer(updatedCustomer)
		if (isCreateMode) {
			// After creation, redirect to detail page
			router.push(Routes.Customers.detail(updatedCustomer.id))
		}
	}, [isCreateMode, router])

	// Account columns
	const accountColumns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const name = row.original.name as any
					const formattedName = [name?.first, name?.middle, name?.last].filter(Boolean).join(' ')
					return (
						<span className="font-medium text-base-content">
							{formattedName || row.original.username}
						</span>
					)
				},
			},
			{
				accessorKey: 'email',
				header: 'Email',
				cell: ({ row }) => (
					<a href={`mailto:${row.original.email}`} className="link link-primary text-sm">
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
				cell: ({ row }) => (
					<span className="text-sm text-base-content/70">
						{formatDate(row.original.createdAt, 'short')}
					</span>
				),
			},
			{
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<div className="flex justify-end">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => router.push(Routes.Accounts.detail(row.original.id!))}
						>
							View
						</Button>
					</div>
				),
			},
		],
		[router]
	)

	// Page metadata
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
					<Button 
						variant="ghost" 
						onClick={() => router.back()}
						leftIcon={<ArrowLeft size={16} />}
					>
						Back
					</Button>
				}
			/>

			<div className="space-y-6">
				{/* Customer Overview Card (Edit Mode Only) */}
				{!isCreateMode && !loadingCustomer && (
					<div className="card bg-base-100 border border-base-300 shadow-sm">
						<div className="card-body p-4 sm:p-6">
							{/* Header with badges */}
							<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<div className="flex items-start gap-4">
									<div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary">
										<Building2 size={32} />
									</div>
									<div className="flex flex-col gap-1">
										<div className="flex flex-wrap items-center gap-2">
											<h2 className="text-xl font-bold text-base-content">{customer.name}</h2>
											<CustomerStatusBadge 
												status={customer.status ?? CustomerStatus.Active} 
												size="sm"
											/>
										</div>
										<div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
											<BusinessTypeBadge 
												type={customer.typeOfBusiness ?? TypeOfBusiness.Other} 
												size="sm"
											/>
											{customer.taxId && (
												<span className="badge badge-outline badge-sm">
													Tax ID: {customer.taxId}
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Contact Info */}
								<div className="flex flex-col gap-1 text-sm">
									{customer.email && (
										<a 
											href={`mailto:${customer.email}`}
											className="flex items-center gap-2 text-base-content/70 hover:text-primary"
										>
											<Mail size={14} />
											{customer.email}
										</a>
									)}
									{customer.phone && (
										<a 
											href={`tel:${customer.phone}`}
											className="flex items-center gap-2 text-base-content/70 hover:text-primary"
										>
											<Phone size={14} />
											{customer.phone}
										</a>
									)}
								</div>
							</div>

							{/* Sales Rep Info */}
							{customer.primarySalesRep && (
								<div className="mt-4 pt-4 border-t border-base-300">
									<div className="flex items-center gap-2 text-sm">
										<UserCheck size={16} className="text-success" />
										<span className="text-base-content/70">Primary Sales Rep:</span>
										<span className="font-medium">
											{customer.salesRepName || customer.primarySalesRep.username}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Statistics Card (Edit Mode Only) */}
				{!isCreateMode && stats && (
					<CustomerStatsCard stats={stats} isLoading={loadingStats} />
				)}

				{/* Quick Actions (Edit Mode Only) */}
				{!isCreateMode && (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<Button
							variant="outline"
							className="flex-col gap-1 h-auto py-3"
							onClick={() => router.push(`${Routes.Orders.location}?customerId=${customerIdNum}`)}
						>
							<Package size={20} />
							<span className="text-xs">View Orders</span>
						</Button>
						<Button
							variant="outline"
							className="flex-col gap-1 h-auto py-3"
							onClick={() => router.push(`${Routes.Quotes.location}?customerId=${customerIdNum}`)}
						>
							<FileText size={20} />
							<span className="text-xs">View Quotes</span>
						</Button>
						<Button
							variant="outline"
							className="flex-col gap-1 h-auto py-3"
							onClick={() => router.push(Routes.Orders.create({ customerId: customerIdNum ?? 0 }))}
						>
							<Package size={20} />
							<span className="text-xs">New Order</span>
						</Button>
						<Button
							variant="outline"
							className="flex-col gap-1 h-auto py-3"
							onClick={() => router.push(Routes.Quotes.create({ customerId: customerIdNum ?? 0 }))}
						>
							<FileText size={20} />
							<span className="text-xs">New Quote</span>
						</Button>
					</div>
				)}

				{/* Customer Form */}
				<section className="card bg-base-100 border border-base-300 shadow-sm">
					<div className="card-body p-4 sm:p-6">
						<h3 className="text-lg font-semibold mb-4">
							{isCreateMode ? 'Customer Information' : 'Edit Customer'}
						</h3>
						<UpdateCustomerForm 
							customer={customer} 
							onUserUpdate={handleCustomerUpdate}
						/>
					</div>
				</section>

				{/* Linked Accounts (Edit Mode Only) */}
				{!isCreateMode && (
					<section className="card bg-base-100 border border-base-300 shadow-sm">
						<div className="card-body p-4 sm:p-6">
							<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 className="text-lg font-semibold text-base-content">
										Customer Accounts
									</h3>
									<p className="text-sm text-base-content/70">
										Users linked to this organization with access to MedSource Pro.
									</p>
								</div>
								<Button
									variant="primary"
									size="sm"
									leftIcon={<Plus size={16} />}
									onClick={() => router.push(Routes.Accounts.create({ customerId: customer.id ?? '' }))}
								>
									<span className="hidden sm:inline">Add Account</span>
									<span className="sm:hidden">Add</span>
								</Button>
							</div>

							<DataGrid<User>
								columns={accountColumns}
								data={accounts}
								ariaLabel="Customer accounts"
								isLoading={loadingAccounts}
								emptyMessage={
									<div className="flex flex-col items-center gap-2 py-6">
										<UserCheck size={32} className="text-base-content/30" />
										<p className="text-base-content/60 text-sm">
											No accounts linked to this customer yet.
										</p>
										<Button
											variant="primary"
											size="sm"
											onClick={() => router.push(Routes.Accounts.create({ customerId: customer.id ?? '' }))}
										>
											Add First Account
										</Button>
									</div>
								}
							/>
						</div>
					</section>
				)}
			</div>
		</>
	)
}

export default CustomerDetailPage
