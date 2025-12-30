/**
 * @fileoverview Products Infinite Query Hook
 * 
 * MAANG-Level Implementation of Cursor-Based Infinite Scroll:
 * - Uses @tanstack/react-query's useInfiniteQuery for automatic cache management
 * - Incremental data fetching (20 products at a time, not all at once)
 * - Automatic race condition handling (built into React Query)
 * - Background refetching and cache invalidation
 * - Deduplication (multiple components requesting same data share single request)
 * 
 * **Industry Patterns:**
 * - Instagram, Facebook, Twitter all use this exact pattern
 * - Cursor-based pagination (page numbers) for infinite scroll
 * - Data accumulates in cache, virtualizer renders only visible items
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/infinite-queries
 * @module features/store/hooks/useProductsInfiniteQuery
 * @category Data Fetching
 */

'use client'

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'

import { isEmpty } from 'lodash'

import { API } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { PagedResult } from '@_classes/Base/PagedResult'
import { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

import { SORT_OPTIONS } from '@_components/store/ProductsToolbar'

/**
 * Products query page result
 * Contains products array and pagination metadata for each page
 */
export interface ProductsPage {
	/** Products for this page */
	products: Product[]
	/** Pagination result with hasNext, total, etc. */
	result: PagedResult<Product>
	/** Page number (1-based) */
	page: number
}

/**
 * Filter options for product queries
 */
export interface ProductQueryFilters {
	/** Search text for product name */
	searchText?: string
	/** Selected categories to filter by */
	categories?: ProductsCategory[]
	/** Sort option value (maps to SORT_OPTIONS) */
	sortValue?: string
	/** Number of items per page (default: 20) */
	pageSize?: number
}

/**
 * Default page size for infinite scroll
 * 
 * **MAANG Pattern:** 20 items per page is optimal for:
 * - Fast initial load (~200-400KB)
 * - Smooth scroll experience
 * - Good cache utilization
 * - Mobile bandwidth considerations
 */
const DEFAULT_PAGE_SIZE = 20

/**
 * Query key factory for products
 * 
 * **MAANG Pattern:** Structured query keys enable:
 * - Targeted cache invalidation (invalidate all product queries)
 * - Granular invalidation (invalidate specific filter combination)
 * - Cache sharing between components with same filters
 * 
 * @example
 * ```ts
 * // Invalidate all product queries
 * queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
 * 
 * // Invalidate specific filter combination
 * queryClient.invalidateQueries({ queryKey: productQueryKeys.list(filters) })
 * ```
 */
export const productQueryKeys = {
	/** Base key for all product queries */
	all: ['products'] as const,
	
	/** Key for product lists with filters */
	lists: () => [...productQueryKeys.all, 'list'] as const,
	
	/** Key for specific filter combination */
	list: (filters: ProductQueryFilters) => 
		[...productQueryKeys.lists(), filters] as const,
	
	/** Key for single product detail */
	detail: (id: string | number) => 
		[...productQueryKeys.all, 'detail', id] as const,
}

/**
 * Build working search criteria from filters
 * 
 * Transforms filter options into GenericSearchFilter format
 * expected by the backend API.
 * 
 * @param filters - Product query filters
 * @param page - Page number (1-based)
 * @returns GenericSearchFilter for API call
 */
function buildSearchCriteria(
	filters: ProductQueryFilters,
	page: number
): GenericSearchFilter {
	const { searchText, categories, sortValue, pageSize = DEFAULT_PAGE_SIZE } = filters
	
	const criteria = new GenericSearchFilter({
		page,
		pageSize,
		filters: {},
		includes: [],
	})
	
	// Apply search filter
	if (!isEmpty(searchText) && searchText && searchText.length > 2) {
		criteria.add('Name', searchText)
	}
	
	// Apply category filter
	if (categories && categories.length > 0) {
		const categoryIds = categories.map(cat => String(cat.id)).join('|')
		criteria.add('CategorieIds', categoryIds)
	}
	
	// Apply sorting
	const sortOption = SORT_OPTIONS.find(opt => opt.value === sortValue)
	if (sortOption?.field) {
		criteria.sortBy = sortOption.field
		criteria.sortOrder = sortOption.order
	} else {
		// Relevance (default) - no sorting
		criteria.sortBy = null
		criteria.sortOrder = 'asc'
	}
	
	return criteria
}

/**
 * useProductsInfiniteQuery Hook
 * 
 * MAANG-level infinite query hook for product catalog.
 * 
 * **Key Features:**
 * - Automatic caching and deduplication
 * - Race condition handling (built into React Query)
 * - Incremental fetching (20 products at a time)
 * - Background refetching for fresh data
 * - Pagination state managed by React Query
 * 
 * **Performance:**
 * - Initial load: 20 products (~200-400KB)
 * - Subsequent loads: Triggered at 75% scroll
 * - Cache: 5 minutes (fast back navigation)
 * 
 * @param filters - Product query filters
 * @param options - Additional query options
 * @returns Infinite query result with data, fetchNextPage, hasNextPage, etc.
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 *   isLoading,
 * } = useProductsInfiniteQuery({
 *   searchText: 'surgical',
 *   categories: [selectedCategory],
 *   sortValue: 'price-asc',
 * })
 * 
 * // Flatten all pages into single products array
 * const products = data?.pages.flatMap(page => page.products) ?? []
 * ```
 */
export function useProductsInfiniteQuery(
	filters: ProductQueryFilters,
	options?: {
		/** Whether the query is enabled (default: true) */
		enabled?: boolean
		/** Initial data from server-side fetch */
		initialData?: InfiniteData<ProductsPage>
	}
) {
	const { enabled = true, initialData } = options ?? {}
	
	return useInfiniteQuery({
		// Structured query key for cache management
		queryKey: productQueryKeys.list(filters),
		
		// Fetch function - called for each page
		queryFn: async ({ pageParam }): Promise<ProductsPage> => {
			const page = pageParam as number
			const criteria = buildSearchCriteria(filters, page)
			
			const { data } = await API.Store.Products.searchPublic(criteria)
			
			// Handle error response
			if (!data.payload || data.statusCode !== 200) {
				throw new Error(data.message ?? 'Failed to fetch products')
			}
			
			// Transform response to Product instances
			const products = data.payload.data.map(
				(product) => new Product(product)
			)
			const result = new PagedResult<Product>(data.payload)
			
			return {
				products,
				result,
				page,
			}
		},
		
		// Start at page 1
		initialPageParam: 1,
		
		// Determine next page parameter
		// Returns undefined when no more pages (stops fetchNextPage)
		getNextPageParam: (lastPage): number | undefined => {
			if (lastPage.result.hasNext) {
				return lastPage.page + 1
			}
			return undefined
		},
		
		// Optional initial data from SSR
		initialData,
		
		// Enable/disable query
		enabled,
		
		// Keep previous data while refetching (prevents flicker)
		placeholderData: (prev) => prev,
	})
}

/**
 * Helper to flatten infinite query data into single products array
 * 
 * @param data - Infinite query data
 * @returns Flattened products array
 * 
 * @example
 * ```tsx
 * const { data } = useProductsInfiniteQuery(filters)
 * const products = flattenProductPages(data)
 * ```
 */
export function flattenProductPages(
	data: InfiniteData<ProductsPage> | undefined
): Product[] {
	if (!data) return []
	return data.pages.flatMap(page => page.products)
}

/**
 * Helper to get total count from infinite query data
 * 
 * @param data - Infinite query data
 * @returns Total product count or 0
 */
export function getTotalProductCount(
	data: InfiniteData<ProductsPage> | undefined
): number {
	if (!data || data.pages.length === 0) return 0
	return data.pages[0].result.total
}

