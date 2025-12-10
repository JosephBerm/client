/**
 * @fileoverview Store Product Grid Component
 * 
 * Grid component for displaying products with loading states,
 * empty states, and pagination controls.
 * 
 * **FAANG Best Practice:**
 * - Single responsibility (product display only)
 * - Declarative component interface
 * - Separation of concerns
 * 
 * @module components/store/StoreProductGrid
 * @category Components
 */

'use client'

import type { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

import PaginationControls from '@_components/store/PaginationControls'
import ProductCard from '@_components/store/ProductCard'
import ProductCardSkeleton from '@_components/store/ProductCardSkeleton'
import ScrollRevealCard from '@_components/store/ScrollRevealCard'
import Button from '@_components/ui/Button'

export interface StoreProductGridProps {
	/** Products to display */
	products: Product[]
	/** Pagination result metadata */
	productsResult: PagedResult<Product>
	/** Search criteria for grid key */
	searchCriteria: GenericSearchFilter
	/** Loading state */
	isLoading: boolean
	/** Has data been loaded */
	hasLoaded: boolean
	/** Are any filters applied */
	isFiltered: boolean
	/** Current page size */
	currentPageSize: number
	/** Number of images to prioritize */
	priorityImageCount: number
	/** Callback to clear all filters */
	onClearFilters: () => void
	/** Callback when category tag is clicked */
	onCategoryFilter: (category: ProductsCategory) => void
	/** Callback for page change */
	onPageChange: (page: number) => void
}

/**
 * Store product grid with loading and empty states
 * 
 * Handles:
 * - Product display in responsive grid
 * - Skeleton loading state
 * - Empty state (no products)
 * - Filtered empty state
 * - Pagination controls
 * - Scroll reveal animations
 * 
 * @component
 */
export default function StoreProductGrid({
	products,
	productsResult,
	searchCriteria,
	isLoading,
	hasLoaded,
	isFiltered,
	currentPageSize,
	priorityImageCount,
	onClearFilters,
	onCategoryFilter,
	onPageChange,
}: StoreProductGridProps) {
	const totalResults = productsResult.total || products.length
	const displayedCount = products.length

	return (
		<main className="flex-1 min-w-0">
			{/* Products Grid - Responsive breakpoints optimized for card size */}
			{/* Key prop ensures animation state resets when products change (filtering, pagination, search) */}
			<div 
				key={`products-grid-${products.length}-${searchCriteria.page}`} 
				className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
			>
				{isLoading && !hasLoaded ? (
					<ProductCardSkeleton count={currentPageSize} />
				) : products.length === 0 ? (
					<div className="col-span-full rounded-xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
						<p className="text-lg font-semibold text-base-content">No products found</p>
						<p className="mt-2 text-base text-base-content/70">
							{isFiltered
								? 'No products match the current filters. Try adjusting your search or filters.'
								: 'Products will appear here once available.'}
						</p>
						{isFiltered && (
							<Button variant="primary" size="sm" onClick={onClearFilters} className="mt-4">
								Reset Filters
							</Button>
						)}
					</div>
				) : (
					products.map((product, index) => {
						// Ensure product.id is a valid string for the key
						const productId = String(product.id)
						
						// Validate product object
						if (!product || typeof product !== 'object') {
							return null
						}
						
						/**
						 * ScrollRevealCard wrapper for elegant animations
						 * 
						 * RESTORED: The root cause of the Next.js 15 "async Client Component" 
						 * error was fixed in ImagePlaceholder.tsx (removed erroneous async keyword).
						 * 
						 * ScrollRevealCard provides:
						 * - Intersection Observer based reveal animations
						 * - Row-aware staggered animations (FAANG pattern)
						 * - Respects prefers-reduced-motion
						 * - GPU-accelerated smooth transitions
						 */
						return (
							<ScrollRevealCard
								key={productId}
								index={index}
								staggerDelay={50}
								enabled={true}
							>
								<ProductCard
									product={product}
									priority={index < priorityImageCount}
									onCategoryFilter={onCategoryFilter}
								/>
							</ScrollRevealCard>
						)
					}).filter(Boolean)
				)}
			</div>

			{/* Pagination Controls - Always centered */}
			{products.length > 0 && productsResult.totalPages > 1 && (
				<div className="mt-8 w-full flex justify-center">
					<PaginationControls
						currentPage={searchCriteria.page}
						totalPages={productsResult.totalPages || 1}
						totalItems={totalResults}
						displayedItems={displayedCount}
						isLoading={isLoading}
						onPageChange={onPageChange}
						showJumpToPage={productsResult.totalPages >= 50}
					/>
				</div>
			)}
		</main>
	)
}

