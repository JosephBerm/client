/**
 * CustomerAssignmentEditor Component
 *
 * Manages customer assignments for a price list.
 * Shows assigned customers and allows adding/removing assignments.
 *
 * **PRD Reference:** prd_pricing_engine.md - US-PRICE-006
 *
 * @module app/pricing/_components/CustomerAssignmentEditor
 */

'use client'

import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { Plus, Trash2, Users, Building2, Calendar } from 'lucide-react'

import { formatDate } from '@_lib/dates'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import { DataGrid } from '@_components/tables'

import { usePriceList, useRemoveCustomerPriceList } from '@_features/pricing'
import type { CustomerAssignment } from '@_classes/Pricing'

// =========================================================================
// TYPES
// =========================================================================

interface CustomerAssignmentEditorProps {
	/** Price List ID */
	priceListId: string
	/** Whether user can edit (Admin only) */
	isAdmin: boolean
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Editor for managing customer assignments to a price list.
 *
 * @param props - Component props
 * @returns CustomerAssignmentEditor component
 */
export default function CustomerAssignmentEditor({ priceListId, isAdmin }: CustomerAssignmentEditorProps) {
	const [showAddModal, setShowAddModal] = useState(false)

	const { data: priceList, isLoading } = usePriceList(priceListId)
	const removeMutation = useRemoveCustomerPriceList()

	const customers = priceList?.customers ?? []

	// ---------------------------------------------------------------------------
	// HANDLERS
	// ---------------------------------------------------------------------------

	const handleRemove = async (customer: CustomerAssignment) => {
		if (!confirm(`Remove "${customer.customerName}" from this price list?`)) {
			return
		}

		try {
			await removeMutation.mutateAsync({
				customerId: customer.customerId,
				priceListId,
			})
		} catch (err) {
			// Error handled by mutation
		}
	}

	// ---------------------------------------------------------------------------
	// RENDER: LOADING
	// ---------------------------------------------------------------------------

	if (isLoading) {
		return (
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm animate-pulse'>
				<div className='h-6 w-32 bg-base-300 rounded mb-4' />
				<div className='space-y-3'>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className='h-16 bg-base-200 rounded'
						/>
					))}
				</div>
			</Card>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: EMPTY
	// ---------------------------------------------------------------------------

	if (customers.length === 0) {
		return (
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
				<div className='text-center py-12'>
					<div className='flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-4'>
						<Users className='h-8 w-8 text-success' />
					</div>
					<h3 className='text-lg font-semibold text-base-content mb-2'>No Customers Assigned</h3>
					<p className='text-base-content/60 mb-6 max-w-md mx-auto'>
						Assign customers to this price list so they receive contract pricing when viewing products and
						placing orders.
					</p>
					{isAdmin && (
						<Button
							variant='primary'
							onClick={() => setShowAddModal(true)}>
							<Plus className='h-4 w-4 mr-2' />
							Assign Customer
						</Button>
					)}
				</div>
			</Card>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: CUSTOMERS TABLE
	// ---------------------------------------------------------------------------

	return (
		<Card className='border border-base-300 bg-base-100 shadow-sm overflow-hidden'>
			{/* Header */}
			<div className='flex items-center justify-between p-4 border-b border-base-200'>
				<div>
					<h3 className='font-semibold text-base-content'>Assigned Customers</h3>
					<p className='text-sm text-base-content/60'>{customers.length} customers</p>
				</div>
				{isAdmin && (
					<Button
						variant='primary'
						size='sm'
						onClick={() => setShowAddModal(true)}>
						<Plus className='h-4 w-4 mr-2' />
						Assign Customer
					</Button>
				)}
			</div>

			{/* Table */}
			<div className='overflow-x-auto'>
				<CustomerAssignmentDataGrid
					customers={customers}
					isAdmin={isAdmin}
					onRemove={handleRemove}
					isRemoving={removeMutation.isPending}
				/>
			</div>

			{/* Add Modal Placeholder */}
			{/* TODO: Implement AssignCustomerModal with customer search */}
		</Card>
	)
}

// =========================================================================
// DATA GRID COMPONENT
// =========================================================================

interface CustomerAssignmentDataGridProps {
	customers: CustomerAssignment[]
	isAdmin: boolean
	onRemove: (customer: CustomerAssignment) => void
	isRemoving: boolean
}

/**
 * DataGrid component for displaying customer assignments - mobile-first responsive
 */
function CustomerAssignmentDataGrid({ customers, isAdmin, onRemove, isRemoving }: CustomerAssignmentDataGridProps) {
	const columns = useMemo<ColumnDef<CustomerAssignment>[]>(() => {
		const baseColumns: ColumnDef<CustomerAssignment>[] = [
			{
				accessorKey: 'customerName',
				header: 'Customer',
				cell: ({ row }) => {
					const customer = row.original
					return (
						<div className='flex items-center gap-2 sm:gap-3 min-w-0'>
							<div className='flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0'>
								<Building2 className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
							</div>
							<div className='flex flex-col min-w-0'>
								<span className='text-xs sm:text-sm font-medium text-base-content truncate'>
									{customer.customerName}
								</span>
								<span className='text-[10px] sm:text-xs text-base-content/60 truncate'>
									ID: {customer.customerId}
								</span>
							</div>
						</div>
					)
				},
				size: 180,
			},
			{
				accessorKey: 'assignedAt',
				header: 'Assigned',
				cell: ({ row }) => (
					<div className='flex items-center gap-1.5 sm:gap-2 text-base-content/70'>
						<Calendar className='h-3 w-3 sm:h-4 sm:w-4 shrink-0' />
						<span className='text-xs sm:text-sm whitespace-nowrap'>
							{formatDate(row.original.assignedAt, 'short')}
						</span>
					</div>
				),
				size: 120,
			},
		]

		if (isAdmin) {
			baseColumns.push({
				id: 'actions',
				header: '',
				cell: ({ row }) => (
					<div className='text-right'>
						<Button
							variant='ghost'
							size='sm'
							title='Remove Assignment'
							className='text-error hover:bg-error/10 p-1.5 sm:p-2'
							onClick={() => onRemove(row.original)}
							disabled={isRemoving}>
							<Trash2 className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
						</Button>
					</div>
				),
				size: 60,
			})
		}

		return baseColumns
	}, [isAdmin, onRemove, isRemoving])

	return (
		<div className='min-w-[320px]'>
			<DataGrid
				columns={columns}
				data={customers}
				ariaLabel='Customer assignments'
			/>
		</div>
	)
}
