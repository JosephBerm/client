/**
 * CustomersPage Component
 * 
 * Main customer management page displaying all customers in a searchable,
 * sortable, and paginated RichDataGrid. Follows business flow requirements
 * for customer relationship management.
 * 
 * **Architecture:**
 * - Server Component wrapper (Next.js 16+ optimization)
 * - Client-side interactivity via useCustomersPage hook
 * - Modular components for separation of concerns
 * - RichDataGrid with server-side pagination and filtering
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
 * **Migration:** Phase 3.1 - Migrated from ServerDataGrid to RichDataGrid
 * @see RICHDATAGRID_MIGRATION_PLAN.md
 * 
 * @module app/customers
 */

'use client'

import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { Archive, Building2, Plus } from 'lucide-react'

import {
	createCustomerRichColumns,
	CustomerDeleteModal,
	CustomerStatsGrid,
	useCustomersPage,
} from '@_features/customers'
import { Routes } from '@_features/navigation'

import { API } from '@_shared'

import type Company from '@_classes/Company'

import {
	RichDataGrid,
	createColumnId,
	FilterType,
	SortDirection,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'
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
			createCustomerRichColumns({
				canDelete,
				onDelete: openDeleteModal,
			}),
		[canDelete, openDeleteModal]
	)

	// Custom fetcher that includes external filters (archived)
	const fetcher = useCallback(
		async (filter: RichSearchFilter): Promise<RichPagedResult<Company>> => {
			// Build enhanced filter with external filters
			const enhancedFilter: RichSearchFilter = {
				...filter,
			}

			// Add isArchived filter if viewing archived
			if (showArchived && canViewArchived) {
				enhancedFilter.columnFilters = [
					...(filter.columnFilters || []),
					{
						columnId: 'ShowArchived',
						filterType: FilterType.Boolean,
						operator: 'Is',
						value: true,
					},
				]
			}

			const response = await API.Customers.richSearch(enhancedFilter)

			if (response.data?.payload) {
				return response.data.payload
			}

			// Return empty result on error
			return {
				data: [],
				page: 1,
				pageSize: filter.pageSize,
				total: 0,
				totalPages: 0,
				hasNext: false,
				hasPrevious: false,
			}
		},
		[showArchived, canViewArchived]
	)

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
					<RichDataGrid<Company>
						key={`customers-${refreshKey}-${showArchived}`}
						columns={columns}
						fetcher={fetcher}
						defaultPageSize={10}
						defaultSorting={[{ columnId: createColumnId('name'), direction: SortDirection.Ascending }]}
						enableGlobalSearch
						searchPlaceholder="Search customers by name or email..."
						persistStateKey="customers-grid"
						emptyState={
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
