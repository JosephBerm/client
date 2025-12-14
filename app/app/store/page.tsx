/**
 * Internal Store Page (Product Catalog Management)
 * 
 * Admin-only page for managing the medical supply product catalog.
 * Displays products in a searchable, sortable, and paginated data grid.
 * 
 * **Architecture:**
 * - Uses useInternalStorePage hook for all business logic
 * - Modular components from @_features/internalStore
 * - Column definitions via createProductColumns factory
 * - Mobile-first responsive design
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
 * - Server-side paginated product list
 * - Product statistics dashboard
 * - Archive/restore functionality
 * - Low stock and out-of-stock indicators
 * - Category badges
 * - Quick actions (view, archive, delete)
 * 
 * @module app/store
 */

'use client'

import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { Archive, Package, Plus } from 'lucide-react'

import {
	createProductColumns,
	ProductDeleteModal,
	ProductStatsGrid,
	useInternalStorePage,
	PRODUCT_API_INCLUDES,
} from '@_features/internalStore'
import { Routes } from '@_features/navigation'

import type { Product } from '@_classes/Product'

import ServerDataGrid from '@_components/tables/ServerDataGrid'
import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../_components'

/**
 * InternalStorePage - Main product catalog management page.
 * 
 * Uses the useInternalStorePage hook for all business logic.
 * Components are imported from @_features/internalStore for DRY.
 */
export default function InternalStorePage() {
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
		openArchiveModal,
		closeModal,
		handleDelete,
		handleArchive,
		handleRestore,
		toggleShowArchived,
	} = useInternalStorePage()

	// Column definitions - memoized since they depend on permissions
	const columns = useMemo(
		() =>
			createProductColumns({
				canDelete,
				onDelete: openDeleteModal,
				onArchive: openArchiveModal,
				onRestore: handleRestore,
			}),
		[canDelete, openDeleteModal, openArchiveModal, handleRestore]
	)

	// Search filters based on showArchived state
	const searchFilters = useMemo(() => {
		const filters: Record<string, unknown> = {
			includes: PRODUCT_API_INCLUDES,
		}
		if (showArchived && canViewArchived) {
			filters.isArchived = true
		}
		return filters
	}, [showArchived, canViewArchived])

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
					<ServerDataGrid<Product>
						key={`products-${refreshKey}-${showArchived}`}
						columns={columns}
						endpoint="/products/search"
						initialPageSize={10}
						initialSortBy="createdAt"
						initialSortOrder="desc"
						filters={searchFilters}
						emptyMessage={
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
 */
interface EmptyStateProps {
	showArchived: boolean
	onAddProduct: () => void
}

function EmptyState({ showArchived, onAddProduct }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-3 py-12">
			{showArchived ? (
				<>
					<Archive size={48} className="text-base-content/30" />
					<p className="text-base-content/60 text-center">
						No archived products found
					</p>
					<p className="text-sm text-base-content/40 text-center max-w-sm">
						Archived products are hidden from the public store but can be restored anytime.
					</p>
				</>
			) : (
				<>
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
				</>
			)}
		</div>
	)
}
