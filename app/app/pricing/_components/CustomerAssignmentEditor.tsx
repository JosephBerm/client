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

import { useState } from 'react'

import { Plus, Trash2, Users, Building2, Calendar } from 'lucide-react'

import { formatDate } from '@_lib/dates'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'

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
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-pulse">
				<div className="h-6 w-32 bg-base-300 rounded mb-4" />
				<div className="space-y-3">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="h-16 bg-base-200 rounded" />
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
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
				<div className="text-center py-12">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
						<Users className="h-8 w-8 text-success" />
					</div>
					<h3 className="text-lg font-semibold text-base-content mb-2">No Customers Assigned</h3>
					<p className="text-base-content/60 mb-6 max-w-md mx-auto">
						Assign customers to this price list so they receive contract pricing
						when viewing products and placing orders.
					</p>
					{isAdmin && (
						<Button variant="primary" onClick={() => setShowAddModal(true)}>
							<Plus className="h-4 w-4 mr-2" />
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
		<Card className="border border-base-300 bg-base-100 shadow-sm overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-base-200">
				<div>
					<h3 className="font-semibold text-base-content">Assigned Customers</h3>
					<p className="text-sm text-base-content/60">{customers.length} customers</p>
				</div>
				{isAdmin && (
					<Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Assign Customer
					</Button>
				)}
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="table table-zebra w-full">
					<thead className="bg-base-200/50">
						<tr>
							<th className="text-left">Customer</th>
							<th className="text-left w-40">Assigned</th>
							{isAdmin && <th className="text-right w-24">Actions</th>}
						</tr>
					</thead>
					<tbody>
						{customers.map((customer) => (
							<CustomerRow
								key={customer.customerId}
								customer={customer}
								isAdmin={isAdmin}
								onRemove={handleRemove}
								isRemoving={removeMutation.isPending}
							/>
						))}
					</tbody>
				</table>
			</div>

			{/* Add Modal Placeholder */}
			{/* TODO: Implement AssignCustomerModal with customer search */}
		</Card>
	)
}

// =========================================================================
// ROW COMPONENT
// =========================================================================

interface CustomerRowProps {
	customer: CustomerAssignment
	isAdmin: boolean
	onRemove: (customer: CustomerAssignment) => void
	isRemoving: boolean
}

function CustomerRow({ customer, isAdmin, onRemove, isRemoving }: CustomerRowProps) {
	return (
		<tr>
			{/* Customer */}
			<td>
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<Building2 className="h-5 w-5 text-primary" />
					</div>
					<div className="flex flex-col">
						<span className="font-medium text-base-content">{customer.customerName}</span>
						<span className="text-xs text-base-content/60">ID: {customer.customerId}</span>
					</div>
				</div>
			</td>

			{/* Assigned Date */}
			<td>
				<div className="flex items-center gap-2 text-base-content/70">
					<Calendar className="h-4 w-4" />
					{formatDate(customer.assignedAt, 'short')}
				</div>
			</td>

			{/* Actions */}
			{isAdmin && (
				<td className="text-right">
					<Button
						variant="ghost"
						size="sm"
						title="Remove Assignment"
						className="text-error hover:bg-error/10"
						onClick={() => onRemove(customer)}
						disabled={isRemoving}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</td>
			)}
		</tr>
	)
}
