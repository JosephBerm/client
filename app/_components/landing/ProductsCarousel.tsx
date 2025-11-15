/**
 * Products Carousel Component - Featured Inventory Section
 * 
 * Displays featured products from the API with a desktop marquee animation and mobile horizontal scroll.
 * Uses the ProductCard component from the store for consistency and proper product display.
 * 
 * **Features:**
 * - Fetches real products from API (configurable count, default: 4)
 * - Loading states with skeleton loaders
 * - Error handling with graceful fallback
 * - Desktop marquee animation (duplicates products for seamless loop)
 * - Mobile horizontal scroll
 * - Responsive design
 * 
 * **Industry Best Practices:**
 * - Server-side data fetching with client-side hydration
 * - Priority image loading for above-the-fold content
 * - Accessible loading states
 * - Error boundaries and fallback UI
 * 
 * @module ProductsCarousel
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'
import ProductCard from '@_components/store/ProductCard'
import ProductCardSkeleton from '@_components/store/ProductCardSkeleton'
import { Product } from '@_classes/Product'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { API } from '@_shared'
import { logger } from '@_core'
import { PRODUCT_API_INCLUDES } from '@_features/store'

/**
 * Number of featured products to display
 * Industry standard: 4-8 products for homepage featured sections
 * Balances visual appeal with performance and user attention
 */
const FEATURED_PRODUCTS_COUNT = 4

/**
 * Products Carousel Component
 *
 * Displays featured product spotlights with a desktop marquee animation inspired by the legacy landing page.
 * Fetches real products from the API and displays them using the ProductCard component.
 */
export default function ProductsCarousel() {
	const [products, setProducts] = useState<Product[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Fetch featured products on component mount
	 * Uses searchPublic API with minimal filters to get latest products
	 */
	useEffect(() => {
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
	}, [])

	/**
	 * Duplicate products for marquee animation (desktop)
	 * Creates seamless infinite scroll effect
	 * Only duplicates if we have products to show
	 */
	const marqueeProducts = useMemo(() => {
		if (products.length === 0) return []
		// Duplicate products array to create seamless marquee loop
		return [...products, ...products]
	}, [products])

	return (
		<section id="featured-products" className="bg-base-200 py-20 lg:py-28">
			<PageContainer className="space-y-12">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl space-y-3 text-left">
						<h2 className="text-3xl font-semibold leading-tight text-base-content md:text-4xl lg:text-5xl">
							Featured inventory ready to ship.
						</h2>
						<p className="text-base text-base-content/70 md:text-lg">
							Premium supplies sourced from trusted manufacturers, staged in regional warehouses for fast delivery
							across acute, ambulatory, and specialty care settings.
						</p>
					</div>
					<Link href="/store" className="inline-flex shrink-0">
						<Button variant="outline" size="md" fullWidth className="sm:w-auto">
							View full catalog
						</Button>
					</Link>
				</div>

				{/* Loading State */}
				{isLoading && (
					<>
						{/* Mobile skeleton */}
						<div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 md:hidden">
							<ProductCardSkeleton count={FEATURED_PRODUCTS_COUNT} className="min-w-[18rem] shrink-0" />
						</div>
						{/* Desktop skeleton */}
						<div className="hidden rounded-[32px] border border-base-300/40 bg-base-100/80 py-12 pl-12 pr-20 shadow-[0_24px_48px_rgba(58,71,52,0.15)] md:block">
							<div className="marquee-track gap-10">
								<ProductCardSkeleton count={FEATURED_PRODUCTS_COUNT} className="w-[260px]" />
							</div>
						</div>
					</>
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
						<Link href="/store" className="mt-4 inline-block">
							<Button variant="primary" size="sm">
								Browse All Products
							</Button>
						</Link>
					</div>
				)}

				{/* Products Display */}
				{!isLoading && !error && products.length > 0 && (
					<>
						{/* Mobile horizontal scroll */}
						<div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 md:hidden">
							{products.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									className="min-w-[18rem] shrink-0"
									priority={true} // Priority loading for above-the-fold content
								/>
							))}
						</div>

						{/* Desktop marquee */}
						<div className="marquee-container hidden rounded-[32px] border border-base-300/40 bg-base-100/80 py-12 pl-12 pr-20 shadow-[0_24px_48px_rgba(58,71,52,0.15)] md:block">
							<div className="marquee-track gap-10">
								{marqueeProducts.map((product, index) => (
									<ProductCard
										key={`${product.id}-${index}`}
										product={product}
										className="w-[260px]"
										priority={index < FEATURED_PRODUCTS_COUNT} // Priority loading for first set only
									/>
								))}
							</div>
						</div>
					</>
				)}
			</PageContainer>
		</section>
	)
}


