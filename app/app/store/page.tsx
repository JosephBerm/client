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
 * - RichDataGrid with global search and sorting
 * - Server-side paginated product list
 * - Product statistics dashboard
 * - Archive/restore functionality
 * - Low stock and out-of-stock indicators
 * - Category badges
 * - Quick actions (view, archive, delete)
 * 
 * **Migration:** Phase 2.1 - Migrated from ServerDataGrid to RichDataGrid
 * @see RICHDATAGRID_MIGRATION_PLAN.md
 * 
 * @module app/store
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Archive, Filter, Package, Plus, X } from 'lucide-react'

import {
	createProductRichColumns,
	ProductDeleteModal,
	ProductStatsGrid,
	useInternalStorePage,
	PRODUCT_API_INCLUDES,
} from '@_features/internalStore'
import { Routes } from '@_features/navigation'

import { API, usePermissions, flattenCategories } from '@_shared'

import type { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

import { RichDataGrid, FilterType, SortDirection, createColumnId } from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import Select from '@_components/ui/Select'

import { InternalPageHeader } from '../_components'

/**
 * InternalStorePage - Main product catalog management page.
 * 
 * Uses the useInternalStorePage hook for all business logic.
 * Components are imported from @_features/internalStore for DRY.
 */
export default function InternalStorePage() {
	const router = useRouter()
	const [categories, setCategories] = useState<ProductsCategory[]>([])
	const [categoriesLoading, setCategoriesLoading] = useState(true)
	
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
		// Filters
		selectedCategoryId,
		setSelectedCategoryId,
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

	// Fetch categories for filter dropdown
	useEffect(() => {
		const fetchCategories = async () => {
			setCategoriesLoading(true)
			try {
				const { data } = await API.Store.Products.getAllCategories()
				if (data.payload) {
					setCategories(data.payload)
				}
			} catch {
				// Silent fail - categories are optional filter
			} finally {
				setCategoriesLoading(false)
			}
		}
		void fetchCategories()
	}, [])

	// Column definitions - memoized since they depend on permissions
	const columns = useMemo(
		() =>
			createProductRichColumns({
				canDelete,
				showCost: isSalesRepOrAbove, // Only show cost to SalesRep+
				onDelete: openDeleteModal,
				onArchive: openArchiveModal,
				onRestore: handleRestore,
			}),
		[canDelete, isSalesRepOrAbove, openDeleteModal, openArchiveModal, handleRestore]
	)

	// Custom fetcher that includes external filters (category, archived)
	// This allows RichDataGrid's internal filtering to work alongside external filters
	const fetcher = useCallback(
		async (filter: RichSearchFilter): Promise<RichPagedResult<Product>> => {
			// Build the enhanced filter with external filters
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

			// Add category filter if selected
			if (selectedCategoryId !== null) {
				// Note: This requires backend support for category filtering
				// For now, we add it as a facet filter
				enhancedFilter.facetFilters = {
					...(filter.facetFilters || {}),
					categoryId: [String(selectedCategoryId)],
				}
			}

			// DEBUG: Log the API call
			console.log('[Store Page] Fetcher called', {
				page: filter.page,
				showArchived,
				canViewArchived,
				selectedCategoryId,
			})

			const response = await API.Store.Products.richSearch(enhancedFilter)

			// DEBUG: Log the response
			console.log('[Store Page] API response', {
				statusCode: response.data?.statusCode,
				hasPayload: !!response.data?.payload,
				dataLength: response.data?.payload?.data?.length,
				total: response.data?.payload?.total,
			})

			if (response.data?.payload) {
				return response.data.payload
			}

			// Return empty result on error
			console.warn('[Store Page] No payload in response, returning empty result')
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
		[showArchived, canViewArchived, selectedCategoryId]
	)

	// Use shared utility for DRY
	const flatCategories = flattenCategories(categories)

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

			{/* Category Filter Bar */}
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<Filter className="w-4 h-4 text-base-content/50" />
					<span className="text-sm text-base-content/70 font-medium">Filter:</span>
				</div>
				
				{/* Category Dropdown */}
				<Select
					value={selectedCategoryId ?? ''}
					onChange={(e) => setSelectedCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
					options={[
						{ value: '', label: 'All Categories' },
						...flatCategories.map((cat) => ({
							value: cat.id,
							label: `${'—'.repeat(cat.depth)} ${cat.name}`,
						})),
					]}
					size="sm"
					width="md"
					disabled={categoriesLoading}
					aria-label="Filter by category"
				/>

				{/* Clear Filter Button */}
				{selectedCategoryId !== null && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSelectedCategoryId(null)}
						leftIcon={<X className="w-4 h-4" />}
						aria-label="Clear category filter"
					>
						Clear
					</Button>
				)}
			</div>

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
						filterKey={`${refreshKey}-${showArchived}-${selectedCategoryId}`}
						defaultPageSize={10}
						defaultSorting={[{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending }]}
						enableGlobalSearch
						searchPlaceholder="Search products by name..."
						persistStateKey="products-grid"
						emptyState={
							<EmptyState
								showArchived={showArchived}
								hasFilters={selectedCategoryId !== null}
								onAddProduct={() => router.push(Routes.InternalStore.create())}
								onClearFilters={() => setSelectedCategoryId(null)}
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
 * Provides contextual messaging based on whether viewing archived items or filters.
 */
interface EmptyStateProps {
	showArchived: boolean
	hasFilters: boolean
	onAddProduct: () => void
	onClearFilters: () => void
}

function EmptyState({ showArchived, hasFilters, onAddProduct, onClearFilters }: EmptyStateProps) {
	// If filters are active, show filter-related message
	if (hasFilters) {
		return (
			<div className="flex flex-col items-center gap-3 py-12">
				<Filter size={48} className="text-base-content/30" />
				<p className="text-base-content/60 text-center">
					No products match your filters
				</p>
				<p className="text-sm text-base-content/40 text-center max-w-sm">
					Try adjusting your filters or clear them to see all products.
				</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClearFilters}
					leftIcon={<X size={16} />}
					className="mt-2"
				>
					Clear Filters
				</Button>
			</div>
		)
	}

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
