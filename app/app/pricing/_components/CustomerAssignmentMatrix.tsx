'use client'

/**
 * Customer Assignment Matrix Component
 *
 * Enhanced customer-to-price-list assignment management with:
 * - Customer search and filtering
 * - Bulk assignment/unassignment actions
 * - Visual matrix of customer-price list relationships
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 4.3 (Admin User Stories)
 * > US-PRICE-017: "As an Admin, I want to assign price lists to customers"
 *
 * @module pricing/components/CustomerAssignmentMatrix
 */

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Users,
	Search,
	Plus,
	Trash2,
	CheckCircle,
	XCircle,
	Building2,
	List,
	AlertCircle,
	RefreshCw,
} from 'lucide-react'

import API from '@_shared/services/api'
import { pricingKeys, usePriceLists, useAssignCustomerPriceList, useRemoveCustomerPriceList } from '@_features/pricing'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import Checkbox from '@_components/ui/Checkbox'
import FormInput from '@_components/forms/FormInput'
import ConfirmationModal from '@_components/ui/ConfirmationModal'
import { RichDataGrid, createRichColumnHelper, FilterType, type RichColumnDef } from '@_components/tables/RichDataGrid'

// =========================================================================
// TYPES
// =========================================================================

interface Customer {
	id: number
	name: string
	email?: string
	assignedPriceLists: string[] // Array of price list IDs
}

interface AssignmentModalState {
	isOpen: boolean
	customer: Customer | null
	priceListId: string | null
	action: 'assign' | 'unassign'
}

// =========================================================================
// COMPONENT
// =========================================================================

export default function CustomerAssignmentMatrix() {
	const queryClient = useQueryClient()
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCustomers, setSelectedCustomers] = useState<Set<number>>(new Set())
	const [assignmentModal, setAssignmentModal] = useState<AssignmentModalState>({
		isOpen: false,
		customer: null,
		priceListId: null,
		action: 'assign',
	})
	const [bulkPriceListId, setBulkPriceListId] = useState<string>('')

	// Fetch price lists for selection
	const { data: priceListsData, isLoading: priceListsLoading } = usePriceLists(1, 100)
	const priceLists = priceListsData?.data ?? []
	const activePriceLists = priceLists.filter((pl) => pl.isActive)

	// Fetch customers with their price list assignments
	// Note: This would need a new API endpoint that returns customers with their assignments
	const {
		data: customersData,
		isLoading: customersLoading,
		error: customersError,
	} = useQuery({
		queryKey: ['customers', 'with-assignments'],
		queryFn: async () => {
			// This would call a new endpoint that returns customers with their price list assignments
			// For now, we'll use the existing customers endpoint
			const response = await API.Customers.getAll()
			const rawData = (response?.data?.payload ?? []) as Customer[]
			// Map to Customer interface with empty assignedPriceLists (to be populated from API)
			return rawData.map((c) => ({
				...c,
				assignedPriceLists: c.assignedPriceLists ?? [],
			}))
		},
		// Enable when we have the API endpoint
		enabled: false, // TODO: Enable when API is implemented
	})

	const customers: Customer[] = customersData ?? []

	// Mutations
	const assignMutation = useAssignCustomerPriceList()
	const unassignMutation = useRemoveCustomerPriceList()

	// Filtered customers based on search
	const filteredCustomers = useMemo(() => {
		if (!searchTerm.trim()) return customers
		const term = searchTerm.toLowerCase()
		return customers.filter(
			(c) =>
				c.name.toLowerCase().includes(term) ||
				c.email?.toLowerCase().includes(term) ||
				c.id.toString().includes(term)
		)
	}, [customers, searchTerm])

	// Handle individual assignment
	const handleAssign = async (customerId: number, priceListId: string) => {
		await assignMutation.mutateAsync({ customerId, priceListId })
	}

	// Handle individual unassignment
	const handleUnassign = async (customerId: number, priceListId: string) => {
		await unassignMutation.mutateAsync({ customerId, priceListId })
	}

	// Handle bulk assignment
	const handleBulkAssign = async () => {
		if (!bulkPriceListId || selectedCustomers.size === 0) return

		for (const customerId of selectedCustomers) {
			try {
				await handleAssign(customerId, bulkPriceListId)
			} catch (error) {
				// Continue with other assignments
				console.error(`Failed to assign customer ${customerId}:`, error)
			}
		}

		// Clear selection
		setSelectedCustomers(new Set())
		setBulkPriceListId('')
	}

	// Handle bulk unassignment
	const handleBulkUnassign = async () => {
		if (!bulkPriceListId || selectedCustomers.size === 0) return

		for (const customerId of selectedCustomers) {
			try {
				await handleUnassign(customerId, bulkPriceListId)
			} catch (error) {
				// Continue with other unassignments
				console.error(`Failed to unassign customer ${customerId}:`, error)
			}
		}

		// Clear selection
		setSelectedCustomers(new Set())
		setBulkPriceListId('')
	}

	// Toggle customer selection
	const toggleCustomerSelection = (customerId: number) => {
		const newSelected = new Set(selectedCustomers)
		if (newSelected.has(customerId)) {
			newSelected.delete(customerId)
		} else {
			newSelected.add(customerId)
		}
		setSelectedCustomers(newSelected)
	}

	// Select all visible customers
	const selectAllCustomers = () => {
		if (selectedCustomers.size === filteredCustomers.length) {
			setSelectedCustomers(new Set())
		} else {
			setSelectedCustomers(new Set(filteredCustomers.map((c) => c.id)))
		}
	}

	// Column definitions
	const columnHelper = createRichColumnHelper<Customer>()

	const columns: RichColumnDef<Customer, unknown>[] = [
		columnHelper.display({
			id: 'select',
			header: () => (
				<Checkbox
					className='checkbox-sm'
					checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0}
					onChange={selectAllCustomers}
					aria-label='Select all customers'
				/>
			),
			size: 40,
			cell: ({ row }) => (
				<Checkbox
					className='checkbox-sm'
					checked={selectedCustomers.has(row.original.id)}
					onChange={() => toggleCustomerSelection(row.original.id)}
					aria-label={`Select ${row.original.name}`}
				/>
			),
		}),
		columnHelper.accessor('name', {
			header: 'Customer',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
						<Building2 className='h-5 w-5 text-primary' />
					</div>
					<div className='flex flex-col'>
						<span className='font-medium text-base-content'>{row.original.name}</span>
						{row.original.email && (
							<span className='text-xs text-base-content/60'>{row.original.email}</span>
						)}
					</div>
				</div>
			),
		}),
		columnHelper.accessor('id', {
			header: 'ID',
			size: 80,
			cell: ({ row }) => <span className='font-mono text-sm text-base-content/60'>#{row.original.id}</span>,
		}),
		// Dynamic columns for each price list
		...activePriceLists.map((pl) =>
			columnHelper.display({
				id: `pl-${pl.id}`,
				header: () => (
					<div
						className='flex flex-col items-center'
						title={pl.name}>
						<span className='text-xs truncate max-w-[80px]'>{pl.name}</span>
						<Badge
							variant='neutral'
							size='sm'
							className='mt-1'>
							P{pl.priority}
						</Badge>
					</div>
				),
				size: 100,
				cell: ({ row }) => {
					const isAssigned = row.original.assignedPriceLists.includes(pl.id)
					const isPending = assignMutation.isPending || unassignMutation.isPending

					return (
						<div className='flex justify-center'>
							<Button
								type='button'
								onClick={() =>
									isAssigned
										? handleUnassign(row.original.id, pl.id)
										: handleAssign(row.original.id, pl.id)
								}
								disabled={isPending}
								variant={isAssigned ? 'success' : 'ghost'}
								size='sm'
								loading={isPending}
								className={`btn-circle ${
									isAssigned
										? 'hover:btn-error'
										: 'border border-dashed border-base-300 hover:btn-primary'
								}`}
								title={isAssigned ? `Remove from ${pl.name}` : `Add to ${pl.name}`}
								leftIcon={
									isPending ? undefined : isAssigned ? (
										<CheckCircle className='h-4 w-4' />
									) : (
										<Plus className='h-4 w-4' />
									)
								}
								contentDrivenHeight
							/>
						</div>
					)
				},
			})
		),
	]

	const isLoading = priceListsLoading || customersLoading
	const hasSelection = selectedCustomers.size > 0

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-success/10'>
						<Users className='h-5 w-5 text-success' />
					</div>
					<div>
						<h3 className='font-semibold text-base-content'>Customer Assignment Matrix</h3>
						<p className='text-sm text-base-content/60'>
							Assign price lists to customers for contract pricing
						</p>
					</div>
				</div>
				<Button
					variant='secondary'
					size='sm'
					onClick={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}>
					<RefreshCw className='h-4 w-4 mr-2' />
					Refresh
				</Button>
			</div>

			{/* Search and Bulk Actions */}
			<Card className='border border-base-300 bg-base-100 p-4 shadow-sm'>
				<div className='flex flex-wrap items-center gap-4'>
					{/* Search */}
					<div className='flex-1 min-w-[200px]'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40' />
							<FormInput
								type='text'
								placeholder='Search customers...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
					</div>

					{/* Bulk Actions */}
					{hasSelection && (
						<>
							<div className='flex items-center gap-2'>
								<Badge
									variant='info'
									size='md'>
									{selectedCustomers.size} selected
								</Badge>
							</div>

							<select
								className='select select-bordered select-sm'
								value={bulkPriceListId}
								onChange={(e) => setBulkPriceListId(e.target.value)}>
								<option value=''>Select Price List</option>
								{activePriceLists.map((pl) => (
									<option
										key={pl.id}
										value={pl.id}>
										{pl.name}
									</option>
								))}
							</select>

							<Button
								variant='primary'
								size='sm'
								onClick={handleBulkAssign}
								disabled={!bulkPriceListId || assignMutation.isPending}>
								<Plus className='h-4 w-4 mr-1' />
								Assign
							</Button>

							<Button
								variant='error'
								size='sm'
								onClick={handleBulkUnassign}
								disabled={!bulkPriceListId || unassignMutation.isPending}>
								<Trash2 className='h-4 w-4 mr-1' />
								Remove
							</Button>
						</>
					)}
				</div>
			</Card>

			{/* Matrix Grid */}
			{activePriceLists.length === 0 ? (
				<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
					<div className='text-center py-12'>
						<div className='flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mx-auto mb-4'>
							<AlertCircle className='h-8 w-8 text-warning' />
						</div>
						<h3 className='text-lg font-semibold text-base-content mb-2'>No Active Price Lists</h3>
						<p className='text-base-content/60 mb-4 max-w-md mx-auto'>
							Create and activate price lists before assigning them to customers.
						</p>
					</div>
				</Card>
			) : (
				<RichDataGrid<Customer>
					columns={columns}
					data={filteredCustomers}
					defaultPageSize={20}
					enableGlobalSearch={false} // We have custom search
					searchPlaceholder='Search customers...'
					emptyState={
						<div className='flex flex-col items-center gap-3 py-12'>
							<div className='flex h-16 w-16 items-center justify-center rounded-full bg-base-200'>
								<Users className='h-8 w-8 text-base-content/40' />
							</div>
							<h3 className='text-lg font-semibold text-base-content'>No Customers Found</h3>
							<p className='text-base-content/60 max-w-md text-center'>
								{searchTerm
									? `No customers match "${searchTerm}"`
									: 'No customers available for price list assignment.'}
							</p>
						</div>
					}
					ariaLabel='Customer price list assignment matrix'
				/>
			)}

			{/* Legend */}
			<Card className='border border-base-300 bg-base-100 p-4 shadow-sm'>
				<div className='flex items-center gap-6 text-sm'>
					<span className='font-medium text-base-content'>Legend:</span>
					<div className='flex items-center gap-2'>
						<Button
							variant='success'
							size='xs'
							className='btn-circle'
							leftIcon={<CheckCircle className='h-3 w-3' />}
							contentDrivenHeight
						/>
						<span className='text-base-content/70'>Assigned</span>
					</div>
					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='xs'
							className='btn-circle border border-dashed border-base-300'
							leftIcon={<Plus className='h-3 w-3' />}
							contentDrivenHeight
						/>
						<span className='text-base-content/70'>Not Assigned</span>
					</div>
					<div className='flex items-center gap-2'>
						<Badge
							variant='neutral'
							size='sm'>
							P10
						</Badge>
						<span className='text-base-content/70'>Priority (lower = higher priority)</span>
					</div>
				</div>
			</Card>
		</div>
	)
}
