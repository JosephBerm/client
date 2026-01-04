/**
 * ProvidersPage Component
 * 
 * Main provider/vendor management page displaying all providers in a searchable,
 * sortable, and paginated RichDataGrid. Follows business flow requirements
 * for vendor management in the dropshipping model.
 * 
 * **Architecture:**
 * - Client-side interactivity via useProvidersPage hook
 * - Modular components for separation of concerns
 * - Column definitions via createProviderRichColumns factory
 * - RichDataGrid with server-side pagination and filtering
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
 * **Migration:** Phase 3.2 - Migrated from ServerDataGrid to RichDataGrid
 * @see RICHDATAGRID_MIGRATION_PLAN.md
 * 
 * @module app/providers
 */

'use client'

// Note: React Compiler (enabled in next.config.mjs) auto-memoizes
// No need for manual useMemo/useCallback

import { useRouter } from 'next/navigation'

import { Archive, Download, Factory, PauseCircle, Plus } from 'lucide-react'

import { Routes } from '@_features/navigation'
import {
	createProviderRichColumns,
	ProviderDeleteModal,
	ProviderStatsGrid,
	useProvidersPage,
	type ProviderStatusKey,
} from '@_features/providers'

import { API, notificationService, formatDate } from '@_shared'

import type Provider from '@_classes/Provider'

import {
	RichDataGrid,
	createColumnId,
	FilterType,
	SortDirection,
	BulkActionVariant,
	type BulkAction,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'
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

	// Column definitions - React Compiler auto-memoizes based on dependencies
	const columns = createProviderRichColumns({
		canDelete,
		canManageStatus,
		onDelete: openDeleteModal,
		onArchive: openArchiveModal,
		onSuspend: openSuspendModal,
		onActivate: handleActivate,
	})

	/**
	 * Custom fetcher that includes status filter.
	 * React Compiler auto-memoizes based on captured variables.
	 */
	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<Provider>> => {
		// Build enhanced filter with external status filter
		const enhancedFilter: RichSearchFilter = {
			...filter,
		}

		// Apply status filter from stats grid
		if (statusFilter === 'all') {
			// Show all including archived
			enhancedFilter.columnFilters = [
				...(filter.columnFilters || []),
				{
					columnId: 'ShowArchived',
					filterType: FilterType.Boolean,
					operator: 'Is',
					value: true,
				},
			]
		} else if (statusFilter !== 'active') {
			// Filter by specific status
			enhancedFilter.columnFilters = [
				...(filter.columnFilters || []),
				{
					columnId: 'status',
					filterType: FilterType.Select,
					operator: 'Is',
					value: statusFilter,
				},
			]
		}

		const response = await API.Providers.richSearch(enhancedFilter)

		if (response.data?.payload) {
			return response.data.payload as unknown as RichPagedResult<Provider>
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
	}

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
					<RichDataGrid<Provider>
						columns={columns}
						fetcher={fetcher}
						filterKey={`${refreshKey}-${statusFilter}`}
						defaultPageSize={10}
						defaultSorting={[{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending }]}
						enableGlobalSearch
						enableColumnFilters
						enableRowSelection={canManageStatus}
						enableColumnResizing
						bulkActions={canManageStatus ? [
							{
								id: 'export-csv',
								label: 'Export CSV',
								icon: <Download className="w-4 h-4" />,
								variant: BulkActionVariant.Default,
								onAction: async (rows: Provider[]) => {
									const headers = 'ID,Name,Email,Phone,Status,Created\n'
									const csv = rows.map(r =>
										`${r.id},"${r.name ?? ''}","${r.email ?? ''}","${r.phone ?? ''}",${r.status},"${formatDate(r.createdAt)}"`
									).join('\n')
									const blob = new Blob([headers + csv], { type: 'text/csv' })
									const url = URL.createObjectURL(blob)
									const a = document.createElement('a')
									a.href = url
									a.download = `providers-export-${new Date().toISOString().split('T')[0]}.csv`
									a.click()
									URL.revokeObjectURL(url)
									notificationService.success(`Exported ${rows.length} providers`)
								},
							},
							{
								id: 'suspend-selected',
								label: 'Suspend Selected',
								icon: <PauseCircle className="w-4 h-4" />,
								variant: BulkActionVariant.Warning,
								confirmMessage: (count) => `Are you sure you want to suspend ${count} provider(s)?`,
								onAction: async (rows: Provider[]) => {
									const activeProviders = rows.filter(r => r.status === 0) // Active status
									const promises = activeProviders.map(r => API.Providers.suspend(r.id, 'Bulk suspension'))
									await Promise.all(promises)
									notificationService.success(`Suspended ${activeProviders.length} providers`)
								},
							},
						] satisfies BulkAction<Provider>[] : undefined}
						searchPlaceholder="Search providers by name or email..."
						persistStateKey="providers-grid"
						emptyState={
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
