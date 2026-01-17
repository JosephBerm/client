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

import { PackageSearch, Phone, RefreshCw, Search } from 'lucide-react'

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
				data-testid="product-grid"
				className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
			>
				{isLoading && !hasLoaded ? (
					<ProductCardSkeleton count={currentPageSize} />
				) : products.length === 0 ? (
					<EmptyState isFiltered={isFiltered} onClearFilters={onClearFilters} />
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

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
	/** Whether filters are applied */
	isFiltered: boolean
	/** Callback to clear filters */
	onClearFilters: () => void
}

/**
 * Enhanced empty state with B2B-focused messaging
 * 
 * **Business Flow Compliance:**
 * - Encourages contact with sales team (quote-based model)
 * - Provides helpful next steps
 * - Mobile-first responsive design
 */
function EmptyState({ isFiltered, onClearFilters }: EmptyStateProps) {
	if (isFiltered) {
		return (
			<div 
				data-testid="no-results" 
				className="col-span-full rounded-xl border border-dashed border-base-300 bg-base-100 p-8 md:p-12 text-center"
			>
				<div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
					<Search className="w-6 h-6 text-warning" />
				</div>
				<h3 className="text-lg font-semibold text-base-content mb-2">
					No matching products
				</h3>
				<p className="text-sm md:text-base text-base-content/70 mb-6 max-w-md mx-auto">
					We couldn&apos;t find products matching your current filters. 
					Try adjusting your search or filters to find what you need.
				</p>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button 
						variant="primary" 
						size="md" 
						onClick={onClearFilters}
						leftIcon={<RefreshCw className="w-4 h-4" />}
					>
						Clear Filters
					</Button>
				<a href="/contact">
					<Button 
						variant="outline" 
						size="md"
						leftIcon={<Phone className="w-4 h-4" />}
					>
						Contact Sales
					</Button>
				</a>
				</div>
			</div>
		)
	}

	// No products available at all (initial state)
	return (
		<div 
			data-testid="no-results" 
			className="col-span-full rounded-xl border border-dashed border-base-300 bg-base-100 p-8 md:p-12 text-center"
		>
			<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
				<PackageSearch className="w-8 h-8 text-primary" />
			</div>
			<h3 className="text-lg font-semibold text-base-content mb-2">
				Catalog Coming Soon
			</h3>
			<p className="text-sm md:text-base text-base-content/70 mb-2 max-w-md mx-auto">
				Our product catalog is being updated. Contact our sales team for immediate assistance with your medical supply needs.
			</p>
			<p className="text-xs text-base-content/50 mb-6">
				We source from 200+ verified vendors to find the best products for your facility.
			</p>
		<a href="/contact">
			<Button 
				variant="primary" 
				size="md"
				leftIcon={<Phone className="w-4 h-4" />}
			>
				Contact Sales Team
			</Button>
		</a>
		</div>
	)
}

