/**
 * ProvidersPage Component
 * 
 * Main provider/vendor management page displaying all providers in a searchable,
 * sortable, and paginated data grid. Follows business flow requirements
 * for vendor management in the dropshipping model.
 * 
 * **Architecture:**
 * - Client-side interactivity via useProvidersPage hook
 * - Modular components for separation of concerns
 * - Column definitions via createProviderColumns factory
 * 
 * **Business Flow Integration:**
 * - Providers are medical supply vendors
 * - Critical for dropshipping fulfillment model
 * - Sales reps contact providers for pricing
 * - Providers fulfill orders directly to customers
 * 
 * **Status Workflow (Industry Best Practice):**
 * - Active: Available for orders
 * - Suspended: Temporary hold (compliance, performance issues)
 * - Archived: Permanently deactivated
 * 
 * **Access Control:**
 * - Admin: Full CRUD, status management, see all providers
 * - Non-Admin: No access (redirected by middleware)
 * 
 * @module app/providers
 */

'use client'

import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { Archive, Factory, PauseCircle, Plus } from 'lucide-react'

import { Routes } from '@_features/navigation'
import {
	createProviderColumns,
	ProviderDeleteModal,
	ProviderStatsGrid,
	useProvidersPage,
	type ProviderStatusKey,
} from '@_features/providers'

import type Provider from '@_classes/Provider'

import ServerDataGrid from '@_components/tables/ServerDataGrid'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../_components'

/**
 * ProvidersPage - Main provider list page.
 * 
 * Uses the useProvidersPage hook for all business logic.
 * Components are imported from @_features/providers for DRY.
 */
export default function ProvidersPage() {
	const router = useRouter()
	
	// All business logic encapsulated in hook
	const {
		// State
		modal,
		suspendReason,
		setSuspendReason,
		refreshKey,
		statusFilter,
		isDeleting,
		isArchiving,
		isSuspending,
		// Stats
		stats,
		statsLoading,
		// RBAC
		canDelete,
		canManageStatus,
		// Actions
		openDeleteModal,
		openArchiveModal,
		openSuspendModal,
		closeModal,
		handleDelete,
		handleArchive,
		handleSuspend,
		handleActivate,
		setStatusFilter,
	} = useProvidersPage()

	// Column definitions - memoized since they depend on permissions
	const columns = useMemo(
		() =>
			createProviderColumns({
				canDelete,
				canManageStatus,
				onDelete: openDeleteModal,
				onArchive: openArchiveModal,
				onSuspend: openSuspendModal,
				onActivate: handleActivate,
			}),
		[canDelete, canManageStatus, openDeleteModal, openArchiveModal, openSuspendModal, handleActivate]
	)

	// Search filters based on statusFilter
	const searchFilters = useMemo(() => {
		if (statusFilter === 'all') {
			return { ShowArchived: 'true' }
		}
		// Filter by specific status
		return { status: statusFilter }
	}, [statusFilter])

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="Providers"
				description="Manage medical equipment suppliers and vendors"
				actions={
					<Button
						variant="primary"
						onClick={() => router.push(Routes.Providers.create())}
						leftIcon={<Plus className="w-5 h-5" />}
					>
						<span className="hidden sm:inline">Add Provider</span>
						<span className="sm:hidden">Add</span>
					</Button>
				}
			/>

			{/* Stats Summary Grid with Clickable Filters */}
			<ProviderStatsGrid
				stats={stats}
				isLoading={statsLoading}
				selectedFilter={statusFilter}
				onFilterClick={canManageStatus ? setStatusFilter : undefined}
			/>

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body p-3 sm:p-6">
					<ServerDataGrid<Provider>
						key={`providers-${refreshKey}-${statusFilter}`}
						columns={columns}
						endpoint="/providers/search"
						initialPageSize={10}
						initialSortBy="createdAt"
						initialSortOrder="desc"
						filters={searchFilters}
						emptyMessage={
							<EmptyState
								statusFilter={statusFilter}
								onAddProvider={() => router.push(Routes.Providers.create())}
							/>
						}
						ariaLabel="Providers table"
					/>
				</div>
			</div>

			{/* Delete/Archive/Suspend Modal */}
			<ProviderDeleteModal
				isOpen={modal.isOpen}
				providerName={modal.provider?.name ?? ''}
				mode={modal.mode}
				suspendReason={suspendReason}
				onSuspendReasonChange={setSuspendReason}
				onClose={closeModal}
				onDelete={handleDelete}
				onArchive={handleArchive}
				onSuspend={handleSuspend}
				isDeleting={isDeleting}
				isArchiving={isArchiving}
				isSuspending={isSuspending}
			/>
		</>
	)
}

/**
 * Empty state component for when no providers are found.
 */
interface EmptyStateProps {
	statusFilter: ProviderStatusKey | 'all'
	onAddProvider: () => void
}

function EmptyState({ statusFilter, onAddProvider }: EmptyStateProps) {
	const getEmptyMessage = () => {
		switch (statusFilter) {
			case 'active':
				return {
					icon: <Factory size={48} className="text-base-content/30" />,
					title: 'No active providers',
					description: 'Add a new provider or activate an existing one',
				}
			case 'suspended':
				return {
					icon: <PauseCircle size={48} className="text-base-content/30" />,
					title: 'No suspended providers',
					description: 'Providers that are temporarily on hold will appear here',
				}
			case 'archived':
				return {
					icon: <Archive size={48} className="text-base-content/30" />,
					title: 'No archived providers',
					description: 'Providers that have been deactivated will appear here',
				}
			default:
				return {
					icon: <Factory size={48} className="text-base-content/30" />,
					title: 'No providers found',
					description: 'Add your first provider to get started',
				}
		}
	}

	const { icon, title, description } = getEmptyMessage()
	const showAddButton = statusFilter === 'all' || statusFilter === 'active'

	return (
		<div className="flex flex-col items-center gap-3 py-8">
			{icon}
			<p className="text-base-content/60 font-medium">{title}</p>
			<p className="text-sm text-base-content/40">{description}</p>
			{showAddButton && (
				<Button
					variant="primary"
					size="sm"
					onClick={onAddProvider}
					leftIcon={<Plus size={16} />}
				>
					Add First Provider
				</Button>
			)}
		</div>
	)
}
