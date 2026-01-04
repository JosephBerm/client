/**
 * Internal Store Page (Product Catalog Management)
 *
 * Admin-only page for managing the medical supply product catalog.
 * Displays products in a searchable, sortable, and paginated RichDataGrid.
 *
 * **Architecture:**
 * - Uses useInternalStorePage hook for all business logic
 * - Modular components from @_features/internalStore
 * - Column definitions via createProductRichColumns factory
 * - Mobile-first responsive design
 * - RichDataGrid with server-side pagination, sorting, filtering
 *
 * **Business Flow Integration:**
 * - Products are the foundation of the quote-based ordering system
 * - Admin maintains catalog → Customers browse → Add to cart → Submit quote
 * - Product prices inform quote generation (vendor cost + markup)
 *
 * **Access Control (per RBAC_ARCHITECTURE.md):**
 * - Admin: Full CRUD, archive/restore, view stats
 * - Non-Admin: No access (redirected by middleware)
 *
 * **Features:**
 * - RichDataGrid with global search, sorting, and column filters
 * - Server-side paginated product list with faceted filtering
 * - Product statistics dashboard
 * - Archive/restore functionality
 * - Low stock and out-of-stock indicators
 * - Category badges with faceted multi-select filter (AND logic)
 * - Quick actions (view, archive, delete)
 *
 * **Migration:** Phase 2.1 - Migrated from ServerDataGrid to RichDataGrid
 * @see RICHDATAGRID_MIGRATION_PLAN.md
 *
 * @module app/store
 */

'use client'

// Note: React Compiler (enabled in next.config.mjs) auto-memoizes
// No need for manual useMemo/useCallback

import { useRouter } from 'next/navigation'

import { Archive, Package, Plus } from 'lucide-react'

import {
	createProductRichColumns,
	ProductDeleteModal,
	ProductStatsGrid,
	useInternalStorePage,
	PRODUCT_API_INCLUDES,
} from '@_features/internalStore'
import { Routes } from '@_features/navigation'

import { API, usePermissions } from '@_shared'

import type { Product } from '@_classes/Product'

import { RichDataGrid, FilterType, SortDirection, createColumnId } from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../_components'

/**
 * InternalStorePage - Main product catalog management page.
 *
 * Uses the useInternalStorePage hook for all business logic.
 * Components are imported from @_features/internalStore for DRY.
 *
 * Category filtering is now handled directly in the RichDataGrid via
 * faceted column filters (Categories column header). No external dropdown needed.
 */
export default function InternalStorePage() {
	const router = useRouter()

	// RBAC: Check if user can see cost field
	const { isSalesRepOrAbove } = usePermissions()

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
		openArchiveModal,
		closeModal,
		handleDelete,
		handleArchive,
		handleRestore,
		toggleShowArchived,
	} = useInternalStorePage()

	// Column definitions - React Compiler auto-memoizes based on dependencies
	const columns = createProductRichColumns({
		canDelete,
		showCost: isSalesRepOrAbove, // Only show cost to SalesRep+
		onDelete: openDeleteModal,
		onArchive: openArchiveModal,
		onRestore: handleRestore,
	})

	/**
	 * Custom fetcher that includes archive filter.
	 * React Compiler auto-memoizes based on captured variables.
	 * Category filtering is handled by RichDataGrid's column filters (faceted).
	 */
	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<Product>> => {
		// Build the enhanced filter with includes and archive filter
		const enhancedFilter: RichSearchFilter = {
			...filter,
			includes: [...PRODUCT_API_INCLUDES],
		}

		// Add isArchived filter if viewing archived
		if (showArchived && canViewArchived) {
			enhancedFilter.columnFilters = [
				...(filter.columnFilters || []),
				{
					columnId: 'isArchived',
					filterType: FilterType.Boolean,
					operator: 'Is',
					value: true,
				},
			]
		}

		const response = await API.Store.Products.richSearch(enhancedFilter)

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
	}

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title="Products"
				description="Manage your medical equipment inventory and product catalog"
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

						{/* Add Product Button */}
						<Button
							variant="primary"
							onClick={() => router.push(Routes.InternalStore.create())}
							leftIcon={<Plus className="w-5 h-5" />}
						>
							<span className="hidden sm:inline">Add Product</span>
							<span className="sm:hidden">Add</span>
						</Button>
					</div>
				}
			/>

			{/* Stats Summary Grid */}
			<ProductStatsGrid
				stats={stats}
				isLoading={statsLoading}
				showArchived={showArchived}
			/>

			{/* Data Grid Card */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body p-3 sm:p-6">
					<RichDataGrid<Product>
						columns={columns}
						fetcher={fetcher}
						filterKey={`${refreshKey}-${showArchived}`}
						defaultPageSize={10}
						defaultSorting={[{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending }]}
						enableGlobalSearch
						enableColumnFilters
						searchPlaceholder="Search products by name..."
						persistStateKey="products-grid"
						emptyState={
							<EmptyState
								showArchived={showArchived}
								onAddProduct={() => router.push(Routes.InternalStore.create())}
							/>
						}
						ariaLabel="Products table"
					/>
				</div>
			</div>

			{/* Delete/Archive Modal */}
			<ProductDeleteModal
				isOpen={deleteModal.isOpen}
				productName={deleteModal.product?.name ?? ''}
				mode={deleteModal.mode}
				onClose={closeModal}
				onDelete={handleDelete}
				onArchive={handleArchive}
				isDeleting={isDeleting}
				isArchiving={isArchiving}
			/>
		</>
	)
}

/**
 * Empty state component for when no products are found.
 * Provides contextual messaging based on whether viewing archived items.
 * Note: Filter-based empty states are handled by RichDataGrid's built-in empty state.
 */
interface EmptyStateProps {
	showArchived: boolean
	onAddProduct: () => void
}

function EmptyState({ showArchived, onAddProduct }: EmptyStateProps) {
	// Archived products view
	if (showArchived) {
		return (
			<div className="flex flex-col items-center gap-3 py-12">
				<Archive size={48} className="text-base-content/30" />
				<p className="text-base-content/60 text-center">
					No archived products found
				</p>
				<p className="text-sm text-base-content/40 text-center max-w-sm">
					Archived products are hidden from the public store but can be restored anytime.
				</p>
			</div>
		)
	}

	// Default empty state - no products at all
	return (
		<div className="flex flex-col items-center gap-3 py-12">
			<Package size={48} className="text-base-content/30" />
			<p className="text-base-content/60 text-center">
				No products in the catalog
			</p>
			<p className="text-sm text-base-content/40 text-center max-w-sm">
				Start building your medical supply catalog by adding your first product.
			</p>
			<Button
				variant="primary"
				size="sm"
				onClick={onAddProduct}
				leftIcon={<Plus size={16} />}
				className="mt-2"
			>
				Add First Product
			</Button>
		</div>
	)
}
