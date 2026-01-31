/**
 * AssignSalesRepModal Component
 *
 * Modal dialog for assigning a primary sales representative to a customer.
 * Only accessible to SalesManager+ roles.
 *
 * **Features:**
 * - Fetches list of available sales reps
 * - Displays current assignment
 * - Shows sales rep info (name, email, role)
 * - Confirmation dialog before assignment
 * - Success/error notifications
 *
 * **RBAC:**
 * - SalesManager+: Can assign any sales rep
 * - SalesRep: Cannot access this modal
 * - Customer: Cannot access this modal
 *
 * @see prd_customers.md - US-CUST-004
 * @module customers/components
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { Search, User, UserCheck, X } from 'lucide-react'

import { notificationService, API, getUserDisplayName } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import Company from '@_classes/Company'
import type UserType from '@_classes/User'

import { RoleLevels } from '@_types/rbac'

import RoleBadge from '@_components/common/RoleBadge'
import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'
import Modal from '@_components/ui/Modal'

/**
 * AssignSalesRepModal props interface.
 */
interface AssignSalesRepModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Customer to assign sales rep to */
	customer: Company | null
	/** Callback when modal is closed */
	onClose: () => void
	/** Callback after successful assignment */
	onAssigned?: (updatedCustomer: Company) => void
}

/**
 * AssignSalesRepModal Component
 *
 * Allows SalesManager+ to assign or reassign a primary sales rep to a customer.
 */
export default function AssignSalesRepModal({ isOpen, customer, onClose, onAssigned }: AssignSalesRepModalProps) {
	// State
	const [salesReps, setSalesReps] = useState<UserType[]>([])
	const [filteredReps, setFilteredReps] = useState<UserType[]>([])
	const [selectedRepId, setSelectedRepId] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isAssigning, setIsAssigning] = useState(false)

	// Fetch sales reps on mount
	useEffect(() => {
		if (!isOpen) {
			return
		}

		const fetchSalesReps = async () => {
			setIsLoading(true)
			try {
				// Fetch SalesReps and SalesManagers
				const filter = new GenericSearchFilter()
				filter.add('Role', `${RoleLevels.SalesRep}|${RoleLevels.SalesManager}`)
				filter.pageSize = 100
				filter.sortBy = 'Role'
				filter.sortOrder = 'desc'

				const { data } = await API.Accounts.search(filter)

				if (data.payload?.data) {
					setSalesReps(data.payload.data)
					setFilteredReps(data.payload.data)
				}
			} catch (error) {
				notificationService.error('Failed to load sales representatives', {
					metadata: { error },
					component: 'AssignSalesRepModal',
					action: 'fetchSalesReps',
				})
			} finally {
				setIsLoading(false)
			}
		}

		void fetchSalesReps()
	}, [isOpen])

	// Reset state when modal opens/closes
	useEffect(() => {
		if (isOpen && customer) {
			setSelectedRepId(customer.primarySalesRepId)
			setSearchQuery('')
		} else {
			setSelectedRepId(null)
			setSearchQuery('')
		}
	}, [isOpen, customer])

	// Filter sales reps based on search query
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredReps(salesReps)
			return
		}

		const query = searchQuery.toLowerCase()
		const filtered = salesReps.filter((rep) => {
			const fullName = [rep.name?.first, rep.name?.last].filter(Boolean).join(' ').toLowerCase()
			const email = (rep.email ?? '').toLowerCase()
			const username = (rep.username ?? '').toLowerCase()

			return fullName.includes(query) || email.includes(query) || username.includes(query)
		})

		setFilteredReps(filtered)
	}, [searchQuery, salesReps])

	// Handle assignment
	const handleAssign = useCallback(async () => {
		if (!customer || !customer.id || !selectedRepId) {
			return
		}

		setIsAssigning(true)
		try {
			const { data } = await API.Customers.assignSalesRep(customer.id, selectedRepId)

			if (data.statusCode === 200 && data.payload) {
				notificationService.success('Sales rep assigned successfully', {
					metadata: { customerId: customer.id, salesRepId: selectedRepId },
					component: 'AssignSalesRepModal',
					action: 'assignSalesRep',
				})
				onAssigned?.(new Company(data.payload))
				onClose()
			} else {
				notificationService.error(data.message ?? 'Failed to assign sales rep', {
					metadata: { customerId: customer.id, salesRepId: selectedRepId },
					component: 'AssignSalesRepModal',
					action: 'assignSalesRep',
				})
			}
		} catch (error) {
			notificationService.error('An error occurred while assigning sales rep', {
				metadata: { error },
				component: 'AssignSalesRepModal',
				action: 'assignSalesRep',
			})
		} finally {
			setIsAssigning(false)
		}
	}, [customer, selectedRepId, onAssigned, onClose])

	// Check if selection has changed
	const hasChanges = selectedRepId !== customer?.primarySalesRepId

	/**
	 * Get display name for a user.
	 * Uses shared getUserDisplayName utility with type adaptation for UserType.
	 * @see @_shared/utils/userHelpers
	 */
	const getDisplayName = (user: UserType | null | undefined): string => {
		return getUserDisplayName(user as Parameters<typeof getUserDisplayName>[0])
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Assign Sales Representative'
			size='md'>
			<div className='space-y-4'>
				{/* Current Assignment */}
				{customer?.primarySalesRepId && customer?.primarySalesRep && (
					<div className='alert alert-info'>
						<UserCheck size={20} />
						<div>
							<p className='font-medium'>Current Assignment</p>
							<p className='text-sm'>
								{getDisplayName(customer.primarySalesRep)} ({customer.primarySalesRep.email})
							</p>
						</div>
					</div>
				)}

				{/* Search Input */}
				<Input
					type='text'
					placeholder='Search by name or email...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					disabled={isLoading || isAssigning}
					leftIcon={<Search size={18} />}
					rightIcon={
						searchQuery ? (
							<Button
								variant='ghost'
								size='xs'
								onClick={() => setSearchQuery('')}
								className='p-0 min-h-0 h-auto'>
								<X size={18} />
							</Button>
						) : undefined
					}
				/>

				{/* Sales Rep List */}
				<div className='max-h-80 overflow-y-auto border border-base-300 rounded-lg'>
					{isLoading ? (
						<div className='flex items-center justify-center py-8'>
							<span className='loading loading-spinner loading-md' />
						</div>
					) : filteredReps.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-8 text-base-content/60'>
							<User
								size={32}
								className='mb-2'
							/>
							<p>No sales representatives found</p>
						</div>
					) : (
						<ul className='divide-y divide-base-300'>
							{filteredReps.map((rep) => {
								const isSelected = selectedRepId === rep.id
								const isCurrent = customer?.primarySalesRepId === rep.id

								return (
									<li key={rep.id}>
										<Button
											variant='ghost'
											className={`w-full flex items-center gap-3 p-3 justify-start h-auto rounded-none ${
												isSelected ? 'bg-primary/10' : ''
											}`}
											onClick={() => setSelectedRepId(rep.id)}
											disabled={isAssigning}>
											<div className='flex-shrink-0'>
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center ${
														isSelected ? 'bg-primary text-primary-content' : 'bg-base-300'
													}`}>
													<User size={20} />
												</div>
											</div>
											<div className='flex-1 min-w-0 text-left'>
												<div className='flex items-center gap-2'>
													<span className='font-medium truncate'>{getDisplayName(rep)}</span>
													{isCurrent && (
														<span className='badge badge-success badge-sm'>Current</span>
													)}
												</div>
												<div className='flex items-center gap-2 text-sm text-base-content/60'>
													<span className='truncate'>{rep.email}</span>
								<RoleBadge role={rep.roleLevel ?? RoleLevels.Customer} />
												</div>
											</div>
											{isSelected && (
												<div className='flex-shrink-0'>
													<div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center'>
														<UserCheck
															size={14}
															className='text-primary-content'
														/>
													</div>
												</div>
											)}
										</Button>
									</li>
								)
							})}
						</ul>
					)}
				</div>

				{/* Actions */}
				<div className='flex justify-end gap-2 pt-2'>
					<Button
						variant='ghost'
						onClick={onClose}
						disabled={isAssigning}>
						Cancel
					</Button>
					<Button
						variant='primary'
						onClick={() => void handleAssign()}
						disabled={!hasChanges || isAssigning || selectedRepId === null}
						loading={isAssigning}>
						{isAssigning ? 'Assigning...' : 'Assign Sales Rep'}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
