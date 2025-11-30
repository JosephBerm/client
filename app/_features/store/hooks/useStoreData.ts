/**
 * @fileoverview Store Data Fetching Hook
 * 
 * Custom hook for managing product and category data fetching.
 * Centralizes all API calls and request management for the store.
 * 
 * **FAANG Best Practice:**
 * - Separation of concerns (data fetching separate from UI)
 * - Request cancellation and deduplication
 * - Global caching
 * - Explicit dependencies
 * 
 * @module features/store/hooks/useStoreData
 * @category State Management
 */

'use client'

import { useCallback, useRef } from 'react'
import { isEmpty } from 'lodash'

import { API, notificationService } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import { PagedResult } from '@_classes/Base/PagedResult'
import { Product } from '@_classes/Product'
import ProductsCategory, { sanitizeCategoriesList } from '@_classes/ProductsCategory'

import { requestCache, createCacheKey } from '../utils/requestCache'
import { SORT_OPTIONS } from '@_components/store/ProductsToolbar'

/**
 * Optional overrides for product retrieval
 */
export interface RetrievalOverrides {
	search?: string
	categories?: ProductsCategory[]
}

/**
 * Result of product fetch operation
 */
export interface ProductFetchResult {
	products: Product[]
	result: PagedResult<Product>
}

/**
 * Store data hook return type
 */
export interface UseStoreDataReturn {
	/** Fetch categories from API */
	fetchCategories: () => Promise<ProductsCategory[]>
	/** Fetch products based on criteria */
	fetchProducts: (
		criteria: GenericSearchFilter,
		currentSort: string,
		overrides?: RetrievalOverrides
	) => Promise<ProductFetchResult>
	/** Cancel any pending product requests */
	cancelPendingRequests: () => void
}

/**
 * Custom hook for store data fetching
 * 
 * Provides centralized data fetching logic with:
 * - Request cancellation
 * - Global caching
 * - Error handling
 * - Type safety
 * 
 * **Key Improvement:** Separates data fetching from state management
 * This prevents circular dependencies in useEffect hooks
 * 
 * @returns Data fetching functions
 * 
 * @example
 * ```typescript
 * const { fetchCategories, fetchProducts } = useStoreData()
 * 
 * // Fetch categories
 * const categories = await fetchCategories()
 * 
 * // Fetch products
 * const { products, result } = await fetchProducts(criteria, currentSort)
 * ```
 */
export function useStoreData(): UseStoreDataReturn {
	// Request cancellation refs
	const pendingRequestRef = useRef<AbortController | null>(null)
	const lastRequestKeyRef = useRef<string>('')

	/**
	 * Fetches product categories from API with global cache deduplication
	 */
	const fetchCategories = useCallback(async (): Promise<ProductsCategory[]> => {
		const cacheKey = createCacheKey('/Products/categories/clean')

		return requestCache.execute(
			cacheKey,
			async (signal) => {
				try {
					const { data } = await API.Store.Products.getAllCategories()

					if (signal?.aborted) {
						return []
					}

					if (!data.payload || data.statusCode !== 200) {
						notificationService.error(data.message ?? 'Unable to load categories', {
							metadata: { statusCode: data.statusCode },
							component: 'useStoreData',
							action: 'fetchCategories',
						})
						return []
					}

					const categoryInstances = data.payload.map(
						(category: Partial<ProductsCategory>) => new ProductsCategory(category)
					)
					return sanitizeCategoriesList(categoryInstances)
				} catch (err) {
					if (signal?.aborted) {
						return []
					}

					const message = err instanceof Error 
						? err.message 
						: 'An unexpected error occurred while loading categories'
					
					notificationService.error(message, {
						metadata: { error: err },
						component: 'useStoreData',
						action: 'fetchCategories',
					})
					throw err
				}
			},
			{
				component: 'useStoreData',
				ttl: 5000,
			}
		)
	}, [])

	/**
	 * Fetches products from API based on search criteria
	 * 
	 * **Key Improvement:** Accepts all dependencies as parameters
	 * This eliminates the need for complex useCallback dependencies
	 * and prevents circular dependency issues
	 * 
	 * @param criteria - Search filter with pagination
	 * @param currentSort - Current sort option
	 * @param overrides - Optional search/category overrides
	 * @returns Products and pagination result
	 */
	const fetchProducts = useCallback(async (
		criteria: GenericSearchFilter,
		currentSort: string,
		overrides?: RetrievalOverrides
	): Promise<ProductFetchResult> => {
		try {
			// Create a cache key for request deduplication
			const searchValue = overrides?.search ?? ''
			const categoriesValue = overrides?.categories ?? []
			const categoryIds = categoriesValue.map(c => c.id).sort().join(',')
			const requestKey = `${searchValue}|${categoryIds}|${currentSort}|${criteria.pageSize}`

			// Check if we're already processing this exact request
			if (lastRequestKeyRef.current === requestKey && pendingRequestRef.current) {
				// Request already in progress, wait for it
				return { products: [], result: new PagedResult<Product>() }
			}

			// Cancel any pending request
			if (pendingRequestRef.current) {
				pendingRequestRef.current.abort()
			}

			// Create new abort controller
			const abortController = new AbortController()
			pendingRequestRef.current = abortController
			lastRequestKeyRef.current = requestKey

			// Build working criteria
			const workingCriteria = new GenericSearchFilter({
				...criteria,
				sortBy: criteria.sortBy,
				sortOrder: criteria.sortOrder,
				filters: { ...criteria.filters },
				includes: [...(criteria.includes || [])],
			})

			// Apply search filter
			if (!isEmpty(searchValue) && searchValue.length > 2) {
				workingCriteria.add('Name', searchValue)
			} else {
				workingCriteria.clear('Name')
			}

			// Apply category filter
			if (categoriesValue.length > 0) {
				const categoryIdsFilter = categoriesValue.map((cat) => String(cat.id)).join('|')
				workingCriteria.add('CategorieIds', categoryIdsFilter)
			} else {
				workingCriteria.clear('CategorieIds')
			}

			// Apply sorting
			const sortOption = SORT_OPTIONS.find((opt) => opt.value === currentSort)
			if (sortOption?.field) {
				workingCriteria.sortBy = sortOption.field
				workingCriteria.sortOrder = sortOption.order
			} else {
				// Relevance (default) - no sorting
				workingCriteria.sortBy = null
				workingCriteria.sortOrder = 'asc'
			}

			// Make API call
			const { data } = await API.Store.Products.searchPublic(workingCriteria)

			// Check if request was aborted
			if (abortController.signal.aborted) {
				return { products: [], result: new PagedResult<Product>() }
			}

			// Handle response
			if (!data.payload || data.statusCode !== 200) {
				const message = data.message ?? 'Unable to fetch products'
				notificationService.error(message, {
					metadata: { statusCode: data.statusCode },
					component: 'useStoreData',
					action: 'fetchProducts',
				})
				return { products: [], result: new PagedResult<Product>() }
			}

			const { payload } = data
			const products = payload.data.map((product) => new Product(product))
			const result = new PagedResult<Product>(payload)

			// Clear pending request ref
			if (pendingRequestRef.current === abortController) {
				pendingRequestRef.current = null
			}

			return { products, result }
		} catch (err) {
			const message = err instanceof Error 
				? err.message 
				: 'An unexpected error occurred while loading products'
			
			notificationService.error(message, {
				metadata: { error: err },
				component: 'useStoreData',
				action: 'fetchProducts',
			})

			return { products: [], result: new PagedResult<Product>() }
		}
	}, []) // CRITICAL: Empty dependency array - all values passed as parameters

	/**
	 * Cancel any pending product requests
	 * Useful for cleanup when component unmounts
	 */
	const cancelPendingRequests = useCallback(() => {
		if (pendingRequestRef.current) {
			pendingRequestRef.current.abort()
			pendingRequestRef.current = null
		}
		lastRequestKeyRef.current = ''
	}, [])

	return {
		fetchCategories,
		fetchProducts,
		cancelPendingRequests,
	}
}

