/**
 * Server-Side Featured Products Fetcher
 * 
 * Fetches featured products for the home page with Next.js 16 Cache Components optimization.
 * Uses `use cache` directive for optimal performance and caching.
 * 
 * **Performance Benefits:**
 * - Products are fetched at build time / request time on the server
 * - Results are cached and shared across all users
 * - Reduces TTFB (Time to First Byte) for home page
 * - No client-side JavaScript needed for initial data fetch
 * 
 * @module store/server/fetchFeaturedProducts
 */

import 'server-only'
import { cacheTag, cacheLife } from 'next/cache'
import { logger } from '@_core'
import { HttpService } from '@_shared/services/httpService'
import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { PRODUCT_API_INCLUDES, FEATURED_PRODUCTS_COUNT } from '../constants'
import type { SerializedProduct } from '../types'

/**
 * Fetches featured products for the home page with server-side caching.
 * 
 * Uses `use cache` directive for Next.js 16 Cache Components optimization.
 * Products are cached for 1 hour since featured inventory doesn't change frequently.
 * 
 * **Cache Strategy:**
 * - Tagged with 'featured-products' and 'store-products' for granular invalidation
 * - Cache lifetime: 1 hour (products change infrequently)
 * - Uses public API endpoint (no auth required) for maximum cache efficiency
 * 
 * @returns Promise<SerializedProduct[]> Array of serialized featured products
 * 
 * @example
 * ```tsx
 * // In a Server Component:
 * const featuredProducts = await fetchFeaturedProducts()
 * return <ProductsCarousel initialProducts={featuredProducts} />
 * ```
 */
export async function fetchFeaturedProducts(): Promise<SerializedProduct[]> {
	'use cache'
	
	cacheTag('featured-products', 'store-products')
	cacheLife('hours') // Cache for 1 hour
	
	try {
		logger.info('🏠 Fetching featured products (server-side cached)', {
			count: FEATURED_PRODUCTS_COUNT,
		})
		
		// Create search filter for featured products
		// Sort by creation date (newest first) to show latest inventory
		const filter = new GenericSearchFilter({
			page: 1,
			pageSize: FEATURED_PRODUCTS_COUNT,
			includes: [...PRODUCT_API_INCLUDES],
			sortBy: 'createdAt',
			sortOrder: 'desc',
		})
		
		// Use public endpoint for caching (no auth required)
		const response = await HttpService.postPublic<{
			data: SerializedProduct[]
			total: number
			page: number
			pageSize: number
		}>('/Products/search/public', filter)
		
		if (!response.data.payload || response.data.statusCode !== 200) {
			logger.error('[fetchFeaturedProducts] API error', {
				message: response.data.message,
				statusCode: response.data.statusCode,
			})
			return []
		}
		
		// Return serialized products (plain objects for client component props)
		const products = response.data.payload.data.map((product) => ({
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
			sku: product.sku,
			stock: product.stock,
			category: product.category,
			categoryIds: product.categoryIds,
			manufacturer: product.manufacturer,
			providerId: product.providerId,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			images: product.images,
			files: product.files,
			categories: product.categories,
		}))
		
		logger.info('✅ Featured products fetched successfully', {
			count: products.length,
		})
		
		return products
	} catch (error) {
		logger.error('[fetchFeaturedProducts] Failed to fetch', { error })
		return []
	}
}

