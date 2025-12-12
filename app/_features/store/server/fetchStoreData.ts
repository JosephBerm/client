/**
 * @fileoverview Server-Side Store Data Fetching with Cache Components
 * 
 * Server-side data fetching functions for the store catalog page.
 * Uses Next.js 16 Cache Components (`"use cache"`) for maximum performance.
 * 
 * **Architecture (MAANG Best Practice):**
 * 
 * 1. **Public Data = Cacheable**
 *    - Product catalog, categories, product details
 *    - Uses `HttpService.postPublic/getPublic` (no cookies access)
 *    - Works with `"use cache"` directive
 *    - Shared cache across ALL users (maximum efficiency)
 * 
 * 2. **Private Data = Not Cacheable**
 *    - User-specific pricing, cart, orders
 *    - Must use authenticated endpoints
 *    - Fetched client-side or with per-user caching
 * 
 * **Benefits:**
 * - SEO: Products in initial HTML
 * - Performance: Cached data, faster TTFB
 * - Scalability: Shared cache reduces server load
 * - URL Shareability: Filtered URLs work on first load
 * 
 * @see https://nextjs.org/docs/app/api-reference/directives/use-cache
 * @module features/store/server
 */

import 'server-only'

import { cacheTag, cacheLife } from 'next/cache'

import { logger } from '@_core'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import ProductsCategory, { sanitizeCategoriesList } from '@_classes/ProductsCategory'

import { INITIAL_PAGE_SIZE, createInitialFilter } from '../constants'
import type {
	SerializedProduct,
	SerializedPagedResult,
	SerializedCategory,
	InitialStoreData,
	StoreSearchParams,
} from '../types'

// Re-export types for convenience
export type {
	SerializedProduct,
	SerializedPagedResult,
	SerializedCategory,
	InitialStoreData,
	StoreSearchParams,
}

/**
 * Sort options mapping for server-side sorting
 * Keys match the values used in ProductsToolbar
 */
const SORT_OPTIONS_MAP: Record<string, { field: string | null; order: 'asc' | 'desc' }> = {
	relevance: { field: null, order: 'asc' },
	priceAsc: { field: 'Price', order: 'asc' },
	priceDesc: { field: 'Price', order: 'desc' },
	nameAsc: { field: 'Name', order: 'asc' },
	nameDesc: { field: 'Name', order: 'desc' },
	dateDesc: { field: 'CreatedAt', order: 'desc' },
	// Also support hyphenated versions for URL compatibility
	'price-asc': { field: 'Price', order: 'asc' },
	'price-desc': { field: 'Price', order: 'desc' },
	'name-asc': { field: 'Name', order: 'asc' },
	'name-desc': { field: 'Name', order: 'desc' },
	'date-desc': { field: 'CreatedAt', order: 'desc' },
}

/**
 * Fetches products from the API server-side with caching.
 * 
 * **Uses Next.js 16 Cache Components for maximum performance.**
 * 
 * This function:
 * - Does NOT access cookies() (uses HttpService.postPublic)
 * - Is compatible with "use cache" directive
 * - Creates a shared cache across all users
 * - Uses cache tags for granular invalidation
 * 
 * @param params - Search parameters from URL
 * @returns Products and pagination result (serialized)
 */
export async function fetchProductsServer(
	params: StoreSearchParams = {}
): Promise<{ products: SerializedProduct[]; result: SerializedPagedResult }> {
	'use cache'
	
	// Cache tags for invalidation
	// - 'store-products': Invalidate all product caches
	// - Search-specific tag: Invalidate this specific search
	const searchKey = [
		params.search ?? '',
		params.categories ?? '',
		params.sort ?? 'relevance',
		params.page ?? '1',
		params.pageSize ?? String(INITIAL_PAGE_SIZE),
	].join('-')
	cacheTag('store-products', `products-search-${searchKey}`)
	
	// Cache for 5 minutes (products can change, but not frequently)
	cacheLife('minutes')
	
	try {
		// Build search filter from URL params
		const page = params.page ? parseInt(params.page, 10) : 1
		const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : INITIAL_PAGE_SIZE
		
		const filter = new GenericSearchFilter({
			...createInitialFilter(),
			page,
			pageSize,
		})
		
		// Apply search filter
		if (params.search && params.search.length > 2) {
			filter.add('Name', params.search)
		}
		
		// Apply category filter
		if (params.categories) {
			filter.add('CategorieIds', params.categories.replace(/,/g, '|'))
		}
		
		// Apply sorting
		const sortOption = params.sort ? SORT_OPTIONS_MAP[params.sort] : null
		if (sortOption?.field) {
			filter.sortBy = sortOption.field
			filter.sortOrder = sortOption.order
		}
		
		// Import API dynamically to avoid bundling issues
		const { API } = await import('@_shared')
		
		// Fetch from API using CACHEABLE method (no cookies access)
		const response = await API.Store.Products.searchPublicCacheable(filter)
		
		if (!response.data.payload || response.data.statusCode !== 200) {
			logger.error('[fetchProductsServer] API error', { message: response.data.message })
			return {
				products: [],
				result: {
					page: 1,
					pageSize,
					total: 0,
					totalPages: 0,
					hasNext: false,
					hasPrevious: false,
					data: [],
				},
			}
		}
		
		const { payload } = response.data
		
		// Serialize products to plain objects
		// Cast to unknown first to avoid type errors, then spread all properties
		// This preserves all API fields while ensuring correct types for required fields
		const products: SerializedProduct[] = payload.data.map((p: unknown) => {
			const product = p as Record<string, unknown>
			return {
				// Spread all original properties from API
				...product,
				// Ensure required fields have correct types
				id: String(product.id ?? ''),
				name: String(product.name ?? ''),
				price: Number(product.price ?? 0),
			}
		})
		
		// Serialize result to plain object
		const result: SerializedPagedResult = {
			page: payload.page,
			pageSize: payload.pageSize,
			total: payload.total,
			totalPages: payload.totalPages,
			hasNext: payload.hasNext,
			hasPrevious: payload.hasPrevious,
			data: products,
		}
		
		return { products, result }
	} catch (error) {
		logger.error('[fetchProductsServer] Error', { error })
		return {
			products: [],
			result: {
				page: 1,
				pageSize: INITIAL_PAGE_SIZE,
				total: 0,
				totalPages: 0,
				hasNext: false,
				hasPrevious: false,
				data: [],
			},
		}
	}
}

/**
 * Recursively serializes a category and its subCategories
 * 
 * @param cat - ProductsCategory instance with potential subCategories
 * @returns Serialized category with nested subCategories
 */
function serializeCategory(cat: ProductsCategory): SerializedCategory {
	return {
		id: cat.id,
		name: cat.name,
		parentCategoryId: cat.parentCategoryId,
		// Recursively serialize subCategories to preserve hierarchy
		subCategories: cat.subCategories?.length 
			? cat.subCategories.map(serializeCategory)
			: undefined,
	}
}

/**
 * Fetches categories from the API server-side with caching.
 * 
 * **Uses Next.js 16 Cache Components for maximum performance.**
 * 
 * Categories change rarely, so we cache for hours.
 * Uses 'store-categories' tag for invalidation when admin updates categories.
 * 
 * @returns Array of product categories (serialized with hierarchy)
 */
export async function fetchCategoriesServer(): Promise<SerializedCategory[]> {
	'use cache'
	
	// Cache tags for invalidation
	cacheTag('store-categories')
	
	// Categories rarely change - cache for 1 hour
	cacheLife('hours')
	
	try {
		// Import API dynamically to avoid bundling issues
		const { API } = await import('@_shared')
		
		// Use CACHEABLE method (no cookies access)
		const response = await API.Store.Products.getCategoriesCacheable()
		
		if (!response.data.payload || response.data.statusCode !== 200) {
			logger.error('[fetchCategoriesServer] API error', { message: response.data.message })
			return []
		}
		
		// Pass full API response to ProductsCategory - it may include nested subCategories
		// The API might return fully populated hierarchy, not flat list with parentCategoryId
		const categoryInstances = response.data.payload.map(
			(category: Partial<ProductsCategory>) => new ProductsCategory(category)
		)
		
		// Check if API already provides hierarchy (subCategories populated)
		const hasPrebuiltHierarchy = categoryInstances.some(c => c.subCategories && c.subCategories.length > 0)
		
		// Only sanitize if we have a flat list (hierarchy not pre-built by API)
		const hierarchicalCategories = hasPrebuiltHierarchy 
			? categoryInstances 
			: sanitizeCategoriesList(categoryInstances)
		
		// Recursively serialize to plain objects (preserves subCategories)
		return hierarchicalCategories.map(serializeCategory)
	} catch (error) {
		logger.error('[fetchCategoriesServer] Error', { error })
		return []
	}
}

/**
 * Fetches all initial store data server-side
 * 
 * Combines products and categories fetch for efficiency.
 * This is the main entry point for server-side data fetching.
 * 
 * All returned data is serialized (plain objects) for safe
 * transfer from Server Component to Client Component.
 * 
 * @param searchParams - URL search parameters
 * @returns Complete initial store data (serialized)
 */
export async function fetchInitialStoreData(
	searchParams: StoreSearchParams = {}
): Promise<InitialStoreData> {
	// Fetch products and categories in parallel
	const [{ products, result }, categories] = await Promise.all([
		fetchProductsServer(searchParams),
		fetchCategoriesServer(),
	])
	
	// Parse search params for client-side hydration
	const parsedParams = {
		search: searchParams.search ?? '',
		categoryIds: searchParams.categories?.split(',').filter(Boolean) ?? [],
		sort: searchParams.sort ?? 'relevance',
		page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
		pageSize: searchParams.pageSize ? parseInt(searchParams.pageSize, 10) : INITIAL_PAGE_SIZE,
	}
	
	return {
		products,
		productsResult: result,
		categories,
		searchParams: parsedParams,
	}
}

