/**
 * Products Carousel Component - Featured Inventory Section
 * 
 * Displays featured products from the API in a responsive grid layout matching the Store page design.
 * Uses the ProductCard component from the store for consistency and proper product display.
 * 
 * **Features:**
 * - Supports server-side pre-fetched products (initialProducts prop) for optimal performance
 * - Falls back to client-side fetching if no initial products provided
 * - Loading states with skeleton loaders
 * - Error handling with graceful fallback
 * - Dynamic responsive grid layout that ensures even row distribution
 * - Mobile-first approach with optimal column calculation based on item count
 * - Max-width constraints prevent cards from stretching too wide
 * - Tighter gaps (24px) for more elegant, compact layouts
 * - Elegant header design with badge, refined typography, and primary CTA button
 * - Subtle background gradient for visual depth
 * - Consistent with Store page design patterns and landing page aesthetics
 * 
 * **Industry Best Practices:**
 * - Server-side data fetching with `use cache` for home page
 * - Client-side hydration with pre-fetched data
 * - Priority image loading for above-the-fold content
 * - Accessible loading states
 * - Error boundaries and fallback UI
 * - Mobile-first responsive design
 * - Dynamic grid calculation (FAANG pattern: Amazon/Shopify approach)
 * - Ensures even row distribution for better visual balance
 * - Max-width constraints for optimal card sizing (prevents oversized cards)
 * - Responsive gap spacing (24px) for elegant, compact layouts
 * 
 * @module ProductsCarousel
 */

'use client'

import { useEffect, useState, useMemo } from 'react'

import Link from 'next/link'

import { ArrowRight } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { PRODUCT_API_INCLUDES, FEATURED_PRODUCTS_COUNT } from '@_features/store'
import type { SerializedProduct } from '@_features/store/types'

import { logger } from '@_core'

import { API } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { Product } from '@_classes/Product'

import PageContainer from '@_components/layouts/PageContainer'
import ProductCard from '@_components/store/ProductCard'
import ProductCardSkeleton from '@_components/store/ProductCardSkeleton'
import Button from '@_components/ui/Button'
import Pill from '@_components/ui/Pill'
import StatusDot from '@_components/ui/StatusDot'

/**
 * Calculate optimal grid columns for even row distribution
 * 
 * FAANG Pattern: Dynamic grid calculation (Amazon/Shopify approach)
 * Ensures cards are evenly distributed across rows for better visual balance.
 * 
 * Logic:
 * - 1 item: 1 column (1 row)
 * - 2 items: 2 columns (1 row, 2 items)
 * - 3 items: 3 columns (1 row, 3 items)
 * - 4 items: 2 columns on tablet (2x2 grid), 4 columns on large screens (1 row, all 4)
 * - 5 items: 3 columns (2 rows: 3+2) or 2 columns (3 rows: 2+2+1) - prefer 2 for evenness
 * - 6 items: 3 columns (2 rows, 3 items each) or 2 columns (3 rows, 2 items each)
 * 
 * @param itemCount - Number of items to display
 * @returns Object with responsive grid column classes
 */
const getOptimalGridClasses = (itemCount: number): { grid: string; maxWidth: string } => {
	// Mobile: always 1 column (mobile-first)
	const mobileCols = 'grid-cols-1'
	let tabletCols = 'md:grid-cols-2'
	let desktopCols = 'xl:grid-cols-3'
	let maxWidth = 'max-w-7xl' // Default max-width for larger grids

	// Calculate optimal columns for tablet and desktop based on item count
	if (itemCount === 1) {
		// Single item: 1 column across all breakpoints, constrained width
		tabletCols = 'md:grid-cols-1'
		desktopCols = 'xl:grid-cols-1'
		maxWidth = 'max-w-md' // Narrower for single item
	} else if (itemCount === 2) {
		// 2 items: 2 columns (1 row, 2 items) - perfect for even distribution
		// Use tighter max-width to prevent cards from being too wide
		tabletCols = 'md:grid-cols-2'
		desktopCols = 'xl:grid-cols-2'
		maxWidth = 'max-w-4xl' // Constrained width for 2-column layout
	} else if (itemCount === 3) {
		// 3 items: 3 columns (1 row, 3 items) - all in one row
		tabletCols = 'md:grid-cols-2' // 2 columns on tablet (2+1)
		desktopCols = 'xl:grid-cols-3' // 3 columns on desktop (all in one row)
		maxWidth = 'max-w-6xl' // Medium width for 3 columns
	} else if (itemCount === 4) {
		// 4 items: Responsive layout
		// - Mobile: 1 column
		// - Tablet/Medium: 2 columns (2x2 grid) - perfect even distribution
		// - Large desktop (xl+): 4 columns (1 row, all 4 items) - takes advantage of wide screens
		tabletCols = 'md:grid-cols-2'
		desktopCols = 'xl:grid-cols-4' // 4 columns on large screens for single-row layout
		maxWidth = 'max-w-7xl' // Wider max-width to accommodate 4 columns
	} else if (itemCount === 5) {
		// 5 items: 2 columns (3 rows: 2+2+1) - prefer 2 for better evenness
		tabletCols = 'md:grid-cols-2'
		desktopCols = 'xl:grid-cols-2' // Better than 3 columns (3+2)
		maxWidth = 'max-w-4xl' // Constrained width for 2-column layout
	} else if (itemCount === 6) {
		// 6 items: 3 columns (2 rows, 3 items each) - perfect even distribution
		tabletCols = 'md:grid-cols-2' // 2 columns on tablet (3 rows, 2 items each)
		desktopCols = 'xl:grid-cols-3' // 3 columns on desktop (2 rows, 3 items each)
		maxWidth = 'max-w-6xl' // Medium width for 3 columns
	} else {
		// 7+ items: Use standard responsive grid
		// Will naturally create even rows where possible
		tabletCols = 'md:grid-cols-2'
		desktopCols = 'xl:grid-cols-3'
		maxWidth = 'max-w-7xl' // Full width for larger grids
	}

	return {
		grid: `${mobileCols} ${tabletCols} ${desktopCols}`,
		maxWidth,
	}
}

/**
 * ProductsCarousel Props
 */
interface ProductsCarouselProps {
	/**
	 * Pre-fetched products from server component (optional).
	 * When provided, skips client-side fetch for better performance.
	 * Should be fetched using `fetchFeaturedProducts()` with `use cache`.
	 */
	initialProducts?: SerializedProduct[]
}

/**
 * Products Carousel Component
 *
 * Displays featured product spotlights in a responsive grid layout.
 * Supports both server-side pre-fetched products and client-side fallback.
 * Matches the Store page grid layout for visual consistency.
 * 
 * @param initialProducts - Pre-fetched products from server (optional)
 */
export default function ProductsCarousel({ initialProducts }: ProductsCarouselProps = {}) {
	// Hydrate initial products into Product instances if provided
	const hydratedInitialProducts = useMemo(() => {
		if (!initialProducts?.length) return undefined
		return initialProducts.map((p) => new Product(p as Partial<Product>))
	}, [initialProducts])

	const [products, setProducts] = useState<Product[]>(hydratedInitialProducts ?? [])
	const [isLoading, setIsLoading] = useState(!hydratedInitialProducts)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetch featured products on component mount (only if not pre-fetched)
	 * Uses searchPublic API with minimal filters to get latest products
	 */
	useEffect(() => {
		// Skip fetch if we have pre-fetched products from server
		if (hydratedInitialProducts?.length) {
			logger.info('🟢 ProductsCarousel: Using server pre-fetched products', {
				count: hydratedInitialProducts.length,
			})
			return
		}

		const fetchFeaturedProducts = async () => {
			setIsLoading(true)
			setError(null)

			try {
				// Create search filter for featured products
				// Sort by creation date (newest first) to show latest inventory
				const criteria = new GenericSearchFilter({
					page: 1,
					pageSize: FEATURED_PRODUCTS_COUNT,
					includes: [...PRODUCT_API_INCLUDES],
					sortBy: 'createdAt',
					sortOrder: 'desc',
				})

				const { data } = await API.Store.Products.searchPublic(criteria)

				if (!data.payload || data.statusCode !== 200) {
					const message = data.message ?? 'Unable to fetch featured products'
					logger.error('ProductsCarousel - Failed to fetch products', {
						error: message,
						statusCode: data.statusCode,
						component: 'ProductsCarousel',
					})
					setError(message)
					setProducts([])
					return
				}

				// Map API response to Product instances
				const fetchedProducts = data.payload.data.map((product: Partial<Product>) => new Product(product))
				setProducts(fetchedProducts)
			} catch (err) {
				const message = err instanceof Error ? err.message : 'An unexpected error occurred while loading featured products'
				logger.error('ProductsCarousel - Error fetching products', {
					error: err,
					component: 'ProductsCarousel',
				})
				setError(message)
				setProducts([])
			} finally {
				setIsLoading(false)
			}
		}

		void fetchFeaturedProducts()
	}, [hydratedInitialProducts])

	/**
	 * Calculate optimal grid classes and max-width based on product count
	 * Ensures even row distribution and prevents cards from being too wide
	 * 
	 * FAANG Pattern: Dynamic layout calculation with responsive constraints
	 * - Tighter gaps (gap-6 = 24px) for more compact, elegant layout
	 * - Max-width constraints prevent cards from stretching too wide
	 * - Centered grid when narrower than container
	 * - Responsive: 2x2 on tablet, 4 columns on large screens (for 4 items)
	 */
	const gridConfig = useMemo(() => {
		if (isLoading) {
			// Use default grid for loading state (matches 4-item layout)
			return {
				gridClasses: 'grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
				maxWidth: 'max-w-7xl',
			}
		}
		const config = getOptimalGridClasses(products.length)
		return {
			gridClasses: `grid gap-6 ${config.grid}`,
			maxWidth: config.maxWidth,
		}
	}, [products.length, isLoading])

	return (
		<section id="featured-products" className="relative overflow-hidden bg-base-200 py-20 lg:py-28">
			{/* Subtle background gradient for depth */}
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 hidden h-[320px] -translate-y-1/2 bg-gradient-to-b from-base-content/3 via-transparent to-transparent blur-3xl md:block"
			/>

			<PageContainer className="relative space-y-12">
				{/* Header Section - Elegant Typography & CTA */}
				<div className="space-y-6">
					{/* Badge Label */}
					<Pill
						tone="primary"
						size="md"
						shadow="sm"
						fontWeight="medium"
						icon={<StatusDot variant="primary" size="sm" animated />}
					>
						Featured inventory
					</Pill>

					{/* Title & Description Grid - Elegant Layout */}
					<div className="lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-10">
						<div className="space-y-4">
							<h2 className="text-3xl font-semibold leading-tight text-base-content md:text-4xl lg:text-5xl">
								Ready to ship.
							</h2>
							<p className="text-base leading-relaxed text-base-content/70 md:text-lg">
								Premium supplies sourced from trusted manufacturers, staged in regional warehouses for fast delivery
								across acute, ambulatory, and specialty care settings.
							</p>
						</div>

						{/* CTA Button - Elegant Placement */}
					<div className="flex justify-start lg:justify-end">
						<Link href={Routes.Store.location} className="inline-flex">
								<Button
									variant="primary"
									size="lg"
									rightIcon={<ArrowRight className="h-5 w-5" />}
									className="w-full sm:w-auto"
								>
									View full catalog
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
						<ProductCardSkeleton count={FEATURED_PRODUCTS_COUNT} />
					</div>
				)}

				{/* Error State */}
				{!isLoading && error && (
					<div className="rounded-xl border border-warning/30 bg-warning/10 p-8 text-center">
						<p className="text-lg font-semibold text-warning">Unable to load featured products</p>
						<p className="mt-2 text-sm text-base-content/70">{error}</p>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && products.length === 0 && (
					<div className="rounded-xl border border-dashed border-base-300 bg-base-100/50 p-8 text-center">
					<p className="text-base text-base-content/70">No featured products available at this time.</p>
					<Link href={Routes.Store.location} className="mt-4 inline-block">
							<Button variant="primary" size="sm">
								Browse All Products
							</Button>
						</Link>
					</div>
				)}

				{/* Products Display - Dynamic Responsive Grid Layout */}
				{/* 
					Grid columns and max-width are calculated dynamically to:
					- Ensure even row distribution
					- Prevent cards from stretching too wide
					- Create elegant, balanced layouts
					- Center the grid when narrower than container
				*/}
				{!isLoading && !error && products.length > 0 && (
					<div className={`${gridConfig.gridClasses} ${gridConfig.maxWidth} mx-auto`}>
						{products.map((product, index) => (
							<ProductCard
								key={product.id}
								product={product}
								priority={index < 3} // Priority loading for above-the-fold images (first 3)
							/>
						))}
					</div>
				)}
			</PageContainer>
		</section>
	)
}


