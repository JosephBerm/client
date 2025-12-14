/**
 * CustomersPage Component
 * 
 * Main customer management page displaying all customers in a searchable,
 * sortable, and paginated data grid. Follows business flow requirements
 * for customer relationship management.
 * 
 * **Architecture:**
 * - Server Component wrapper (Next.js 16+ optimization)
 * - Client-side interactivity via useCustomersPage hook
 * - Modular components for separation of concerns
 * 
 * **Business Flow Integration:**
 * - Displays customer status for lifecycle management
 * - Shows business type for segmentation
 * - Displays primary sales rep for relationship tracking
 * - Links to customer detail for full profile management
 * 
 * **Access Control:**
 * - Admin/SalesManager: See all customers
 * - SalesRep: See only assigned customers (backend filters)
 * - Customer: No access (redirected)
 * - Archive toggle: Admin only
 * - Delete button: Admin only
 * 
 * @module app/customers
 */

'use client'

import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { Archive, Building2, Plus } from 'lucide-react'

import {
	createCustomerColumns,
	CustomerDeleteModal,
	CustomerStatsGrid,
	useCustomersPage,
} from '@_features/customers'
import { Routes } from '@_features/navigation'

import type Company from '@_classes/Company'

import ServerDataGrid from '@_components/tables/ServerDataGrid'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../_components'

/**
 * CustomersPage - Main customer list page.
 * 
 * Uses the useCustomersPage hook for all business logic.
 * Components are imported from @_features/customers for DRY.
 */
export default function CustomersPage() {
	const router = useRouter()
	
	// All business logic encapsulated in hook
	const {
		// State
		deleteModal,
		refreshKey,
		showArchived,
		isDeleting,
		isArchiving,
		// Stats
		stats,
		statsLoading,
		// RBAC
		canDelete,
		canViewArchived,
		// Actions
		openDeleteModal,
		closeDeleteModal,
		handleDelete,
		handleArchive,
		toggleShowArchived,
	} = useCustomersPage()

	// Column definitions - memoized since they depend on canDelete
	const columns = useMemo(
		() =>
			createCustomerColumns({
				canDelete,
				onDelete: openDeleteModal,
			}),
		[canDelete, openDeleteModal]
	)

	// Search filters based on showArchived state
	const searchFilters = useMemo(() => {
		if (showArchived && canViewArchived) {
			return { ShowArchived: 'true' }
		}
		return {}
	}, [showArchived, canViewArchived])

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="Customers"
				description="Manage B2B customer organizations and their purchasing relationships"
				actions={
					<div className="flex items-center gap-2">
						{/* Archive Toggle - Admin Only */}
						{canViewArchived && (
							<Button
								variant={showArchived ? 'secondary' : 'ghost'}
								size="sm"
								onClick={toggleShowArchived}
								leftIcon={<Archive size={16} />}
								aria-pressed={showArchived}
							>
								<span className="hidden sm:inline">
									{showArchived ? 'Showing Archived' : 'Show Archived'}
								</span>
							</Button>
						)}
						
						{/* Add Customer Button */}
						<Button
							variant="primary"
							onClick={() => router.push(Routes.Customers.create())}
							leftIcon={<Plus className="w-5 h-5" />}
						>
							<span className="hidden sm:inline">Add Customer</span>
							<span className="sm:hidden">Add</span>
						</Button>
					</div>
				}
			/>

			{/* Stats Summary Grid */}
			<CustomerStatsGrid
				stats={stats}
				isLoading={statsLoading}
				showArchived={showArchived}
			/>

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body p-3 sm:p-6">
					<ServerDataGrid<Company>
						key={`customers-${refreshKey}-${showArchived}`}
						columns={columns}
						endpoint="/customers/search"
						initialPageSize={10}
						filters={searchFilters}
						emptyMessage={
							<EmptyState
								showArchived={showArchived}
								onAddCustomer={() => router.push(Routes.Customers.create())}
							/>
						}
						ariaLabel="Customers table"
					/>
				</div>
			</div>

			{/* Delete/Archive Modal */}
			<CustomerDeleteModal
				isOpen={deleteModal.isOpen}
				customerName={deleteModal.customer?.name ?? ''}
				onClose={closeDeleteModal}
				onDelete={handleDelete}
				onArchive={handleArchive}
				isDeleting={isDeleting}
				isArchiving={isArchiving}
			/>
		</>
	)
}

/**
 * Empty state component for when no customers are found.
 */
interface EmptyStateProps {
	showArchived: boolean
	onAddCustomer: () => void
}

function EmptyState({ showArchived, onAddCustomer }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-3 py-8">
			{showArchived ? (
				<>
					<Archive size={48} className="text-base-content/30" />
					<p className="text-base-content/60">No archived customers found</p>
				</>
			) : (
				<>
					<Building2 size={48} className="text-base-content/30" />
					<p className="text-base-content/60">No customers found</p>
					<Button
						variant="primary"
						size="sm"
						onClick={onAddCustomer}
						leftIcon={<Plus size={16} />}
					>
						Add First Customer
					</Button>
				</>
			)}
		</div>
	)
}
